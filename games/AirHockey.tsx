
import React, { useState, useEffect, useRef } from 'react';
import { record2PWin } from '../services/scoreService';

const TABLE_WIDTH = 320;
const TABLE_HEIGHT = 480;
const PUCK_RADIUS = 16;
const GOAL_WIDTH = 130;
const MAX_PUCK_SPEED = 18;
const FIRE_THRESHOLD = 15000; // 15 segundos para modo fuego

interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const AirHockey: React.FC = () => {
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [gameState, setGameState] = useState<'config' | 'waiting' | 'playing' | 'gameOver' | 'goal'>('config');
  const [winScore, setWinScore] = useState(5);
  const [paddleSize, setPaddleSize] = useState(28); // Radio del mazo
  const [lastScorer, setLastScorer] = useState<number | null>(null);
  const [isFireMode, setIsFireMode] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastGoalTime = useRef<number>(Date.now());
  
  const puck = useRef<Entity>({ x: TABLE_WIDTH / 2, y: TABLE_HEIGHT / 2, vx: 0, vy: 0 });
  const paddle1 = useRef<Entity>({ x: TABLE_WIDTH / 2, y: 80, vx: 0, vy: 0 });
  const paddle2 = useRef<Entity>({ x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - 80, vx: 0, vy: 0 });
  const animationRef = useRef<number>(null);

  const resetPuck = () => {
    puck.current = { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT / 2, vx: 0, vy: 0 };
    setIsFireMode(false);
    lastGoalTime.current = Date.now();
    setGameState('waiting');
  };

  const handleGoal = (player: number) => {
    const pointsToAdd = isFireMode ? 2 : 1;
    setLastScorer(player);
    setGameState('goal');
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    setTimeout(() => {
      setScores(s => {
        const next = player === 1 ? { ...s, p1: s.p1 + pointsToAdd } : { ...s, p2: s.p2 + pointsToAdd };
        if (next.p1 >= winScore || next.p2 >= winScore) {
          setGameState('gameOver');
        } else {
          resetPuck();
        }
        return next;
      });
    }, 1500);
  };

  const handleInput = (e: React.TouchEvent | React.MouseEvent) => {
    if (gameState === 'gameOver' || gameState === 'goal' || gameState === 'config') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = TABLE_WIDTH / rect.width;
    const scaleY = TABLE_HEIGHT / rect.height;

    const processTouch = (clientX: number, clientY: number) => {
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      if (gameState === 'waiting') {
        setGameState('playing');
        lastGoalTime.current = Date.now();
      }

      if (y < TABLE_HEIGHT / 2) {
        paddle1.current.x = Math.max(paddleSize, Math.min(TABLE_WIDTH - paddleSize, x));
        paddle1.current.y = Math.max(paddleSize, Math.min(TABLE_HEIGHT / 2 - paddleSize - 5, y));
      } else {
        paddle2.current.x = Math.max(paddleSize, Math.min(TABLE_WIDTH - paddleSize, x));
        paddle2.current.y = Math.max(TABLE_HEIGHT / 2 + paddleSize + 5, Math.min(TABLE_HEIGHT - paddleSize, y));
      }
    };

    if ('touches' in e) {
      const touchEvent = e as React.TouchEvent;
      for (let i = 0; i < touchEvent.touches.length; i++) {
        const t = touchEvent.touches[i];
        processTouch(t.clientX, t.clientY);
      }
    } else {
      const mouseEvent = e as React.MouseEvent;
      processTouch(mouseEvent.clientX, mouseEvent.clientY);
    }
  };

  useEffect(() => {
    const update = () => {
      const p = puck.current;
      
      if (gameState === 'playing') {
        if (!isFireMode && Date.now() - lastGoalTime.current > FIRE_THRESHOLD) {
          setIsFireMode(true);
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > MAX_PUCK_SPEED) {
          p.vx = (p.vx / speed) * MAX_PUCK_SPEED;
          p.vy = (p.vy / speed) * MAX_PUCK_SPEED;
        }

        if (p.x < PUCK_RADIUS) { p.x = PUCK_RADIUS; p.vx *= -0.8; }
        if (p.x > TABLE_WIDTH - PUCK_RADIUS) { p.x = TABLE_WIDTH - PUCK_RADIUS; p.vx *= -0.8; }

        const isInGoalWidth = p.x > (TABLE_WIDTH - GOAL_WIDTH) / 2 && p.x < (TABLE_WIDTH + GOAL_WIDTH) / 2;
        
        if (p.y < PUCK_RADIUS) {
          if (isInGoalWidth) handleGoal(2);
          else { p.y = PUCK_RADIUS; p.vy *= -0.8; }
        }

        if (p.y > TABLE_HEIGHT - PUCK_RADIUS) {
          if (isInGoalWidth) handleGoal(1);
          else { p.y = TABLE_HEIGHT - PUCK_RADIUS; p.vy *= -0.8; }
        }

        [paddle1.current, paddle2.current].forEach(paddle => {
          const dx = p.x - paddle.x;
          const dy = p.y - paddle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = paddleSize + PUCK_RADIUS;
          if (distance < minDistance) {
            const angle = Math.atan2(dy, dx);
            p.x = paddle.x + Math.cos(angle) * minDistance;
            p.y = paddle.y + Math.sin(angle) * minDistance;
            p.vx = Math.cos(angle) * (speed + 7);
            p.vy = Math.sin(angle) * (speed + 7);
          }
        });
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, TABLE_WIDTH - 4, TABLE_HEIGHT - 4);
        ctx.setLineDash([10, 10]);
        ctx.beginPath(); ctx.moveTo(0, TABLE_HEIGHT / 2); ctx.lineTo(TABLE_WIDTH, TABLE_HEIGHT / 2); ctx.stroke();
        ctx.setLineDash([]);

        ctx.lineWidth = 8;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#3b82f6'; ctx.shadowColor = '#3b82f6';
        ctx.beginPath(); ctx.moveTo((TABLE_WIDTH - GOAL_WIDTH) / 2, 4); ctx.lineTo((TABLE_WIDTH + GOAL_WIDTH) / 2, 4); ctx.stroke();
        ctx.strokeStyle = '#ef4444'; ctx.shadowColor = '#ef4444';
        ctx.beginPath(); ctx.moveTo((TABLE_WIDTH - GOAL_WIDTH) / 2, TABLE_HEIGHT - 4); ctx.lineTo((TABLE_WIDTH + GOAL_WIDTH) / 2, TABLE_HEIGHT - 4); ctx.stroke();
        ctx.shadowBlur = 0;

        const drawPaddle = (pad: Entity, color: string, glow: string) => {
          ctx.shadowBlur = 20; ctx.shadowColor = glow;
          ctx.fillStyle = color;
          ctx.beginPath(); ctx.arc(pad.x, pad.y, paddleSize, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = 'white'; ctx.lineWidth = 3; ctx.stroke();
          ctx.shadowBlur = 0;
        };
        drawPaddle(paddle1.current, '#3b82f6', '#2563eb');
        drawPaddle(paddle2.current, '#ef4444', '#dc2626');

        if (gameState !== 'goal' && gameState !== 'config') {
          if (isFireMode) {
            ctx.shadowBlur = 30; ctx.shadowColor = '#f97316';
            ctx.fillStyle = '#f97316';
            ctx.beginPath(); ctx.arc(p.x, p.y, PUCK_RADIUS, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fffbeb';
            ctx.beginPath(); ctx.arc(p.x, p.y, PUCK_RADIUS * 0.5, 0, Math.PI * 2); ctx.fill();
          } else {
            ctx.shadowBlur = 15; ctx.shadowColor = 'white';
            ctx.fillStyle = gameState === 'waiting' ? 'rgba(255,255,255,0.8)' : 'white';
            ctx.beginPath(); ctx.arc(p.x, p.y, PUCK_RADIUS, 0, Math.PI * 2); ctx.fill();
          }
          ctx.shadowBlur = 0;
        }
      }
      animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [gameState, isFireMode, paddleSize]);

  const startGame = () => {
    setGameState('waiting');
    lastGoalTime.current = Date.now();
  };

  if (gameState === 'config') {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-slate-950 p-6 space-y-10 animate-in fade-in duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">Hockey Pro</h2>
          <p className="text-indigo-400 text-[10px] font-black tracking-widest uppercase">Elige tu configuración</p>
        </div>

        <div className="w-full space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">Puntos de victoria</p>
            <div className="grid grid-cols-3 gap-3">
              {[3, 5, 10].map(val => (
                <button key={val} onClick={() => setWinScore(val)} className={`py-5 rounded-3xl font-black text-xl border-2 transition-all ${winScore === val ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">Tamaño de Personajes</p>
            <div className="grid grid-cols-3 gap-3">
              {[{ label: '⚡', size: 22 }, { label: '⚖️', size: 28 }, { label: '🛡️', size: 36 }].map(opt => (
                <button key={opt.size} onClick={() => setPaddleSize(opt.size)} className={`py-4 rounded-3xl flex flex-col items-center border-2 transition-all ${paddleSize === opt.size ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  <span className="text-2xl mb-1">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={startGame} className="w-full bg-white text-slate-950 py-6 rounded-[2.5rem] font-black text-2xl shadow-xl active:scale-95 transition-all uppercase tracking-tighter italic">
          EMPEZAR DUELO
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center justify-center bg-slate-950 p-4 touch-none select-none overflow-hidden relative">
      <style>{`
        @keyframes shake-hockey {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-4px, 4px); }
          50% { transform: translate(4px, -4px); }
          75% { transform: translate(-4px, -4px); }
        }
        .screen-shake { animation: shake-hockey 0.1s linear infinite; }
        @keyframes goal-pop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-goal { animation: goal-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      <div className="absolute top-6 left-6 right-6 flex justify-between items-center pointer-events-none z-10">
        <div className="bg-blue-600/20 px-5 py-3 rounded-2xl border border-blue-500/30 backdrop-blur-md">
          <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest">P1</p>
          <p className="text-3xl font-black text-white">{scores.p1}</p>
        </div>
        {isFireMode && (
          <div className="bg-orange-500/30 px-4 py-2 rounded-full border border-orange-500/50 backdrop-blur-md animate-pulse">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">🔥 MODO FUEGO X2</p>
          </div>
        )}
        <div className="bg-red-600/20 px-5 py-3 rounded-2xl border border-red-500/30 backdrop-blur-md text-right">
          <p className="text-[9px] text-red-400 font-black uppercase tracking-widest">P2</p>
          <p className="text-3xl font-black text-white">{scores.p2}</p>
        </div>
      </div>

      <div className={`relative border-4 border-slate-800 rounded-[2rem] bg-slate-900/30 overflow-hidden shadow-2xl ${gameState === 'goal' ? 'screen-shake' : ''}`}>
        <canvas ref={canvasRef} width={TABLE_WIDTH} height={TABLE_HEIGHT} className="max-h-[70vh] w-auto aspect-[320/480] cursor-none" onTouchStart={handleInput} onTouchMove={handleInput} onMouseMove={handleInput} onMouseDown={handleInput} />

        {gameState === 'goal' && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className={`animate-goal px-10 py-8 rounded-[2rem] border-4 backdrop-blur-xl shadow-2xl ${lastScorer === 1 ? 'bg-blue-600/40 border-blue-400' : 'bg-red-600/40 border-red-400'}`}>
              <h2 className="text-6xl font-black text-white italic tracking-tighter drop-shadow-2xl text-center">
                {isFireMode ? '+2 GOOOL' : '¡GOOOL!'}
              </h2>
            </div>
          </div>
        )}

        {gameState === 'waiting' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 px-8 py-4 rounded-full border border-white/10 backdrop-blur-md text-center">
              <p className="text-white font-black text-xs uppercase tracking-[0.4em] animate-pulse">Toca para Iniciar</p>
              <p className="text-indigo-400 text-[10px] font-bold mt-1">META: {winScore} GOLES</p>
            </div>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center p-10 text-center z-50 animate-in fade-in duration-500">
             <div className="text-7xl mb-6">🏆</div>
             <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">¡VICTORIA P{scores.p1 >= winScore ? '1' : '2'}!</h2>
             <button onClick={() => setGameState('config')} className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xl shadow-lg active:scale-95 transition-all mt-6">MENU PRINCIPAL</button>
          </div>
        )}
      </div>
      <p className="mt-8 text-[10px] text-slate-700 font-bold uppercase tracking-[0.4em]">15s sin gol activa el Puck de Fuego</p>
    </div>
  );
};

export default AirHockey;
