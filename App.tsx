

import React, { useState, useEffect } from 'react';
import { Generation, Player, Game, LobbyTheme } from './types';
import { ALL_REGIONS } from './constants';
import * as socket from './services/socketService';

import Spinner from './components/Spinner';
import SubmissionArea from './components/SubmissionArea';
import VotingArea from './components/VotingArea';
import RoundResultsDisplay from './components/ResultsDisplay';
import Leaderboard from './components/Leaderboard';
import LoginScreen from './components/LoginScreen';
import MainMenu from './components/MainMenu';
import Lobby from './components/Lobby';
import ProfilePage from './components/ProfilePage';
import ThemeSign from './components/ThemeSign';
import LicensePlate from './components/LicensePlate';
import LobbyThemeSelector from './components/LobbyThemeSelector';
import RoundRevealDisplay from './components/RoundRevealDisplay';
import FaceoffDisplay from './components/FaceoffDisplay';
import GameOverDisplay from './components/GameOverDisplay';

const App: React.FC = () => {
    const [player, setPlayer] = useState<Player | null>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [error, setError] = useState<string>('');
    const [view, setView] = useState<'login' | 'menu' | 'lobbyThemeSelection' | 'game' | 'profile' | 'leaderboard'>('login');
    const [gameMode, setGameMode] = useState<'private' | 'public' | null>(null);

    useEffect(() => {
        socket.connect();

        socket.on('gameStateUpdate', (newGameState: Game) => {
            setGame(newGameState);
            setError('');
            // If we receive a game state, we should be in the 'game' view
            if (view !== 'game') {
                setView('game');
            }
        });

        socket.on('gameNotFound', (message: string) => {
            setError(message);
            setGame(null);
            setView('menu');
        });

        socket.on('connect_error', () => {
            setError("Failed to connect to the server. Please check if the server is running and refresh.");
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // --- Event Handlers ---
    const handleLogin = (name: string, generation: Generation) => {
        const playerRegion = ALL_REGIONS[Math.floor(Math.random() * ALL_REGIONS.length)];
        const playerData: Omit<Player, 'id' | 'isAI' | 'score' | 'hasSubmitted' | 'wins'> = { name, generation, region: playerRegion };
        
        socket.emit('playerLogin', playerData, (ackPlayer: Player) => {
             setPlayer(ackPlayer);
             setView('menu');
        });
    };
    
    const handleChooseGameMode = (mode: 'private' | 'public') => {
        setGameMode(mode);
        setView('lobbyThemeSelection');
    };

    const handleSelectLobbyTheme = (theme: LobbyTheme) => {
        if (!gameMode) return;
        socket.emit('createGame', { isPrivate: gameMode === 'private', lobbyType: theme });
        setView('game'); // Switch to game view and wait for gameStateUpdate
    };

    const handleJoinGame = (gameId: string) => {
        socket.emit('joinGame', { gameId });
        setView('game');
    };
    
    const handleLeaveGame = () => {
        if(game) {
            socket.emit('leaveGame', { gameId: game.id });
        }
        setGame(null);
        setView('menu');
    };

    const handlePlayerSubmit = (backronym: string) => {
        if (game) {
            socket.emit('submitBackronym', { gameId: game.id, backronym });
        }
    };
    
    const handleVote = (votedPlayerId: string) => {
        if(game) {
            socket.emit('castVote', { gameId: game.id, votedPlayerId });
        }
    };

    const handleFaceoffSubmit = (backronym: string) => {
        if(game) {
            socket.emit('submitFaceoff', { gameId: game.id, backronym });
        }
    };

    const handleFaceoffVote = (votedPlayerId: string) => {
        if(game) {
            socket.emit('castFaceoffVote', { gameId: game.id, votedPlayerId });
        }
    };
    
    const renderGameContent = () => {
        if (!game || !player) return <Spinner message="Joining game..." />;

        const currentPlayerId = socket.getSocketId() || '';

        switch (game.phase) {
            case 'Lobby':
                return <Lobby 
                    game={game}
                    currentPlayerId={currentPlayerId}
                    onLeaveLobby={handleLeaveGame} 
                />;
            case 'RoundThemeReveal':
            case 'RoundAcronymReveal':
                return <RoundRevealDisplay game={game} />;
            case 'Submitting':
                return (
                    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
                        <ThemeSign theme={game.theme} />
                        <LicensePlate region={player.region} text={game.acronym} slogan="Yours To Discover" type="acronym" />
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
            case 'RoundResults':
                 return (
                    <div className="w-full max-w-4xl mx-auto">
                        <RoundResultsDisplay game={game} />
                    </div>
                 );
            case 'FaceoffSubmitting':
            case 'FaceoffVoting':
            case 'FaceoffResults':
                return <FaceoffDisplay 
                            game={game} 
                            currentPlayerId={currentPlayerId} 
                            onFaceoffSubmit={handleFaceoffSubmit}
                            onFaceoffVote={handleFaceoffVote}
                        />;
            case 'GameOver':
                return <GameOverDisplay game={game} onMainMenu={() => setView('menu')} />;
            default:
                return <p>An unknown game state occurred.</p>;
        }
    }

    const renderContent = () => {
        if (error) {
             return <div className="text-center p-4 bg-red-800/80 rounded-lg"><h3 className="text-xl font-bold text-yellow-300">Connection Error</h3><p className="text-white">{error}</p></div>
        }
        
        if (!player) return <LoginScreen onLogin={handleLogin} />;
        
        switch (view) {
            case 'login':
                return <LoginScreen onLogin={handleLogin} />;
            case 'profile':
                return <ProfilePage player={player} onBack={() => setView('menu')} />;
            case 'leaderboard':
                 return (
                    <div className="w-full max-w-4xl mx-auto">
                        <button onClick={() => setView('menu')} className="absolute top-4 left-4 bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg z-20 hover:bg-yellow-300">
                            &larr; Back
                        </button>
                        <Leaderboard />
                    </div>
                );
            case 'lobbyThemeSelection':
                return <LobbyThemeSelector onSelectTheme={handleSelectLobbyTheme} onBack={() => setView('menu')} />;
            case 'game':
                return renderGameContent();
            case 'menu':
            default:
                return <MainMenu 
                            onNavigate={(dest) => setView(dest)} 
                            player={player} 
                            onChooseGameMode={handleChooseGameMode} 
                            onJoinGame={handleJoinGame} 
                        />;
        }
    };

    return (
        <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 selection:bg-yellow-400 selection:text-black relative overflow-x-hidden">
             <div className="absolute inset-0 bg-[#3a3a3a]" style={{ backgroundImage: `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAARlJREFUaAXt1EEOhDAIRFGn8f+P3t0VpYJIdYmKqL9x594pENsNYgJgACu2Yg9gALf8fCxgAAeY9jvAARa0hglQkQYJECVggQcMkeAIECVigQsGkeAIECVggQcMkeAIECVigQsGkeAIECVggQcMkeAIECVigQsGkeAIECVggQcMkeAIECVigQsGkeAIECVggQcMkeAIECVigQsGkeAIECVigQsGkeAIECVigQsGkeAIECVigQsGkeAIECVigQsGkeAIECVigQv4BsMWfI1+Dc2zAAAAAElFTkSuQmCC')`}}></div>
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