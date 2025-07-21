
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import { THEMES } from './themes.js';

// --- Server and Socket.IO Setup ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    },
    // Add ping/timeout settings to keep connections alive through proxies
    pingInterval: 20000,
    pingTimeout: 5000,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '..', 'dist');

// --- Gemini API Setup ---
const apiKey = process.env.API_KEY;
if (!apiKey) {
    console.error("\n!!! API_KEY environment variable not set. !!!");
}
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- Game State Management ---
const Generation = {
  GenZ: "Gen Z",
  Millennials: "Millennials",
  GenX: "Gen X",
  Boomers: "Boomers",
};

const AI_OPPONENTS = [
    { id: 'ai-zoe', name: 'Zoe', generation: Generation.GenZ, isAI: true, region: 'California', score: 0, hasSubmitted: false, wins: 0 },
    { id: 'ai-mike', name: 'Mike', generation: Generation.Millennials, isAI: true, region: 'New York', score: 0, hasSubmitted: false, wins: 0 },
    { id: 'ai-xander', name: 'Xander', generation: Generation.GenX, isAI: true, region: 'Quebec', score: 0, hasSubmitted: false, wins: 0 },
    { id: 'ai-barbara', name: 'Barbara', generation: Generation.Boomers, isAI: true, region: 'Illinois', score: 0, hasSubmitted: false, wins: 0 },
    { id: 'ai-kyle', name: 'Kyle', generation: Generation.GenZ, isAI: true, region: 'Georgia', score: 0, hasSubmitted: false, wins: 0 },
    { id: 'ai-ashley', name: 'Ashley', generation: Generation.Millennials, isAI: true, region: 'Ontario', score: 0, hasSubmitted: false, wins: 0 },
    { id: 'ai-heather', name: 'Heather', generation: Generation.GenX, isAI: true, region: 'California', score: 0, hasSubmitted: false, wins: 0 },
    { id: 'ai-richard', name: 'Richard', generation: Generation.Boomers, isAI: true, region: 'New York', score: 0, hasSubmitted: false, wins: 0 },
    { id: 'ai-liam', name: 'Liam', generation: Generation.GenZ, isAI: true, region: 'Illinois', score: 0, hasSubmitted: false, wins: 0 },
    { id: 'ai-chad', name: 'Chad', generation: Generation.Millennials, isAI: true, region: 'Quebec', score: 0, hasSubmitted: false, wins: 0 },
];


const games = {}; // In-memory store for all active games

// Timings
const LOBBY_START_TIME = 15;
const THEME_REVEAL_TIME = 5;
const ACRONYM_REVEAL_TIME = 5;
const SUBMISSION_TIME = 45;
const VOTING_TIME = 20;
const ROUND_RESULTS_TIME = 8;
const FACEOFF_SUBMIT_TIME = 30;
const FACEOFF_VOTE_TIME = 20;
const FACEOFF_RESULTS_TIME = 5;
const GAME_OVER_TIME = 10;
const LOBBY_SIZE = 10;

app.use(express.static(distDir));

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    socket.data.player = null;

    socket.on('playerLogin', (playerData, callback) => {
        socket.data.player = {
            id: socket.id,
            ...playerData,
            isAI: false,
            score: 0,
            hasSubmitted: false,
            wins: 0,
        };
        console.log(`Player logged in: ${playerData.name} (${socket.id})`);
        callback(socket.data.player);
    });

    socket.on('createGame', ({ isPrivate, lobbyType }) => {
        const player = socket.data.player;
        if (!player) return;

        const gameId = isPrivate ? `PRIVATE-${generateGameCode()}` : `PUBLIC-${generateGameCode()}`;
        games[gameId] = createNewGame(gameId, player.id, lobbyType);
        
        joinGame(socket, gameId);

        // Start countdown to begin the game
        runCountdown(gameId, LOBBY_START_TIME, () => startGame(gameId));
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

    socket.on('submitBackronym', ({ gameId, backronym }) => {
        const game = games[gameId];
        const player = game?.players.find(p => p.id === socket.id);
        if (!game || !player || player.hasSubmitted || game.phase !== 'Submitting') return;

        player.hasSubmitted = true;
        game.submissions.push({ playerId: player.id, playerName: player.name, backronym, votes: [] });
        
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
        if (!game || game.phase !== 'Voting') return;
        const submission = game.submissions.find(s => s.playerId === votedPlayerId);
        const playerHasVoted = game.submissions.some(s => s.votes.includes(socket.id));
        
        if (submission && !playerHasVoted && submission.playerId !== socket.id) {
            submission.votes.push(socket.id);
            broadcastGameState(gameId);
        }
    });

    socket.on('submitFaceoff', ({ gameId, backronym }) => {
        const game = games[gameId];
        const player = game?.players.find(p => p.id === socket.id);
        if (!game || !player || player.hasSubmitted || game.phase !== 'FaceoffSubmitting' || !game.faceoffPlayers.includes(player.id)) return;
        
        player.hasSubmitted = true;
        game.faceoffSubmissions.push({ playerId: player.id, playerName: player.name, backronym, votes: [] });

        const allFaceoffPlayersSubmitted = game.faceoffPlayers.every(playerId => game.players.find(p=>p.id === playerId)?.hasSubmitted);
        if (allFaceoffPlayersSubmitted) {
            game.timerId && clearTimeout(game.timerId);
            startFaceoffVotingPhase(gameId);
        } else {
            broadcastGameState(gameId);
        }
    });

    socket.on('castFaceoffVote', ({ gameId, votedPlayerId }) => {
        const game = games[gameId];
        if (!game || game.phase !== 'FaceoffVoting') return;

        const submission = game.faceoffSubmissions.find(s => s.playerId === votedPlayerId);
        const playerIsVoter = !game.faceoffPlayers.includes(socket.id);
        const playerHasVoted = game.faceoffSubmissions.some(s => s.votes.includes(socket.id));

        if (submission && playerIsVoter && !playerHasVoted) {
            submission.votes.push(socket.id);
            broadcastGameState(gameId);
        }
    });
    
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        const gameId = Object.keys(games).find(id => games[id]?.players.some(p => p.id === socket.id));
        if (gameId) {
            leaveGame(socket, gameId);
        }
    });
});

// --- Game Logic Functions ---
function createNewGame(gameId, hostId, lobbyType) {
    return {
        id: gameId, hostId, lobbyType,
        players: [],
        phase: 'Lobby',
        roundNumber: 0,
        acronym: '', theme: '',
        submissions: [],
        faceoffPlayers: [], faceoffSubmissions: [],
        roundWinnerId: undefined, gameWinnerId: undefined,
        countdown: 0, timerId: null, usedThemes: [],
    };
}

function joinGame(socket, gameId) {
    const player = socket.data.player;
    const game = games[gameId];
    if (!player || !game) return;
    
    if (game.phase !== 'Lobby') {
        socket.emit('gameInProgress', 'This game has already started.');
        return;
    }
    if (game.players.filter(p => !p.isAI).length >= LOBBY_SIZE && !game.players.some(p => p.id === player.id)) {
        socket.emit('lobbyFull', 'This lobby is full.');
        return;
    }

    socket.join(gameId);
    if (!game.players.some(p => p.id === player.id)) {
        game.players.push(player);
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
            game.hostId = game.players.find(p => !p.isAI)?.id || null;
        }
        broadcastGameState(gameId);
    }
}

function startGame(gameId) {
    const game = games[gameId];
    if (!game) return;

    // Fill remaining lobby spots with AI up to the max size
    const neededAIs = Math.max(0, LOBBY_SIZE - game.players.length);
    
    const availableAIs = AI_OPPONENTS.filter(aiTemplate => 
        !game.players.some(p => p.name === aiTemplate.name && p.isAI)
    );

    for (let i = 0; i < neededAIs && i < availableAIs.length; i++) {
        const aiTemplate = availableAIs[i];
        const newAIPlayer = { ...aiTemplate };
        delete newAIPlayer.id; // Remove the template ID

        game.players.push({
            ...newAIPlayer,
            id: `ai-${aiTemplate.name.toLowerCase()}-${Date.now()}`,
            isAI: true,
            score: 0,
            hasSubmitted: false,
            wins: 0,
        });
    }

    game.players.forEach(p => { p.score = 0; });
    startRound(gameId);
}

function generateRandomAcronym(letterCount) {
    const vowels = 'AEIOU';
    const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
    let acronym = '';
    // A simple approach for somewhat pronounceable-looking acronyms
    // Stagger vowels and consonants
    let lastType = Math.random() > 0.5 ? 'vowel' : 'consonant';
    for (let i = 0; i < letterCount; i++) {
        if (lastType === 'vowel') {
            acronym += consonants.charAt(Math.floor(Math.random() * consonants.length));
            lastType = 'consonant';
        } else {
            acronym += vowels.charAt(Math.floor(Math.random() * vowels.length));
            lastType = 'vowel';
        }
    }
    return acronym;
}

function startRound(gameId) {
    const game = games[gameId];
    if (!game) return;
    
    game.roundNumber++;
    game.phase = 'RoundThemeReveal';
    game.submissions = [];
    game.roundWinnerId = undefined;
    game.players.forEach(p => p.hasSubmitted = false);

    // --- New Theme and Acronym Logic ---
    const letterCount = game.roundNumber + 3; // R1=4, R2=5, R3=6
    
    // Select theme from hard-coded list
    const availableThemes = THEMES.general.filter(t => !game.usedThemes.includes(t));
    if (availableThemes.length === 0 && THEMES.general.length > 0) {
        // If we ran out of unique themes, reset the used list for this game and start over
        game.usedThemes = [];
        availableThemes.push(...THEMES.general);
    }
    game.theme = availableThemes.length > 0
        ? availableThemes[Math.floor(Math.random() * availableThemes.length)]
        : "Freestyle Frenzy"; // Fallback if no themes are defined in themes.js
    game.usedThemes.push(game.theme);

    // Generate acronym locally
    game.acronym = generateRandomAcronym(letterCount);
    
    broadcastGameState(gameId);
    runCountdown(gameId, THEME_REVEAL_TIME, () => startAcronymReveal(gameId));
}

function startAcronymReveal(gameId) {
    const game = games[gameId];
    if (!game) return;
    game.phase = 'RoundAcronymReveal';
    runCountdown(gameId, ACRONYM_REVEAL_TIME, () => startSubmissionPhase(gameId));
}

async function startSubmissionPhase(gameId) {
    const game = games[gameId];
    if (!game) return;
    game.phase = 'Submitting';

    // Generate AI submissions in the background
    const aiPlayers = game.players.filter(p => p.isAI);
    const submissionPromises = aiPlayers.map(aiPlayer => 
        generateAiBackronym(game.acronym, game.theme, aiPlayer).then(backronym => {
            aiPlayer.hasSubmitted = true;
            return { playerId: aiPlayer.id, playerName: aiPlayer.name, backronym, votes: [] };
        })
    );
    // Don't wait for the promises to resolve to start the countdown
    Promise.all(submissionPromises).then(aiSubmissions => {
        const game = games[gameId];
        if (game) {
             game.submissions.push(...aiSubmissions);
             // We don't need to broadcast here as players don't see AI submissions until voting
        }
    });
    
    runCountdown(gameId, SUBMISSION_TIME, () => startVotingPhase(gameId));
}

function startVotingPhase(gameId) {
    const game = games[gameId];
    if (!game || game.phase === 'Voting') return;
    
    game.phase = 'Voting';
    // Add placeholders for players who didn't submit
    game.players.forEach(p => {
        if (!game.submissions.some(s => s.playerId === p.id)) {
            game.submissions.push({ playerId: p.id, playerName: p.name, backronym: "Didn't submit in time!", votes: [] });
        }
    });

    runCountdown(gameId, VOTING_TIME, () => startRoundResultsPhase(gameId));
}

function startRoundResultsPhase(gameId) {
    const game = games[gameId];
    if (!game) return;
    game.phase = 'RoundResults';

    // Calculate scores
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
    
    const nextStep = game.roundNumber < 3 ? () => startRound(gameId) : () => startFaceoff(gameId);
    runCountdown(gameId, ROUND_RESULTS_TIME, nextStep);
}

function startFaceoff(gameId) {
    const game = games[gameId];
    if (!game) return;

    game.players.forEach(p => p.hasSubmitted = false);

    // Determine faceoff players
    const sortedPlayers = [...game.players].sort((a,b) => b.score - a.score);
    if (sortedPlayers.length < 2) {
        // Not enough players, go to game over
        game.gameWinnerId = sortedPlayers[0]?.id;
        startGameOverPhase(gameId);
        return;
    }
    
    const faceoffPlayers = [sortedPlayers[0].id, sortedPlayers[1].id];
    // Handle ties for 2nd place
    const secondPlaceScore = sortedPlayers[1].score;
    for (let i = 2; i < sortedPlayers.length; i++) {
        if (sortedPlayers[i].score === secondPlaceScore) {
            faceoffPlayers.push(sortedPlayers[i].id);
        } else {
            break;
        }
    }
    game.faceoffPlayers = faceoffPlayers;

    // --- New Faceoff Theme and Acronym Logic ---
    let faceoffThemePool = [];
    if (game.lobbyType === 'All Generations') {
        // Pool all faceoff themes together
        faceoffThemePool = Object.values(THEMES.faceoff).flat();
    } else if (THEMES.faceoff[game.lobbyType]) {
        // Use the specific generation's themes
        faceoffThemePool = THEMES.faceoff[game.lobbyType];
    }

    game.theme = faceoffThemePool.length > 0
        ? faceoffThemePool[Math.floor(Math.random() * faceoffThemePool.length)]
        : "The Final Showdown"; // Fallback theme if none are defined

    // Generate a new, harder 6-letter acronym for the finale
    game.acronym = generateRandomAcronym(6);
    // --- End New Logic ---

    game.phase = 'FaceoffSubmitting';
    runCountdown(gameId, FACEOFF_SUBMIT_TIME, () => startFaceoffVotingPhase(gameId));
}

function startFaceoffVotingPhase(gameId) {
    const game = games[gameId];
    if (!game) return;
    
    // Add placeholders for finalists who didn't submit
    game.faceoffPlayers.forEach(playerId => {
        if (!game.faceoffSubmissions.some(s => s.playerId === playerId)) {
            const player = game.players.find(p => p.id === playerId);
            game.faceoffSubmissions.push({ playerId: player.id, playerName: player.name, backronym: "Ran out of time!", votes: [] });
        }
    });

    game.phase = 'FaceoffVoting';
    runCountdown(gameId, FACEOFF_VOTE_TIME, () => startFaceoffResultsPhase(gameId));
}

function startFaceoffResultsPhase(gameId) {
    const game = games[gameId];
    if (!game) return;
    game.phase = 'FaceoffResults';

    const winnerSubmission = game.faceoffSubmissions.sort((a,b) => b.votes.length - a.votes.length)[0];
    if (winnerSubmission) {
        game.gameWinnerId = winnerSubmission.playerId;
        const winnerPlayer = game.players.find(p => p.id === game.gameWinnerId);
        if (winnerPlayer) {
            winnerPlayer.wins += 1; // Increment win count
        }
    } else {
        game.gameWinnerId = game.faceoffPlayers[0] || null; // Fallback winner
    }
    
    runCountdown(gameId, FACEOFF_RESULTS_TIME, () => startGameOverPhase(gameId));
}

function startGameOverPhase(gameId) {
    const game = games[gameId];
    if (!game) return;
    game.phase = 'GameOver';
    runCountdown(gameId, GAME_OVER_TIME, () => {
        // Clean up game after a delay
        if (games[gameId]) {
            game.timerId && clearTimeout(game.timerId);
            delete games[gameId];
        }
    });
}

function runCountdown(gameId, duration, onComplete) {
    const game = games[gameId];
    if (!game) return;

    game.timerId && clearTimeout(game.timerId);
    game.countdown = duration;

    const tick = () => {
        if (!games[gameId]) return; // Game was deleted
        broadcastGameState(gameId);
        game.countdown--;

        if (game.countdown >= 0) {
            game.timerId = setTimeout(tick, 1000);
        } else {
            onComplete();
        }
    };
    tick();
}

function broadcastGameState(gameId) {
    const game = games[gameId];
    if (game) {
        // Exclude server-side timerId from the payload
        const { timerId, usedThemes, ...gameState } = game;
        io.to(gameId).emit('gameStateUpdate', gameState);
    }
}

function generateGameCode() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

// --- Gemini API Functions ---
async function generateAiBackronym(acronym, theme, player) {
    if (!ai) return `Mock backronym for ${acronym}`;

    const prompt = `You are a game AI named ${player.name}, part of the ${player.generation} generation.
The theme is "${theme}". Create a witty backronym for: ${acronym}.
A backronym is a phrase where the first letter of each word spells the acronym.
The phrase must match your generation's slang and humor. Be creative and concise (under 100 chars).
Respond ONLY with the backronym phrase. No quotes.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt,
            config: { temperature: 1, topP: 0.95, maxOutputTokens: 50, thinkingConfig: { thinkingBudget: 0 } },
        });
        return response.text.trim().replace(/"/g, '') || "I'm drawing a blank...";
    } catch(error) {
        console.error(`Error generating AI backronym for ${player.name}:`, error);
        return "I'm drawing a blank...";
    }
}

app.get('*', (req, res) => res.sendFile(path.join(distDir, 'index.html')));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
