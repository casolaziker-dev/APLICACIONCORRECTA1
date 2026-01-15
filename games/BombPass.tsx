
import React, { useState, useEffect, useRef } from 'react';
import { record2PWin } from '../services/scoreService';

const BombPass: React.FC = () => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'exploded'>('idle');
  const [holder, setHolder] = useState<1 | 2>(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [winner, setWinner] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  const startGame = () => {
    setGameState('playing');
    setHolder(Math.random() > 0.5 ? 1 : 2);
    const duration = 5 + Math.random() * 10; // 5 a 15 segundos
    setTimeLeft(duration);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timerRef.current);
          explode();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
  };

  const explode = () => {
    setGameState('exploded');
    if (navigator.vibrate) navigator.vibrate([100, 50, 500]);
  };

  useEffect(() => {
    if (gameState === 'exploded') {
      const win = holder === 1 ? 2 : 1;
      setWinner(win);
      record2PWin('bomb-pass', win as 1 | 2);
    }
  }, [gameState]);

  const passBomb = (player: 1 | 2) => {
    if (gameState !== 'playing' || holder !== player) return;
    setHolder(player === 1 ? 2 : 1);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const bombScale = gameState === 'playing' ? 1 + (1 / (timeLeft + 1)) * 0.5 : 1;
  const bombColor = timeLeft < 3 ? 'text-red-500' : timeLeft < 6 ? 'text-orange-500' : 'text-yellow-500';

  return (
    <div className={`flex flex-col h-full bg-slate-950 overflow-hidden relative ${gameState === 'exploded' ? 'animate-shake' : ''}`}>
      <style>{`
        @keyframes full-explosion {
          0% { transform: scale(0); opacity: 0; }
          10% { opacity: 1; }
          40% { transform: scale(4); background: white; }
          100% { transform: scale(6); background: #ef4444; opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-8px, 8px); }
          20%, 40%, 60%, 80% { transform: translate(8px, -8px); }
        }
        .animate-explosion {
          animation: full-explosion 1.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>

      {/* Explosión que tapa toda la pantalla */}
      {gameState === 'exploded' && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="w-64 h-64 rounded-full animate-explosion shadow-[0_0_100px_#ef4444]" />
          <div className="absolute inset-0 bg-white/40 animate-pulse duration-75" />
        </div>
      )}

      {/* Player 1 Area (Top) */}
      <button 
        onClick={() => passBomb(1)}
        className={`flex-1 w-full transition-colors flex flex-col items-center justify-center rotate-180
          ${holder === 1 && gameState === 'playing' ? 'bg-blue-600/20' : 'bg-slate-900/40'}
          ${gameState === 'exploded' && holder === 1 ? 'bg-red-900/60' : ''}
        `}
      >
        <span className="text-xs font-black text-blue-400 mb-4 tracking-widest uppercase">Jugador 1</span>
        {holder === 1 && gameState === 'playing' && <span className="text-xl font-bold text-white animate-bounce">¡PÁSALA!</span>}
      </button>

      {/* Bomb Center */}
      <div className="h-48 bg-slate-900 border-y-4 border-slate-800 flex items-center justify-center relative z-10 shadow-2xl">
        {gameState === 'idle' ? (
          <button 
            onClick={startGame}
            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-[0_0_30px_rgba(79,70,229,0.4)] active:scale-95 transition-all"
          >
            EMPEZAR
          </button>
        ) : (
          <div 
            className={`text-8xl transition-all duration-100 ${bombColor} ${gameState === 'playing' ? 'animate-pulse' : ''}`}
            style={{ transform: `scale(${bombScale}) rotate(${gameState === 'playing' ? Math.random() * 5 - 2.5 : 0}deg)` }}
          >
            {gameState === 'exploded' ? '💥' : '💣'}
          </div>
        )}
      </div>

      {/* Player 2 Area (Bottom) */}
      <button 
        onClick={() => passBomb(2)}
        className={`flex-1 w-full transition-colors flex flex-col items-center justify-center
          ${holder === 2 && gameState === 'playing' ? 'bg-red-600/20' : 'bg-slate-900/40'}
          ${gameState === 'exploded' && holder === 2 ? 'bg-red-900/60' : ''}
        `}
      >
        <span className="text-xs font-black text-red-400 mb-4 tracking-widest uppercase">Jugador 2</span>
        {holder === 2 && gameState === 'playing' && <span className="text-xl font-bold text-white animate-bounce">¡PÁSALA!</span>}
      </button>

      {gameState === 'exploded' && (
        <div className="absolute inset-0 z-[250] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-1000 delay-500">
           <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 text-center shadow-2xl">
             <h2 className="text-4xl font-black text-white mb-2">¡BOOM!</h2>
             <p className="text-indigo-400 text-xl font-bold mb-6 uppercase">GANADOR: P{winner}</p>
             <button onClick={() => setGameState('idle')} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all">OTRA VEZ</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default BombPass;
