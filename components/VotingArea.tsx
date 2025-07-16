import React from 'react';
import { Game } from '../types';
import LicensePlate from './LicensePlate';

interface VotingAreaProps {
    game: Game;
    currentPlayerId: string;
    onVote: (votedPlayerId: string) => void;
}

const VotingArea: React.FC<VotingAreaProps> = ({ game, currentPlayerId, onVote }) => {
    
    const playerHasVoted = game.submissions.some(sub => sub.votes.includes(currentPlayerId));

    const handleVoteClick = (playerId: string) => {
        if (!playerHasVoted) {
            onVote(playerId);
        }
    };

    return (
        <div className="w-full mt-4 relative">
            <div className="absolute -top-10 right-0 text-center">
                <p className="font-bebas text-2xl text-slate-300">Time to Vote!</p>
                <p className={`font-anton text-5xl ${game.countdown <=5 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>{game.countdown}</p>
            </div>
            <h2 className="font-bebas text-4xl text-center text-yellow-400 mb-6 tracking-wider">VOTE FOR THE BEST BACKRONYM</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
                {game.submissions.map((sub, index) => {
                    const submissionPlayer = game.players.find(p => p.id === sub.playerId);
                    if (!submissionPlayer) return null;

                    const isPlayerSubmission = sub.playerId === currentPlayerId;
                    
                    return (
                        <div key={index} className="flex flex-col items-center gap-2 animate-fade-in transition-transform duration-300 hover:scale-105">
                           <LicensePlate 
                                region={submissionPlayer.region}
                                text={sub.backronym}
                                type="submission"
                           />
                            <button
                                onClick={() => handleVoteClick(sub.playerId)}
                                disabled={isPlayerSubmission || playerHasVoted || game.countdown <= 0}
                                className="w-48 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-blue-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed font-bebas text-2xl tracking-wider"
                            >
                                {isPlayerSubmission ? 'Your Entry' : playerHasVoted ? 'Voted!' : 'VOTE'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VotingArea;