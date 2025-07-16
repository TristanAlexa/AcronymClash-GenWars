
import React, { useState } from 'react';

interface NameInputProps {
    onNameSubmit: (name: string) => void;
}

const NameInput: React.FC<NameInputProps> = ({ onNameSubmit }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onNameSubmit(name.trim());
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700">
            <h2 className="text-3xl font-bold text-center text-cyan-300 mb-2">Enter Your Player Name</h2>
            <p className="text-slate-400 text-center mb-8">This will be shown on the leaderboard and your license plate.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. AcronymAce"
                    className="w-full p-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors text-lg"
                    maxLength={20}
                    required
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={!name.trim()}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-2xl transform hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50 font-bebas tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    Let's Clash!
                </button>
            </form>
        </div>
    );
};

export default NameInput;
