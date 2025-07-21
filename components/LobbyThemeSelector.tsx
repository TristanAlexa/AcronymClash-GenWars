
import React from 'react';
import { Generation, LobbyTheme } from '../types';
import { GENERATION_COLORS } from '../constants';

interface LobbyThemeSelectorProps {
    onSelectTheme: (theme: LobbyTheme) => void;
    onBack: () => void;
}

const LobbyThemeSelector: React.FC<LobbyThemeSelectorProps> = ({ onSelectTheme, onBack }) => {
    const themes: LobbyTheme[] = [...Object.values(Generation), 'All Generations'];
    
    return (
         <div className="w-full max-w-2xl mx-auto">
            <button onClick={onBack} className="mb-4 bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-300">
                &larr; Back
            </button>
            <div className="w-full text-center p-8 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700">
                <h2 className="text-4xl font-anton text-cyan-300 mb-2">CHOOSE LOBBY THEME</h2>
                <p className="text-slate-400 mb-8">The theme you pick influences the kind of prompts you'll get!</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {themes.map(theme => {
                         const isAllGen = theme === 'All Generations';
                         const color = isAllGen ? 'bg-gradient-to-br from-purple-500 via-blue-500 to-green-500' : GENERATION_COLORS[theme as Generation];
                         const hoverColor = isAllGen ? 'hover:brightness-125' : 'hover:bg-opacity-80';
                        
                        return (
                            <button
                                key={theme}
                                onClick={() => onSelectTheme(theme)}
                                className={`text-white font-bold py-8 px-6 rounded-lg text-xl transform hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-opacity-50 font-bebas tracking-wider ${color} ${hoverColor}`}
                            >
                                {theme}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LobbyThemeSelector;
