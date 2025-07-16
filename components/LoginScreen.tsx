import React, { useState } from 'react';
import { Generation } from '../types';
import { GENERATION_COLORS } from '../constants';

interface LoginScreenProps {
    onLogin: (name: string, generation: Generation) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [generation, setGeneration] = useState<Generation | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && password.trim() && generation) {
            onLogin(name.trim(), generation);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700">
            <h2 className="text-3xl font-bold text-center text-cyan-300 mb-2">Create Your Player</h2>
            <p className="text-slate-400 text-center mb-8">Join the fray! Your generation determines your team.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Username"
                    className="w-full p-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors text-lg"
                    maxLength={20}
                    required
                    autoFocus
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (for simulation)"
                    className="w-full p-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors text-lg"
                    required
                />
                <div>
                    <label className="block text-lg font-semibold text-center text-slate-300 mb-3">Choose Your Generation</label>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.values(Generation).map(gen => (
                            <button
                                type="button"
                                key={gen}
                                onClick={() => setGeneration(gen)}
                                className={`w-full py-3 text-white font-bold rounded-lg transition-all duration-200 border-2 ${generation === gen ? `${GENERATION_COLORS[gen]} scale-105 shadow-lg border-yellow-400` : `bg-slate-700/50 hover:bg-slate-600 border-slate-600`}`}
                            >
                                {gen}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={!name.trim() || !password.trim() || !generation}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-2xl transform hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50 font-bebas tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    Enter the Clash
                </button>
            </form>
        </div>
    );
};

export default LoginScreen;
