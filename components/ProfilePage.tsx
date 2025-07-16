import React from 'react';
import { Player } from '../types';
import { GENERATION_COLORS } from '../constants';
import TrophyIcon from './icons/TrophyIcon';

interface ProfilePageProps {
    player: Player;
    onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ player, onBack }) => {
    // Mock data for demonstration
    const mockStats = {
        highScore: Math.max(12500, player.score + (Math.floor(Math.random() * 5000))),
        avgLast10: Math.floor(Math.random() * (9000 - 4000) + 4000),
        gamesPlayed: Math.floor(Math.random() * (200 - 20) + 20),
        wins: Math.floor(Math.random() * 30),
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <button onClick={onBack} className="mb-4 bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-300">
                &larr; Back to Menu
            </button>
            <div className="p-8 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700">
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                    <div className={`w-24 h-24 rounded-full ${GENERATION_COLORS[player.generation]} flex items-center justify-center text-4xl font-anton text-white`}>
                        {player.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-4xl font-bebas text-white tracking-wider">{player.name}</h2>
                        <p className={`text-xl font-semibold ${GENERATION_COLORS[player.generation]} inline-block px-3 py-1 rounded-full text-white`}>{player.generation}</p>
                    </div>
                </div>

                <h3 className="text-2xl font-bebas text-cyan-300 tracking-wider mb-4">Player Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm uppercase font-semibold">High Score</p>
                        <p className="text-3xl font-bold text-yellow-400">{mockStats.highScore.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm uppercase font-semibold">Avg Score (Last 10)</p>
                        <p className="text-3xl font-bold text-white">{mockStats.avgLast10.toLocaleString()}</p>
                    </div>
                     <div className="bg-slate-900/50 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm uppercase font-semibold">Games Played</p>
                        <p className="text-3xl font-bold text-white">{mockStats.gamesPlayed}</p>
                    </div>
                     <div className="bg-slate-900/50 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm uppercase font-semibold">Total Wins</p>
                        <p className="text-3xl font-bold text-white flex items-center justify-center gap-2">{mockStats.wins} <TrophyIcon className="w-6 h-6 text-yellow-500" /></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
