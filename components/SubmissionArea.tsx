import React, { useState } from 'react';

interface SubmissionAreaProps {
    onSubmit: (backronym: string) => void;
    acronym: string;
    countdown: number;
    hasSubmitted: boolean;
}

const SubmissionArea: React.FC<SubmissionAreaProps> = ({ onSubmit, acronym, countdown, hasSubmitted }) => {
    const [backronym, setBackronym] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(backronym.trim() && !hasSubmitted) {
            onSubmit(backronym);
        }
    };

    const isUrgent = countdown <= 10;
    const timeColor = isUrgent ? 'text-red-500' : 'text-black';
    const animation = isUrgent ? 'animate-pulse' : '';
    
    const isDisabled = hasSubmitted || countdown <= 0;

    return (
        <div className="w-full max-w-2xl mx-auto mt-4">
             <form onSubmit={handleSubmit} className="relative p-6 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700">
                <div className="absolute -top-8 right-2 transform ">
                     <div className={`w-24 h-24 bg-yellow-400 transform rotate-45 flex items-center justify-center shadow-lg ${animation}`}>
                        <div className={`transform -rotate-45 text-center font-anton text-4xl ${timeColor}`}>{countdown}</div>
                     </div>
                </div>

                <h3 className="text-xl font-semibold text-slate-200 mb-3">Your Entry for <span className="font-bold text-yellow-400">{acronym}</span></h3>
                <textarea
                    value={backronym}
                    onChange={(e) => setBackronym(e.target.value)}
                    placeholder={hasSubmitted ? "Waiting for other players..." : "What does it stand for...?"}
                    className="w-full h-32 p-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors text-lg"
                    maxLength={100}
                    disabled={isDisabled}
                />
                <button
                    type="submit"
                    disabled={isDisabled || !backronym.trim()}
                    className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-xl transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 font-bebas tracking-wider"
                >
                    {hasSubmitted ? "Submitted!" : "Submit"}
                </button>
            </form>
        </div>
    );
};

export default SubmissionArea;
