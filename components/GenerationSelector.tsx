
import React from 'react';
import { Generation } from '../types';
import { GENERATION_COLORS } from '../constants';

interface GenerationSelectorProps {
    onSelect: (generation: Generation) => void;
}

const GenerationSelector: React.FC<GenerationSelectorProps> = ({ onSelect }) => {
    return (
        <div className="w-full max-w-lg mx-auto text-center p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
            <h2 className="text-3xl font-bold text-cyan-300 mb-2">Choose Your Generation</h2>
            <p className="text-slate-400 mb-8">Your choice determines your team in the clash!</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.values(Generation).map(gen => (
                    <button
                        key={gen}
                        onClick={() => onSelect(gen)}
                        className={`${GENERATION_COLORS[gen]} text-white font-bold py-4 px-6 rounded-lg text-lg transform hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-opacity-50`}
                    >
                        {gen}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GenerationSelector;
