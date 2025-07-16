import React from 'react';
import { Submission, Player, Game } from '../types';
import TrophyIcon from './icons/TrophyIcon';
import { GENERATION_COLORS } from '../constants';

interface ResultsDisplayProps {
    game: Game;
    onPlayAgain: () => void;
    onMainMenu: () => void;
}

const PodiumSpot: React.FC<{ player: Player, submission: Submission, rank: number, height: string, isWinner: boolean }> = ({ player, submission, rank, height, isWinner }) => {
    const rankColors = {
        1: 'bg-yellow-500 border-yellow-400',
        2: 'bg-gray-400 border-gray-300',
        3: 'bg-orange-600 border-orange-500'
    };
    const rankText = { 1: '1st', 2: '2nd', 3: '3rd' };

    return (
        <div className="flex flex-col items-center">
            <div className="mb-2 text-center">
                <p className={`font-bold text-lg text-white ${GENERATION_COLORS[player.generation]} px-2 rounded-t-md`}>{player.name}</p>
                <p className="italic text-slate-200 text-center">"{submission?.backronym || 'No submission'}"</p>
                 {isWinner && <p className="font-bold text-green-400 text-sm">ROUND WINNER (+300)</p>}
                <p className="font-bold text-cyan-300">{player.score.toLocaleString()} PTS</p>
            </div>
            <div className={`w-24 md:w-32 flex flex-col items-center justify-center p-4 rounded-t-lg ${rankColors[rank]} ${height}`}>
                <TrophyIcon className="w-8 h-8 text-white mb-2" />
                <span className="text-3xl font-bold text-white">{rankText[rank]}</span>
            </div>
        </div>
    );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ game, onPlayAgain, onMainMenu }) => {
    const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
    const topThree = sortedPlayers.slice(0, 3);
    const otherPlayers = sortedPlayers.slice(3);

    return (
        <div className="w-full p-8 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700">
            <div className="text-center mb-8">
                <h2 className="text-5xl font-anton text-yellow-400">RESULTS</h2>
                <p className="text-slate-300 text-lg">For the acronym <span className="font-bold text-white">{game.acronym}</span></p>
            </div>

            {/* Podium */}
            <div className="flex justify-center items-end gap-2 md:gap-4 mb-12">
                {topThree[1] && <PodiumSpot player={topThree[1]} submission={game.submissions.find(s => s.playerId === topThree[1].id)!} rank={2} height="h-32" isWinner={game.roundWinnerId === topThree[1].id} />}
                {topThree[0] && <PodiumSpot player={topThree[0]} submission={game.submissions.find(s => s.playerId === topThree[0].id)!} rank={1} height="h-40" isWinner={game.roundWinnerId === topThree[0].id} />}
                {topThree[2] && <PodiumSpot player={topThree[2]} submission={game.submissions.find(s => s.playerId === topThree[2].id)!} rank={3} height="h-24" isWinner={game.roundWinnerId === topThree[2].id} />}
            </div>

            {/* Other Players */}
            {(otherPlayers.length > 0 || topThree.length === 0) && (
                 <div className="mt-8">
                    <h3 className="text-2xl font-bebas text-center text-slate-300 tracking-wider mb-4">All Scores</h3>
                    <div className="space-y-2 max-w-md mx-auto">
                        {sortedPlayers.map((player, index) => (
                            <div key={player.id} className="bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
                                <p className="font-semibold text-white">{index + 1}. {player.name}</p>
                                <p className="font-bold text-cyan-400">{player.score.toLocaleString()} PTS</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                 <button
                    onClick={onPlayAgain}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-2xl transform hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 font-bebas tracking-wider"
                >
                    Play Again
                </button>
                 <button
                    onClick={onMainMenu}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-2xl transform hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 font-bebas tracking-wider"
                >
                    Main Menu
                </button>
            </div>
        </div>
    );
};

export default ResultsDisplay;
