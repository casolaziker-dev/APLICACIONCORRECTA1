
import React from 'react';
import { Game, GameStats } from '../types';
import { getStats } from '../services/scoreService';

interface GameListProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
  isDark: boolean;
}

const GameList: React.FC<GameListProps> = ({ games, onSelectGame, isDark }) => {
  return (
    <div className="flex flex-col space-y-4 pt-2">
      {games.map((game) => {
        const stats = getStats(game.id);
        
        return (
          <button
            key={game.id}
            onClick={() => onSelectGame(game)}
            className={`flex items-center p-5 rounded-[2rem] border transition-all active:scale-[0.97] group
              ${isDark 
                ? 'bg-slate-900/50 border-white/5 hover:border-indigo-500/40 hover:bg-slate-900' 
                : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-lg shadow-sm'}
            `}
          >
            <div className={`w-16 h-16 ${game.color} rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-black/10 group-hover:rotate-12 transition-transform duration-500`}>
              {game.icon}
            </div>
            <div className="ml-5 text-left flex-1">
              <h4 className={`font-black text-lg leading-tight uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {game.title}
              </h4>
              <p className={`text-[11px] font-medium line-clamp-1 mb-2 tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {game.description}
              </p>
              
              {/* Stats Badge */}
              <div className="flex items-center space-x-2">
                {game.players === 1 ? (
                  <>
                    {stats.highScore !== undefined && (
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black border uppercase tracking-wider ${isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                        Best: {stats.highScore}
                      </span>
                    )}
                    {stats.bestMoves !== undefined && (
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black border uppercase tracking-wider ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                        Record: {stats.bestMoves} movs
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {stats.totalPlayed > 0 && (
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black border uppercase tracking-wider ${isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        P1: {stats.p1Wins || 0} | P2: {stats.p2Wins || 0}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className={`ml-2 transition-transform group-hover:translate-x-1 ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default GameList;
