
import React, { useState } from 'react';
import { Game } from '../types';

interface FaceoffDisplayProps {
    game: Game;
    currentPlayerId: string;
    onFaceoffSubmit: (backronym: string) => void;
    onFaceoffVote: (votedPlayerId: string) => void;
}

const FaceoffDisplay: React.FC<FaceoffDisplayProps> = ({ game, currentPlayerId, onFaceoffSubmit, onFaceoffVote }) => {
    const { phase, faceoffPlayers, faceoffSubmissions, countdown } = game;
    const isFaceoffPlayer = faceoffPlayers.includes(currentPlayerId);
    const playerHasSubmitted = game.players.find(p => p.id === currentPlayerId)?.hasSubmitted || false;
    const playerHasVoted = faceoffSubmissions.some(sub => sub.votes.includes(currentPlayerId));
    
    const [backronym, setBackronym] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (backronym.trim() && !playerHasSubmitted) {
            onFaceoffSubmit(backronym);
        }
    };
    
    const renderContent = () => {
        switch (phase) {
            case 'FaceoffSubmitting':
                if (isFaceoffPlayer) {
                    return (
                        <form onSubmit={handleSubmit} className="w-full max-w-xl">
                            <h3 className="text-2xl font-semibold text-slate-200 mb-3 text-center">Your Final Entry for <span className="font-bold text-yellow-400">{game.acronym}</span></h3>
                            <textarea
                                value={backronym}
                                onChange={(e) => setBackronym(e.target.value)}
                                placeholder={playerHasSubmitted ? "Waiting for other finalists..." : "Your final witty remark..."}
                                className="w-full h-32 p-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors text-lg"
                                maxLength={100}
                                disabled={playerHasSubmitted || countdown <= 0}
                            />
                            <button
                                type="submit"
                                disabled={playerHasSubmitted || !backronym.trim() || countdown <= 0}
                                className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-xl transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 font-bebas tracking-wider"
                            >
                                {playerHasSubmitted ? "Submitted!" : "Submit Final Answer"}
                            </button>
                        </form>
                    );
                }
                return <p className="text-2xl text-slate-300">Waiting for the finalists to submit their answers...</p>;

            case 'FaceoffVoting':
                if (isFaceoffPlayer) {
                    return <p className="text-2xl text-slate-300">Your fate is in their hands! Waiting for votes...</p>;
                }
                return (
                    <div className="w-full max-w-3xl">
                         <h2 className="font-bebas text-4xl text-center text-yellow-400 mb-6 tracking-wider">VOTE FOR THE WINNER</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {faceoffSubmissions.map((sub, i) => (
                                <div key={i} className="flex flex-col items-center gap-3">
                                    <div className="w-full text-center p-6 bg-slate-700 border-2 border-slate-600 rounded-lg min-h-[120px] flex items-center justify-center">
                                        <p className="italic text-2xl text-white">"{sub.backronym}"</p>
                                    </div>
                                    <button
                                        onClick={() => onFaceoffVote(sub.playerId)}
                                        disabled={playerHasVoted || countdown <= 0}
                                        className="w-48 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-blue-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed font-bebas text-2xl tracking-wider"
                                    >
                                        {playerHasVoted ? 'Voted!' : 'VOTE'}
                                    </button>
                                </div>
                            ))}
                         </div>
                    </div>
                );
            case 'FaceoffResults':
                const winnerSubmission = faceoffSubmissions.sort((a,b) => b.votes.length - a.votes.length)[0];
                const winner = game.players.find(p => p.id === winnerSubmission.playerId);
                return (
                     <div className="text-center">
                        <p className="text-2xl text-slate-300">The winning entry is...</p>
                        <div className="my-4 p-6 bg-slate-900 border-2 border-yellow-400 rounded-lg">
                             <p className="italic text-3xl text-white">"{winnerSubmission.backronym}"</p>
                        </div>
                        <p className="text-4xl font-bebas text-cyan-300">Submitted by</p>
                        <p className="text-6xl font-anton text-yellow-400 animate-pulse">{winner?.name || 'A Mystery Player'}</p>
                    </div>
                )
            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-8 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 flex flex-col items-center">
            <div className="text-center mb-8">
                <h2 className="text-6xl font-anton text-yellow-400">FINAL FACEOFF</h2>
                <p className="text-slate-300 text-lg">For the acronym <span className="font-bold text-white">{game.acronym}</span>. One winner takes all!</p>
            </div>
             <div className="absolute top-4 right-4 text-center">
                <p className={`font-anton text-5xl ${countdown <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{countdown}</p>
            </div>
            
            <div className="w-full flex justify-center items-center min-h-[200px]">
                {renderContent()}
            </div>
        </div>
    );
};

export default FaceoffDisplay;
