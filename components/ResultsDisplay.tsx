
import React from 'react';
import { Player, Game } from '../types';
import TrophyIcon from './icons/TrophyIcon';
import { GENERATION_COLORS } from '../constants';

interface RoundResultsDisplayProps {
    game: Game;
}

const PodiumSpot: React.FC<{ player: Player, submissionText: string, rank: number, height: string, isWinner: boolean }> = ({ player, submissionText, rank, height, isWinner }) => {
    const rankColors: Record<number, string> = {
        1: 'bg-yellow-500 border-yellow-400',
        2: 'bg-gray-400 border-gray-300',
        3: 'bg-orange-600 border-orange-500'
    };
    const rankText: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' };

    return (
        <div className="flex flex-col items-center">
            <div className="mb-2 text-center h-28 flex flex-col justify-end">
                <p className={`font-bold text-lg text-white ${GENERATION_COLORS[player.generation]} px-2 rounded-t-md`}>{player.name}</p>
                <p className="italic text-slate-200 text-center">"{submissionText}"</p>
                 {isWinner && <p className="font-bold text-green-400 text-sm">ROUND WINNER (+300)</p>}
                <p className="font-bold text-cyan-300">{player.score.toLocaleString()} PTS</p>
            </div>
            <div className={`w-24 md:w-32 flex flex-col items-center justify-center p-4 rounded-t-lg ${rankColors[rank] || 'bg-slate-600'} ${height}`}>
                <TrophyIcon className="w-8 h-8 text-white mb-2" />
                <span className="text-3xl font-bold text-white">{rankText[rank] || `${rank}th`}</span>
            </div>
        </div>
    );
};

const RoundResultsDisplay: React.FC<RoundResultsDisplayProps> = ({ game }) => {
    const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
    const topThree = sortedPlayers.slice(0, 3);
    
    const getSubmissionForPlayer = (playerId: string) => {
        return game.submissions.find(s => s.playerId === playerId)?.backronym || 'No submission';
    }

    const nextStepMessage = game.roundNumber < 3 
        ? `Get ready for Round ${game.roundNumber + 1}...` 
        : "The final scores are in! Time for the Face-off!";

    return (
        <div className="w-full p-8 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-5xl font-anton text-yellow-400">ROUND {game.roundNumber} RESULTS</h2>
                <p className="text-slate-300 text-lg">For the acronym <span className="font-bold text-white">{game.acronym}</span></p>
            </div>

            {/* Podium */}
            <div className="flex justify-center items-end gap-2 md:gap-4 mb-12 min-h-[20rem]">
                {topThree[1] && <PodiumSpot player={topThree[1]} submissionText={getSubmissionForPlayer(topThree[1].id)} rank={2} height="h-32" isWinner={game.roundWinnerId === topThree[1].id} />}
                {topThree[0] && <PodiumSpot player={topThree[0]} submissionText={getSubmissionForPlayer(topThree[0].id)} rank={1} height="h-40" isWinner={game.roundWinnerId === topThree[0].id} />}
                {topThree[2] && <PodiumSpot player={topThree[2]} submissionText={getSubmissionForPlayer(topThree[2].id)} rank={3} height="h-24" isWinner={game.roundWinnerId === topThree[2].id} />}
            </div>
            
            <div className="mt-10 text-center">
                 <h3 className="text-3xl font-bebas text-cyan-300 tracking-wider animate-pulse">{nextStepMessage}</h3>
            </div>
        </div>
    );
};

export default RoundResultsDisplay;
