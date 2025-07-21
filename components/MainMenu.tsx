
import React, { useState } from 'react';
import { Player } from '../types';
import TrophyIcon from './icons/TrophyIcon';
import UserGroupIcon from './icons/UserGroupIcon';

interface MainMenuProps {
    onNavigate: (destination: 'profile' | 'leaderboard') => void;
    player: Player;
    onChooseGameMode: (mode: 'private' | 'public') => void;
    onJoinGame: (gameId: string) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onNavigate, player, onChooseGameMode, onJoinGame }) => {
    const [joinCode, setJoinCode] = useState('');

    const handleJoinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (joinCode.trim()) {
            onJoinGame(joinCode.trim().toUpperCase());
        }
    };
    
    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bebas text-white tracking-wider">Welcome, <span className="text-yellow-400">{player.name}</span>!</h2>
                <p className="text-slate-300">How do you want to play?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Play with Friends Card */}
                <div className="p-6 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 flex flex-col justify-between text-center">
                    <div>
                        <UserGroupIcon className="w-12 h-12 text-cyan-300 mb-2 mx-auto" />
                        <h3 className="text-2xl font-bebas text-cyan-300 tracking-wider mb-1">Play with Friends</h3>
                        <p className="text-slate-400 mb-4">Create a private lobby or join one with a code.</p>
                    </div>
                    <div className="space-y-3">
                        <button 
                            onClick={() => onChooseGameMode('private')}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-xl font-bebas tracking-wider"
                        >
                            Create Private Game
                        </button>
                        <form onSubmit={handleJoinSubmit} className="flex gap-2">
                             <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                placeholder="GAME CODE"
                                maxLength={5}
                                className="w-full flex-grow p-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors text-lg text-center font-bold tracking-widest uppercase"
                            />
                            <button
                                type="submit"
                                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold p-3 rounded-lg text-xl font-bebas tracking-wider"
                            >
                                Join
                            </button>
                        </form>
                    </div>
                </div>

                {/* Quick Play (vs AI) Card */}
                <div className="p-6 bg-green-900/50 backdrop-blur-md rounded-xl shadow-2xl border border-green-700 flex flex-col items-center justify-center text-center ring-2 ring-yellow-400/50">
                    <TrophyIcon className="w-12 h-12 text-yellow-400 mb-2" />
                    <h3 className="text-2xl font-bebas text-yellow-400 tracking-wider mb-1">Quick Play</h3>
                    <p className="text-slate-300 mb-4 h-16">Jump into a public game against other players and AI.</p>
                    <button 
                        onClick={() => onChooseGameMode('public')} 
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-xl transform hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50 font-bebas tracking-wider"
                    >
                        Find a Game
                    </button>
                </div>
            </div>

            {/* Side Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <button onClick={() => onNavigate('profile')} className="w-full p-6 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 text-center hover:bg-slate-700 transition-colors duration-300">
                    <h3 className="text-2xl font-bebas text-cyan-300 tracking-wider">My Profile</h3>
                    <p className="text-slate-400">View your stats & records</p>
                </button>
                <button onClick={() => onNavigate('leaderboard')} className="w-full p-6 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 text-center hover:bg-slate-700 transition-colors duration-300">
                    <TrophyIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <h3 className="text-2xl font-bebas text-cyan-300 tracking-wider">Leaderboards</h3>
                    <p className="text-slate-400">See who's on top</p>
                </button>
            </div>
        </div>
    );
};

export default MainMenu;
