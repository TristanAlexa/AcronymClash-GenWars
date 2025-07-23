
import React from 'react';
import { Game } from '../types';

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
            <div className="flex flex-col space-y-4">
                {game.submissions.map((sub, index) => {
                    // Submissions are anonymous. The server prevents self-voting.
                    // We will also hide the player's own submission from their view.
                    if (sub.playerId === currentPlayerId) {
                        return null;
                    }

                    return (
                        <div key={index} className="flex items-center justify-between p-4 bg-slate-700/60 rounded-lg animate-fade-in transition-shadow duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
                            <p className="text-white italic text-lg md:text-xl mr-4 flex-grow">"{sub.backronym}"</p>
                            <button
                                onClick={() => handleVoteClick(sub.playerId)}
                                disabled={playerHasVoted || game.countdown <= 0}
                                className="flex-shrink-0 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-blue-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed font-bebas text-xl tracking-wider"
                            >
                                {playerHasVoted ? 'Voted' : 'Vote'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VotingArea;
