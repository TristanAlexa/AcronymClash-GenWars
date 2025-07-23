
import React from 'react';
import { Game } from '../types';
import { GENERATION_COLORS } from '../constants';
import Spinner from './Spinner';

interface LobbyProps {
    game: Game;
    currentPlayerId: string;
    onLeaveLobby: () => void;
    onStartGame: () => void;
    onAddAI: () => void;
    onRemoveAI: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ game, currentPlayerId, onLeaveLobby, onStartGame, onAddAI, onRemoveAI }) => {
    
    const players = game.players;
    const isPrivate = game.id.startsWith('PRIVATE-');
    const isHost = game.hostId === currentPlayerId;
    const aiPlayersCount = players.filter(p => p.isAI).length;
    const canAddAI = players.length < 10;
    const canRemoveAI = aiPlayersCount > 0;

    const renderLobbyCenter = () => {
        if (isPrivate) {
            return (
                <div className="md:w-2/3 flex flex-col items-center justify-center p-8 bg-slate-800/80 rounded-xl border border-slate-700">
                    <p className="font-bebas text-3xl text-slate-300 text-center">Waiting for host to start the game...</p>
                    <Spinner message="Waiting for players..."/>

                    {isHost && (
                        <div className="mt-6 w-full flex flex-col items-center gap-4">
                            <div className="flex items-center gap-4">
                                <p className="font-bebas text-2xl text-white">AI Opponents: {aiPlayersCount}</p>
                                <button onClick={onRemoveAI} disabled={!canRemoveAI} className="bg-red-600 w-10 h-10 text-3xl font-bold rounded-full disabled:opacity-50 flex items-center justify-center leading-none">-</button>
                                <button onClick={onAddAI} disabled={!canAddAI} className="bg-green-600 w-10 h-10 text-3xl font-bold rounded-full disabled:opacity-50 flex items-center justify-center leading-none">+</button>
                            </div>

                            <button
                                onClick={onStartGame}
                                className="w-full max-w-xs bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg text-2xl transform hover:scale-105 transition-transform duration-300 ease-in-out font-bebas tracking-wider"
                            >
                                Start Game
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        // Public lobby with countdown
        return (
            <div className="md:w-2/3 flex flex-col items-center justify-center p-8 bg-slate-800/80 rounded-xl border border-slate-700">
                <p className="font-bebas text-3xl text-slate-300">Game starting in</p>
                <p className="font-anton text-8xl text-yellow-400">{game.countdown}</p>
                <Spinner message="Waiting for more players..."/>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700">
            <h2 className="text-3xl font-bold text-center text-yellow-400 font-bebas tracking-wider mb-2">Game Lobby</h2>
             {isPrivate && (
                <div className="text-center mb-4">
                    <p className="text-slate-300">Share this code with your friends! (Click to copy)</p>
                    <div className="inline-block bg-slate-900/70 p-2 mt-1 rounded-lg cursor-pointer" title="Copy code" onClick={() => navigator.clipboard.writeText(game.id.replace('PRIVATE-', ''))}>
                        <p className="text-3xl font-bold text-white tracking-widest font-mono">{game.id.replace('PRIVATE-', '')}</p>
                    </div>
                </div>
            )}
            <div className="flex flex-col md:flex-row gap-6">
                
                {/* Player List */}
                <div className="md:w-1/3 p-4 bg-slate-900/50 rounded-lg">
                    <h3 className="text-xl font-bebas text-cyan-300 tracking-wider mb-3">Players ({players.length}/10)</h3>
                    <div className="space-y-3">
                        {players.map(p => (
                            <div key={p.id} className={`p-3 rounded-lg flex items-center justify-between ${p.id === currentPlayerId ? 'bg-blue-900/70' : 'bg-slate-700/50'}`}>
                                <div>
                                    <p className="font-bold text-white">{p.name} {p.id === game.hostId && '👑'} {p.isAI && '(AI)'}</p>
                                    <p className={`text-sm font-semibold ${GENERATION_COLORS[p.generation]} inline-block px-2 rounded`}>{p.generation}</p>
                                </div>
                            </div>
                        ))}
                         {[...Array(Math.max(0, 10 - players.length))].map((_, i) => (
                            <div key={`empty-${i}`} className="p-3 rounded-lg bg-slate-800/40 text-center text-slate-400 italic">
                                Waiting for player...
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Area: Countdown or Host controls */}
                {renderLobbyCenter()}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-start">
                <button
                    onClick={onLeaveLobby}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg text-xl transform hover:scale-105 transition-transform duration-300 ease-in-out font-bebas tracking-wider"
                >
                    Leave Lobby
                </button>
            </div>
        </div>
    );
};

export default Lobby;
