
import React, { useState, useEffect, useRef } from 'react';
import { Generation, Player, Game, GamePhase } from './types';
import { ALL_REGIONS, AI_OPPONENTS } from './constants';
import * as socket from './services/socketService';
import { generateThemeAndAcronym, generateBackronym } from './services/geminiService';

import Spinner from './components/Spinner';
import SubmissionArea from './components/SubmissionArea';
import VotingArea from './components/VotingArea';
import ResultsDisplay from './components/ResultsDisplay';
import Leaderboard from './components/Leaderboard';
import LoginScreen from './components/LoginScreen';
import MainMenu from './components/MainMenu';
import Lobby from './components/Lobby';
import ProfilePage from './components/ProfilePage';
import ThemeSign from './components/ThemeSign';
import LicensePlate from './components/LicensePlate';

// Set to true to run the app without a server, using mock data and local state.
const LOCAL_MODE = false;

const App: React.FC = () => {
    const [player, setPlayer] = useState<Player | null>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [error, setError] = useState<string>('');
    const [view, setView] = useState<'game' | 'profile' | 'leaderboard'>('game');
    const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --- Local Mode Game Loop ---
    const runCountdown = (duration: number, onComplete: () => void) => {
        if (countdownRef.current) clearTimeout(countdownRef.current);
        
        let remaining = duration;
        setGame(prevGame => prevGame ? { ...prevGame, countdown: remaining } : null);

        const tick = () => {
            setGame(prevGame => {
                 if (!prevGame || prevGame.countdown <= 1) {
                     if(countdownRef.current) clearTimeout(countdownRef.current);
                     return prevGame ? { ...prevGame, countdown: 0 } : null;
                 }
                 remaining--;
                 return {...prevGame, countdown: remaining };
            });

            if (remaining > 0) {
                countdownRef.current = setTimeout(tick, 1000);
            } else {
                onComplete();
            }
        };
        countdownRef.current = setTimeout(tick, 1000);
    };

    const startVotingPhaseLocal = () => {
        setGame(prevGame => {
            if (!prevGame || prevGame.phase === 'Voting') return null;
            
            const playersWithSubmissions = new Set(prevGame.submissions.map(s => s.playerId));
            const missingSubmissions = prevGame.players
                .filter(p => !playersWithSubmissions.has(p.id))
                .map(p => ({
                    playerId: p.id,
                    playerName: p.name,
                    backronym: "Didn't submit in time!",
                    votes: [],
                }));
                
            return {
                ...prevGame,
                phase: 'Voting',
                submissions: [...prevGame.submissions, ...missingSubmissions]
            };
        });
        runCountdown(20, () => startResultsPhaseLocal());
    };
    
    const startSubmissionPhaseLocal = async () => {
        setGame(prevGame => {
            if (!prevGame) return null;
            const updatedGame = { ...prevGame, phase: 'Submitting' as GamePhase, submissions: [] };
            updatedGame.players.forEach(p => p.hasSubmitted = false);
            
            // Simulate AI submissions
            updatedGame.players.filter(p => p.isAI).forEach(async (aiPlayer) => {
                const backronym = await generateBackronym(updatedGame.acronym, aiPlayer.generation, updatedGame.theme);
                setGame(g => {
                    if(!g) return null;
                    const newSubmissions = [...g.submissions, { playerId: aiPlayer.id, playerName: aiPlayer.name, backronym, votes: [] }];
                    const newPlayers = g.players.map(p => p.id === aiPlayer.id ? {...p, hasSubmitted: true} : p);
                    return {...g, submissions: newSubmissions, players: newPlayers};
                });
            });
            
            return updatedGame;
        });
        runCountdown(45, () => startVotingPhaseLocal());
    };

    const startResultsPhaseLocal = () => {
        setGame(prevGame => {
            if (!prevGame) return null;
            let roundWinner: { playerId: string | null, maxVotes: number } = { playerId: null, maxVotes: -1 };
            const newPlayers = [...prevGame.players];
            prevGame.submissions.forEach(sub => {
                const points = sub.votes.length * 100;
                const playerIndex = newPlayers.findIndex(p => p.id === sub.playerId);
                if (playerIndex > -1) {
                    newPlayers[playerIndex] = { ...newPlayers[playerIndex], score: newPlayers[playerIndex].score + points };
                }
                if (sub.votes.length > roundWinner.maxVotes) {
                    roundWinner = { playerId: sub.playerId, maxVotes: sub.votes.length };
                }
            });
            let winnerPlayerId = null;
            if (roundWinner.playerId) {
                const winnerIndex = newPlayers.findIndex(p => p.id === roundWinner.playerId);
                if(winnerIndex > -1) {
                     newPlayers[winnerIndex] = { ...newPlayers[winnerIndex], score: newPlayers[winnerIndex].score + 300 };
                     winnerPlayerId = newPlayers[winnerIndex].id;
                }
            }
            return { ...prevGame, phase: 'Results', players: newPlayers, roundWinnerId: winnerPlayerId };
        });
        runCountdown(10, () => {
             setGame(g => g ? { ...g, phase: 'Lobby', acronym: '', theme: '', submissions: [], players: g.players.map(p => ({...p, hasSubmitted: false})) } : null);
        });
    };

    // --- Socket & App Setup ---
    useEffect(() => {
        if (LOCAL_MODE) return;

        socket.connect();

        socket.on('gameStateUpdate', (newGameState: Game) => {
            setGame(newGameState);
            setError('');
        });

        socket.on('gameNotFound', (message: string) => {
            setError(message);
            setGame(null);
        });

        socket.on('connect_error', () => {
            setError("Failed to connect to the server. Please check if the server is running and refresh.");
        });

        return () => {
            if (countdownRef.current) clearTimeout(countdownRef.current);
            if (!LOCAL_MODE) socket.disconnect();
        };
    }, []);

    // --- Event Handlers ---
    const handleLogin = (name: string, generation: Generation) => {
        const playerRegion = ALL_REGIONS[Math.floor(Math.random() * ALL_REGIONS.length)];
        
        if (LOCAL_MODE) {
            setPlayer({ id: `local-${Date.now()}`, name, generation, region: playerRegion, isAI: false, score: 0, hasSubmitted: false });
            return;
        }

        const playerData = { name, generation, region: playerRegion };
        socket.emit('playerLogin', playerData);
        setPlayer({ id: 'temp-id', name, generation, region: playerRegion, isAI: false, score: 0, hasSubmitted: false });
    };
    
    const handleNavigation = (destination: 'profile' | 'leaderboard') => {
        setView(destination);
    };
    
    const handleCreateGame = (isPrivate: boolean) => {
        if (LOCAL_MODE) {
            if (!player) return;
            const aiPlayers = AI_OPPONENTS.map(p => ({...p, score: 0, hasSubmitted: false}));
            const newGame: Game = {
                id: isPrivate ? 'PRIVATE-LOCAL' : 'PUBLIC-LOCAL', hostId: player.id, players: [player, ...aiPlayers],
                phase: 'Lobby', acronym: '', theme: '', submissions: [], difficulty: 4, roundWinnerId: undefined, countdown: 0,
            };
            setGame(newGame);
            return;
        }
        socket.emit('createGame', { isPrivate });
    };

    const handleJoinGame = (gameId: string) => {
        if (LOCAL_MODE) {
            handleCreateGame(true); // Simulate joining a private game
            return;
        }
        socket.emit('joinGame', { gameId });
    };
    
    const handleLeaveGame = () => {
        if (LOCAL_MODE) {
            setGame(null);
            if (countdownRef.current) clearTimeout(countdownRef.current);
            return;
        }
        if(game) {
            socket.emit('leaveGame', { gameId: game.id });
            setGame(null);
        }
    };

    const handleStartGame = async (difficulty: number) => {
        if (LOCAL_MODE) {
            if (!game || !player) return;
            setGame({ ...game, phase: 'GeneratingContent', difficulty, players: game.players.map(p => ({...p, score: 0})) });
            try {
                const { theme, acronym } = await generateThemeAndAcronym(difficulty);
                setGame(prevGame => prevGame ? { ...prevGame, theme, acronym } : null);
                await startSubmissionPhaseLocal();
            } catch (error) {
                console.error("Error in local game start:", error);
                setGame(prevGame => prevGame ? { ...prevGame, phase: 'Lobby' } : null);
            }
            return;
        }

        if(game) {
            socket.emit('startGame', { gameId: game.id, difficulty });
        }
    };
    
    const handlePlayerSubmit = (backronym: string) => {
        if (LOCAL_MODE) {
            if (!game || !player) return;
            setGame(prevGame => {
                if (!prevGame) return null;
                if (prevGame.players.find(p => p.id === player.id)?.hasSubmitted) return prevGame;

                const newPlayers = prevGame.players.map(p => p.id === player.id ? {...p, hasSubmitted: true} : p);
                const newSubmissions = [...prevGame.submissions, { playerId: player.id, playerName: player.name, backronym, votes: [] }];
                const allHumansSubmitted = newPlayers.filter(p => !p.isAI).every(p => p.hasSubmitted);

                if (allHumansSubmitted) {
                    if (countdownRef.current) clearTimeout(countdownRef.current);
                    startVotingPhaseLocal();
                }

                return { ...prevGame, players: newPlayers, submissions: newSubmissions };
            });
            return;
        }
        if (game) {
            socket.emit('submitBackronym', { gameId: game.id, backronym });
        }
    };
    
    const handleVote = (votedPlayerId: string) => {
        if (LOCAL_MODE) {
            if (!game || !player) return;
            const playerHasVoted = game.submissions.some(sub => sub.votes.includes(player.id));
            if (!playerHasVoted && votedPlayerId !== player.id) {
                setGame(g => g ? { ...g, submissions: g.submissions.map(s => s.playerId === votedPlayerId ? {...s, votes: [...s.votes, player.id]} : s) } : null);
            }
            return;
        }
        if(game) {
            socket.emit('castVote', { gameId: game.id, votedPlayerId });
        }
    };
    
    const handlePlayAgain = () => {
        if (LOCAL_MODE) {
            if (!game) return;
            setGame({ ...game, phase: 'Lobby', acronym: '', theme: '', submissions: [], roundWinnerId: undefined, players: game.players.map(p => ({...p, hasSubmitted: false})) });
            return;
        }
        if(game) {
            socket.emit('playAgain', { gameId: game.id });
        }
    };
    
    const handleMainMenu = () => {
        if (countdownRef.current) clearTimeout(countdownRef.current);
         if(game && !LOCAL_MODE) {
            socket.emit('leaveGame', { gameId: game.id });
        }
        setGame(null);
    };
    
    const renderGameContent = () => {
        if (!game || !player) return <Spinner message="Joining game..." />;

        const currentPlayerId = LOCAL_MODE ? player.id : (socket.getSocketId() || '');

        switch (game.phase) {
            case 'Lobby':
                return <Lobby 
                    game={game}
                    currentPlayerId={currentPlayerId}
                    onStartGame={handleStartGame} 
                    onLeaveLobby={handleLeaveGame} 
                />;
            case 'GeneratingContent':
                return <Spinner message="Generating theme and acronym..." />;
            case 'Submitting':
                return (
                    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
                        <ThemeSign theme={game.theme} />
                        <LicensePlate region="Ontario" text={game.acronym} slogan="Yours To Discover" type="acronym" />
                        <SubmissionArea 
                            onSubmit={handlePlayerSubmit} 
                            acronym={game.acronym} 
                            countdown={game.countdown}
                            hasSubmitted={game.players.find(p => p.id === currentPlayerId)?.hasSubmitted || false}
                         />
                    </div>
                );
            case 'Voting':
                return (
                    <div className="w-full max-w-5xl mx-auto">
                        <ThemeSign theme={game.theme} />
                        <VotingArea 
                          game={game}
                          currentPlayerId={currentPlayerId}
                          onVote={handleVote} 
                        />
                    </div>
                );
            case 'Results':
                 return (
                    <div className="w-full max-w-4xl mx-auto">
                        <ResultsDisplay 
                            game={game}
                            onPlayAgain={handlePlayAgain} 
                            onMainMenu={handleMainMenu}
                        />
                    </div>
                 );
            default:
                return <p>An unknown game state occurred.</p>;
        }
    }

    const renderContent = () => {
        if (error) {
             return <div className="text-center p-4 bg-red-800/80 rounded-lg"><h3 className="text-xl font-bold text-yellow-300">Connection Error</h3><p className="text-white">{error}</p></div>
        }
        
        if (!player) return <LoginScreen onLogin={handleLogin} />;
        
        if (view === 'profile') {
            return <ProfilePage player={player} onBack={() => setView('game')} />;
        }
        if (view === 'leaderboard') {
            return (
                <div>
                    <button onClick={() => setView('game')} className="absolute top-4 left-4 bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg z-20 hover:bg-yellow-300">
                        &larr; Back
                    </button>
                    <Leaderboard />
                </div>
            );
        }

        if (game) {
            return renderGameContent();
        }
        
        return <MainMenu onNavigate={handleNavigation} player={player} onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />;
    };

    return (
        <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 selection:bg-yellow-400 selection:text-black relative overflow-x-hidden">
             <div className="absolute inset-0 bg-[#3a3a3a]" style={{ backgroundImage: `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAARlJREFUaAXt1EEOhDAIRFGn8f+P3t0VpYJIdYmKqL9x594pENsNYgJgACu2Yg9gALf8fCxgAAeY9jvAARa0hglQkQYJECVggQcMkeAIECVigQsGkeAIECVggQcMkeAIECVigQsGkeAIECVggQcMkeAIECVigQsGkeAIECVggQcMkeAIECVigQsGkeAIECVigQsGkeAIECVigQsGkeAIECVigQsGkeAIECVigQsGkeAIECVigQsGkeAIECVigQsGkeAIECVigQsGkeAIECVigQsGkeAIECVigQv4BsMWfI1+Dc2zAAAAAElFTkSuQmCC')`}}></div>
             <div className="absolute top-0 h-full w-full bg-slate-800/80 backdrop-blur-sm"></div>

            <div className="relative z-10 w-full flex flex-col items-center flex-grow justify-center">
                <header className="text-center my-8">
                    <h1 className="text-5xl md:text-7xl font-anton text-white uppercase tracking-wider" style={{ textShadow: '2px 2px 0px #000, 4px 4px 0px #1e90ff' }}>
                        Acronym Clash
                    </h1>
                     <p className="font-bebas text-2xl text-yellow-400 tracking-widest">Gen Wars</p>
                </header>
                <main className="w-full flex-grow flex flex-col items-center justify-center px-2">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;
