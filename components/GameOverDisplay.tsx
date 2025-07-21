
import React from 'react';
import { Game } from '../types';
import TrophyIcon from './icons/TrophyIcon';
import Confetti from 'react-dom-confetti';

interface GameOverDisplayProps {
    game: Game;
    onMainMenu: () => void;
}

const GameOverDisplay: React.FC<GameOverDisplayProps> = ({ game, onMainMenu }) => {
    const winner = game.players.find(p => p.id === game.gameWinnerId);
    
    const config = {
        angle: 90,
        spread: 360,
        startVelocity: 40,
        elementCount: 100,
        dragFriction: 0.12,
        duration: 3000,
        stagger: 3,
        width: "10px",
        height: "10px",
        perspective: "500px",
        colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-8 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border-2 border-yellow-400 text-center relative flex flex-col items-center">
            <div className="absolute">
                 <Confetti active={!!winner} config={config} />
            </div>

            <TrophyIcon className="w-24 h-24 text-yellow-400" />
            
            <h2 className="text-6xl font-anton text-white mt-4">GAME OVER</h2>
            
            {winner ? (
                <>
                    <p className="text-3xl font-bebas text-cyan-300 tracking-wider mt-2">Congratulations to the Acronym Clash Champion!</p>
                    <p className="text-7xl font-anton text-yellow-400 my-4" style={{ textShadow: '3px 3px 0px #000' }}>
                        {winner.name}
                    </p>
                </>
            ) : (
                <p className="text-3xl font-bebas text-cyan-300 tracking-wider mt-2">
                    What a battle! It's a draw!
                </p>
            )}

            <button
                onClick={onMainMenu}
                className="mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-2xl transform hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 font-bebas tracking-wider"
            >
                Back to Main Menu
            </button>
        </div>
    );
};

// Dummy Confetti component if the real one isn't available
const Confetti: React.FC<{active: boolean, config: any}> = ({ active }) => {
    // In a real scenario, you'd use a library like 'react-dom-confetti'.
    // This is a placeholder to avoid breaking the component.
    if (!active) return null;
    return <div className="absolute inset-0 pointer-events-none">[Pretend confetti is falling!]</div>;
};


export default GameOverDisplay;
