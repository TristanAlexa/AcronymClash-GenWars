
import React, { useEffect, useState } from 'react';
import { Game } from '../types';
import LicensePlate from './LicensePlate';

interface RoundRevealDisplayProps {
    game: Game;
}

const RoundRevealDisplay: React.FC<RoundRevealDisplayProps> = ({ game }) => {
    const { phase, theme, acronym, countdown, roundNumber } = game;
    const isThemeReveal = phase === 'RoundThemeReveal';
    
    // Keyed state to force re-render on phase change
    const [key, setKey] = useState(phase);
    useEffect(() => {
        setKey(phase);
    }, [phase]);
    
    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center p-8 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700">
            <p className="font-bebas text-4xl text-yellow-400 tracking-wider">ROUND {roundNumber}</p>
            <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
                {/* Theme Display */}
                <div key={`${key}-theme`} className={`absolute w-full h-full flex flex-col items-center justify-center text-center transition-all duration-700 ease-in-out ${isThemeReveal ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-full'}`}>
                    <p className="font-bebas text-2xl text-slate-300">This round's theme is...</p>
                    <h2 className="font-anton text-5xl text-cyan-300 uppercase tracking-wide" style={{ textShadow: '2px 2px 0px #000' }}>
                        {theme}
                    </h2>
                </div>
                
                {/* Acronym Display */}
                 <div key={`${key}-acronym`} className={`absolute w-full h-full flex flex-col items-center justify-center text-center transition-all duration-700 ease-in-out ${!isThemeReveal ? 'opacity-100 transform-none' : 'opacity-0 translate-y-full'}`}>
                    <p className="font-bebas text-2xl text-slate-300">Your acronym is...</p>
                    <div className="mt-4">
                        <LicensePlate region="Ontario" text={acronym} type="acronym" slogan="Get Ready!" />
                    </div>
                </div>
            </div>
             <p className="font-anton text-6xl text-white mt-4">{countdown}</p>
        </div>
    );
};

export default RoundRevealDisplay;
