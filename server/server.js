

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Server and Socket.IO Setup ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity. In production, restrict this to your frontend's URL.
        methods: ["GET", "POST"]
    }
});

// --- Path Configuration for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Navigate up from server/ to the project root to find the 'dist' folder
const distDir = path.join(__dirname, '..', 'dist');


// --- Gemini API Setup ---
const apiKey = process.env.API_KEY;
if (!apiKey) {
    console.error("\n!!! API_KEY environment variable not set. !!!");
    console.error("The server will not be able to generate content for the game.");
    console.error("Please start the server with 'API_KEY=YOUR_KEY_HERE node server.js'\n");
}
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- Game State Management ---

// Defining these here to match client-side constants
const Generation = {
  GenZ: "Gen Z",
  Millennials: "Millennials",
  GenX: "Gen X",
  Boomers: "Boomers",
};

const AI_OPPONENTS = [
  { id: 'ai-genz', name: 'Zoe', generation: Generation.GenZ, isAI: true, region: 'California' },
  { id: 'ai-millennial', name: 'Mike', generation: Generation.Millennials, isAI: true, region: 'New York' },
  { id: 'ai-genx', name: 'Xander', generation: Generation.GenX, isAI: true, region: 'Quebec' },
  { id: 'ai-boomer', name: 'Barbara', generation: Generation.Boomers, isAI: true, region: 'Illinois' },
];

const games = {}; // In-memory store for all active games

const SUBMISSION_TIME = 45;
const VOTING_TIME = 20;
const RESULTS_TIME = 10;

// --- Serve Static Files from 'dist' directory ---
app.use(express.static(distDir));


// --- Main Socket.IO Connection Logic ---
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Store player data associated with this socket
    socket.data.player = null;

    socket.on('playerLogin', (playerData) => {
        socket.data.player = {
            id: socket.id,
            name: playerData.name,
            generation: playerData.generation,
            region: playerData.region,
            isAI: false,
            score: 0,
            hasSubmitted: false,
        };
        console.log(`Player logged in: ${playerData.name} (${socket.id})`);
    });

    socket.on('createGame', ({ isPrivate }) => {
        const gameId = isPrivate ? `PRIVATE-${generateGameCode()}` : `PUBLIC-${generateGameCode()}`;
        const player = socket.data.player;
        if (!player) return;

        games[gameId] = createNewGame(gameId, player.id);
        const game = games[gameId];
        
        // Add AIs to the game.
        const aiPlayers = AI_OPPONENTS.map(p => ({
            ...p,
            id: `${p.id}-${gameId.substring(gameId.length - 4)}`, // Make AI ID unique per game
            score: 0,
            hasSubmitted: false,
        }));
        game.players.push(...aiPlayers);
        
        // Now have the host join the game.
        joinGame(socket, gameId);
    });

    socket.on('joinGame', ({ gameId }) => {
        const fullGameId = Object.keys(games).find(key => key.endsWith(gameId.toUpperCase()));
        if (games[fullGameId]) {
            joinGame(socket, fullGameId);
        } else {
            socket.emit('gameNotFound', `Game with code ${gameId} not found.`);
        }
    });
    
    socket.on('leaveGame', ({ gameId }) => {
        leaveGame(socket, gameId);
    });

    socket.on('startGame', async ({ gameId, difficulty }) => {
        const game = games[gameId];
        if (!game || game.hostId !== socket.id) return;

        game.difficulty = difficulty;
        game.phase = 'GeneratingContent';
        broadcastGameState(gameId);
        
        // Reset scores for a new game
        game.players.forEach(p => p.score = 0);

        if (!ai) {
            console.error("Cannot start game: Gemini AI not initialized.");
            game.phase = 'Lobby';
            broadcastGameState(gameId);
            return;
        }

        try {
            const { theme, acronym } = await generateThemeAndAcronym(difficulty, game.usedThemes);
            game.theme = theme;
            game.acronym = acronym;
            game.usedThemes.push(theme); // Add theme to memory for this session
            
            await startSubmissionPhase(gameId);

        } catch(error) {
            console.error("Error generating theme and acronym:", error);
            game.phase = 'Lobby';
            broadcastGameState(gameId);
        }
    });

    socket.on('submitBackronym', ({ gameId, backronym }) => {
        const game = games[gameId];
        const player = game?.players.find(p => p.id === socket.id);
        if (!player || player.hasSubmitted) return;

        player.hasSubmitted = true;
        game.submissions.push({
            playerId: player.id,
            playerName: player.name,
            backronym,
            votes: [],
        });
        
        const allHumansSubmitted = game.players.filter(p => !p.isAI).every(p => p.hasSubmitted);
        if (allHumansSubmitted) {
            game.timerId && clearTimeout(game.timerId);
            startVotingPhase(gameId);
        } else {
            broadcastGameState(gameId);
        }
    });

    socket.on('castVote', ({ gameId, votedPlayerId }) => {
        const game = games[gameId];
        const submission = game?.submissions.find(s => s.playerId === votedPlayerId);
        const playerHasVoted = game.submissions.some(s => s.votes.includes(socket.id));
        
        if (submission && !playerHasVoted && submission.playerId !== socket.id) {
            submission.votes.push(socket.id);
            broadcastGameState(gameId);
        }
    });
    
    socket.on('playAgain', ({gameId}) => {
        const game = games[gameId];
        if (!game || game.hostId !== socket.id) return;
        
        game.phase = 'Lobby';
        game.acronym = '';
        game.theme = '';
        game.submissions = [];
        game.roundWinnerId = undefined;
        game.players.forEach(p => p.hasSubmitted = false);
        
        broadcastGameState(gameId);
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        const gameId = Object.keys(games).find(id => games[id].players.some(p => p.id === socket.id));
        if (gameId) {
            leaveGame(socket, gameId);
        }
    });
});


// --- Game Logic Functions ---

function createNewGame(gameId, hostId) {
    return {
        id: gameId,
        hostId: hostId,
        players: [],
        phase: 'Lobby',
        acronym: '',
        theme: '',
        submissions: [],
        difficulty: 4,
        roundWinnerId: undefined,
        countdown: 0,
        timerId: null,
        usedThemes: [],
    };
}

function joinGame(socket, gameId) {
    const player = socket.data.player;
    if (!player) return;
    
    const game = games[gameId];
    // Limit of 8 players total (4 human, 4 AI)
    if (game.players.filter(p => !p.isAI).length >= 4 && !game.players.some(p => p.id === player.id)) {
        socket.emit('lobbyFull', 'This lobby is full.');
        return;
    }

    socket.join(gameId);
    // Add player to the game if they are not already in it
    if (!game.players.some(p => p.id === player.id)) {
        if (player.id === game.hostId) {
            game.players.unshift(player); // Host always at the top
        } else {
            game.players.push(player);
        }
    }

    console.log(`${player.name} joined game ${gameId}`);
    broadcastGameState(gameId);
}

function leaveGame(socket, gameId) {
    const game = games[gameId];
    if (!game) return;

    game.players = game.players.filter(p => p.id !== socket.id);
    socket.leave(gameId);

    if (game.players.filter(p => !p.isAI).length === 0) {
        console.log(`Game ${gameId} has no human players, deleting.`);
        game.timerId && clearTimeout(game.timerId);
        delete games[gameId];
    } else {
        if (game.hostId === socket.id) {
            const nextHumanPlayer = game.players.find(p => !p.isAI);
            game.hostId = nextHumanPlayer ? nextHumanPlayer.id : null;
        }
        broadcastGameState(gameId);
    }
}

async function startSubmissionPhase(gameId) {
    const game = games[gameId];
    game.phase = 'Submitting';
    game.submissions = [];
    game.players.forEach(p => p.hasSubmitted = false);

    // --- Generate AI submissions ---
    const aiPlayers = game.players.filter(p => p.isAI);
    const submissionPromises = aiPlayers.map(aiPlayer => 
        generateAiBackronym(game.acronym, game.theme, aiPlayer).then(backronym => ({
            playerId: aiPlayer.id,
            playerName: aiPlayer.name,
            backronym: backronym,
            votes: [],
        }))
    );
    
    const aiSubmissions = await Promise.all(submissionPromises);

    game.submissions.push(...aiSubmissions);
    game.players.forEach(p => {
        if (p.isAI) { p.hasSubmitted = true; }
    });
    // --- End AI submission generation ---
    
    runCountdown(gameId, SUBMISSION_TIME, () => startVotingPhase(gameId));
}

function startVotingPhase(gameId) {
    const game = games[gameId];
    if (game.phase === 'Voting') return;
    
    game.players.forEach(p => {
        if (!game.submissions.some(s => s.playerId === p.id)) {
            game.submissions.push({
                playerId: p.id,
                playerName: p.name,
                backronym: "Didn't submit in time!",
                votes: [],
            });
        }
    });

    game.phase = 'Voting';
    runCountdown(gameId, VOTING_TIME, () => startResultsPhase(gameId));
}

function startResultsPhase(gameId) {
    const game = games[gameId];
    if (!game) return;
    game.phase = 'Results';

    let roundWinner = { playerId: null, maxVotes: -1 };
    game.submissions.forEach(sub => {
        const points = sub.votes.length * 100;
        const player = game.players.find(p => p.id === sub.playerId);
        if (player) {
            player.score += points;
        }
        if (sub.votes.length > roundWinner.maxVotes) {
            roundWinner = { playerId: sub.playerId, maxVotes: sub.votes.length };
        }
    });

    if (roundWinner.playerId) {
        const winnerPlayer = game.players.find(p => p.id === roundWinner.playerId);
        if (winnerPlayer) {
            winnerPlayer.score += 300;
            game.roundWinnerId = winnerPlayer.id;
        }
    }
    
    runCountdown(gameId, RESULTS_TIME, () => {
        game.phase = 'Lobby';
        game.roundWinnerId = undefined;
        game.submissions = [];
        game.players.forEach(p => p.hasSubmitted = false);
        broadcastGameState(gameId);
    });
}


function runCountdown(gameId, duration, onComplete) {
    const game = games[gameId];
    if (!game) return;

    game.timerId && clearTimeout(game.timerId);
    game.countdown = duration;

    const tick = () => {
        if (games[gameId]) { // Ensure game hasn't been deleted
            broadcastGameState(gameId);
            game.countdown--;

            if (game.countdown >= 0) {
                game.timerId = setTimeout(tick, 1000);
            } else {
                onComplete();
            }
        }
    };
    tick();
}


function broadcastGameState(gameId) {
    const game = games[gameId];
    if (game) {
        const { timerId, ...gameState } = game;
        io.to(gameId).emit('gameStateUpdate', gameState);
    }
}

// --- Helper Functions ---

function generateGameCode() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}


// --- Gemini API Functions ---

async function generateThemeAndAcronym(letterCount, usedThemes = []) {
    if (!ai) {
        console.warn("AI not initialized, returning mock theme/acronym.");
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let acronym = '';
        for (let i = 0; i < letterCount; i++) {
            acronym += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        return { theme: "Awkward First Dates", acronym };
    }
    
    const usedThemesString = usedThemes.length > 0 ? `Previously used themes (do not repeat these or similar ideas): [${usedThemes.join(', ')}]` : "This is the first round, no themes used yet.";

    const prompt = `Your task is to generate content for a word game.

1.  **A theme:** This theme must be a funny, relatable situation or trope.
    -   **Constraint 1:** The theme MUST be short, between 2 and 4 words exactly. Do NOT use more than 4 words.
    -   **Constraint 2:** The theme MUST be unique and not similar to themes already used in this game.
    -   ${usedThemesString}

2.  **An acronym:** A single ${letterCount}-letter non-existing acronym. The letters should be varied (e.g., not 'XXXX' or 'QPV' or 'ZXVWY').

**Example of a good theme:** "Awkward First Date"
**Example of a bad theme:** "Thinking about things you would find at a thrift shop"

Respond ONLY with the JSON object that matches the requested schema.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    theme: {
                        type: Type.STRING,
                        description: "A funny, relatable theme, situation, or trope. MUST be between 2 and 4 words. MUST be unique and not similar to themes already used."
                    },
                    acronym: {
                        type: Type.STRING,
                        description: `A single ${letterCount}-letter non-existing acronym. The letters generated MUST NOT be something like "QPV" or "XXXX" or "VZXW".`
                    }
                },
                required: ["theme", "acronym"]
            }
        },
    });

    try {
        const parsedData = JSON.parse(response.text);
        if (parsedData.theme && parsedData.acronym) {
            let acronym = parsedData.acronym.toUpperCase().replace(/[^A-Z]/g, '');
            if (acronym.length !== letterCount) {
                console.warn(`AI generated acronym '${acronym}' has wrong length. Expected ${letterCount}. Using fallback.`);
                const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                let fallbackAcronym = '';
                for (let i = 0; i < letterCount; i++) {
                    fallbackAcronym += letters.charAt(Math.floor(Math.random() * letters.length));
                }
                acronym = fallbackAcronym;
            }
            return { theme: parsedData.theme, acronym };
        } else {
             throw new Error("Parsed data from Gemini is missing theme or acronym.");
        }
    } catch(e) {
        console.error("Failed to parse or process theme from Gemini response:", e, `Response text: ${response.text}`);
        throw new Error("Failed to get valid theme/acronym from AI.");
    }
}

async function generateAiBackronym(acronym, theme, player) {
    if (!ai) {
        console.warn("AI not initialized, returning mock backronym.");
        return `Mock backronym for ${acronym}`;
    }

    const prompt = `You are a game AI. Your name is ${player.name} and you are from the ${player.generation} generation.
The game is Acronym Clash. The theme for this round is "${theme}".
Your task is to create a witty, funny, or clever backronym for the acronym: ${acronym}.

A backronym is a phrase where the first letter of each word spells out the acronym.
The backronym must match your generation's slang, perspective, and sense of humor. Be creative and concise. Keep it under 100 characters.

Respond with ONLY the backronym phrase itself. Do not include any other text, quotation marks, or explanations.

Example for acronym "IDK": I Dominate Kids.

Your witty backronym:`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.95,
                topP: 0.95,
                maxOutputTokens: 50,
                thinkingConfig: { thinkingBudget: 0 }
            },
        });
        
        const backronym = response.text.trim().replace(/"/g, '');
        return backronym || "I'm drawing a blank...";
    } catch (error) {
        console.error(`Error generating backronym for AI ${player.name}:`, error);
        return "I'm having a brain freeze!"; // Fallback response
    }
}

// --- Catchall route to serve the frontend's index.html ---
app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
});


// --- Server Start ---
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});