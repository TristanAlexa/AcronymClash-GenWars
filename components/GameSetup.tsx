
import React, { useState } from 'react';

interface GameSetupProps {
    onStart: (difficulty: number) => void;
    initialDifficulty: number;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStart, initialDifficulty }) => {
    const [difficulty, setDifficulty] = useState(initialDifficulty);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onStart(difficulty);
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700">
            <h2 className="text-3xl font-bold text-center text-yellow-400 font-bebas tracking-wider mb-6">Game Setup</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <label htmlFor="difficulty" className="block text-lg font-semibold text-center text-slate-300 mb-3">Difficulty (Letter Count)</label>
                    <div className="flex justify-center space-x-3">
                        {[3, 4, 5].map(d => (
                             <button
                                type="button"
                                key={d}
                                onClick={() => setDifficulty(d)}
                                className={`w-16 h-16 text-2xl font-bold rounded-lg transition-all duration-200 border-2 ${difficulty === d ? 'bg-yellow-500 text-white scale-110 shadow-lg border-yellow-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600'}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-2xl transform hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50 font-bebas tracking-wider"
                >
                    Start Clash!
                </button>
            </form>
        </div>
    );
};

export default GameSetup;
