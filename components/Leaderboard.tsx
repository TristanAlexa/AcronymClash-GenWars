
import React, { useState } from 'react';
import { Generation } from '../types';
import { GENERATION_COLORS } from '../constants';
import TrophyIcon from './icons/TrophyIcon';
import UserGroupIcon from './icons/UserGroupIcon';

type Tab = 'All-Time' | Generation;

const mockLeaderboardData = {
    'All-Time': [
        { name: 'XanTheMan', generation: Generation.GenX, score: 12500 },
        { name: 'ZoomerZesty', generation: Generation.GenZ, score: 11800 },
        { name: 'MillennialMax', generation: Generation.Millennials, score: 11200 },
        { name: 'BoomerBob', generation: Generation.Boomers, score: 9800 },
        { name: 'GenX_Gadget', generation: Generation.GenX, score: 9500 },
    ],
    [Generation.GenZ]: [
        { name: 'ZoomerZesty', generation: Generation.GenZ, score: 11800 },
        { name: 'VibeCheck', generation: Generation.GenZ, score: 8900 },
        { name: 'NoCapNick', generation: Generation.GenZ, score: 7600 },
    ],
    [Generation.Millennials]: [
        { name: 'MillennialMax', generation: Generation.Millennials, score: 11200 },
        { name: 'AvocadoAva', generation: Generation.Millennials, score: 9100 },
        { name: 'SidePartSavvy', generation: Generation.Millennials, score: 8500 },
    ],
    [Generation.GenX]: [
        { name: 'XanTheMan', generation: Generation.GenX, score: 12500 },
        { name: 'GenX_Gadget', generation: Generation.GenX, score: 9500 },
        { name: 'SlackerSal', generation: Generation.GenX, score: 8800 },
    ],
    [Generation.Boomers]: [
        { name: 'BoomerBob', generation: Generation.Boomers, score: 9800 },
        { name: 'RockinRita', generation: Generation.Boomers, score: 8200 },
        { name: 'HandyHank', generation: Generation.Boomers, score: 7500 },
    ]
};

const Leaderboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('All-Time');

    const tabs: Tab[] = ['All-Time', ...Object.values(Generation)];

    return (
        <div className="w-full p-2 sm:p-6 bg-[#00553a] rounded-xl shadow-2xl border-4 border-gray-200 font-roboto-condensed">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-white uppercase mb-4">Leaderboards</h2>
            <div className="flex flex-wrap justify-center border-b-2 border-gray-200/50 mb-4">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-2 text-sm md:text-base font-semibold flex items-center transition-colors duration-200 uppercase tracking-wider ${activeTab === tab ? 'text-white border-b-4 border-white' : 'text-gray-300 hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="space-y-3">
                {mockLeaderboardData[activeTab].map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                        <div className="flex items-center">
                            <span className="font-bold text-gray-200 w-8 text-center">{index + 1}</span>
                            <div className="flex items-center ml-3">
                                <div className={`w-3 h-3 rounded-full mr-3 ${GENERATION_COLORS[entry.generation]}`}></div>
                                <span className="font-semibold text-white uppercase">{entry.name}</span>
                            </div>
                        </div>
                        <span className="font-bold text-white">{entry.score.toLocaleString()} PTS</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
