import React from 'react';
import { Game } from '../types';
import { GENERATION_COLORS } from '../constants';
import GameSetup from './GameSetup';
import Spinner from './Spinner';

interface LobbyProps {
    game: Game;
    currentPlayerId: string;
    onStartGame: (difficulty: number) => void;
    onLeaveLobby: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ game, currentPlayerId, onStartGame, onLeaveLobby }) => {
    
    const isHost = game.hostId === currentPlayerId;
    const players = game.players;

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700">
            <h2 className="text-3xl font-bold text-center text-yellow-400 font-bebas tracking-wider mb-2">Game Lobby</h2>
             {game.id.startsWith('PRIVATE-') && (
                <div className="text-center mb-4">
                    <p className="text-slate-300">Share this code with your friends!</p>
                    <div className="inline-block bg-slate-900/70 p-2 mt-1 rounded-lg">
                        <p className="text-3xl font-bold text-white tracking-widest font-mono">{game.id.replace('PRIVATE-', '')}</p>
                    </div>
                </div>
            )}
            <div className="flex flex-col md:flex-row gap-6">
                
                {/* Player List */}
                <div className="md:w-1/3 p-4 bg-slate-900/50 rounded-lg">
                    <h3 className="text-xl font-bebas text-cyan-300 tracking-wider mb-3">Players ({players.length}/8)</h3>
                    <div className="space-y-3">
                        {players.map(p => (
                            <div key={p.id} className={`p-3 rounded-lg flex items-center justify-between ${p.id === currentPlayerId ? 'bg-blue-900/70' : 'bg-slate-700/50'}`}>
                                <div>
                                    <p className="font-bold text-white">{p.name} {p.id === game.hostId && '👑'} {p.isAI && '(AI)'}</p>
                                    <p className={`text-sm font-semibold ${GENERATION_COLORS[p.generation]} inline-block px-2 rounded`}>{p.generation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Area: Settings */}
                <div className="md:w-2/3 flex flex-col justify-between">
                     {isHost ? (
                        <GameSetup onStart={onStartGame} initialDifficulty={game.difficulty} />
                     ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-800/80 rounded-xl border border-slate-700">
                            <Spinner message="Waiting for the host to start the game..."/>
                        </div>
                     )}
                </div>
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
