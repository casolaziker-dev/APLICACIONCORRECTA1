
import React, { useState, useEffect } from 'react';
import { Sector, Game } from './types';
import Home from './components/Home';
import GameList from './components/GameList';
import GameRunner from './components/GameRunner';
import { audioService } from './services/audioService';

const GAMES: Game[] = [
  { id: 'quiz-ai', title: 'Trivia AI', description: 'Preguntas infinitas de IA.', icon: '🧠', color: 'bg-purple-500', players: 1 },
  { id: 'wordle-ai', title: 'Palabra del Día', description: 'Adivina la palabra oculta (Wordle).', icon: '📝', color: 'bg-emerald-600', players: 1 },
  { id: 'word-ai', title: 'Palabra AI', description: 'Adivina con pistas de IA.', icon: '✍️', color: 'bg-indigo-600', players: 1 },
  { id: 'memory', title: 'Parejas', description: 'Memoria visual clásica.', icon: '🃏', color: 'bg-emerald-500', players: 1 },
  { id: 'snake', title: 'Snake', description: 'El clásico de la serpiente.', icon: '🐍', color: 'bg-green-500', players: 1 },
  { id: 'neon-jump', title: 'Salto Neón', description: 'Llega a lo más alto.', icon: '🚀', color: 'bg-blue-500', players: 1 },
  { id: 'maze-1p', title: 'Laberinto', description: 'Busca la salida.', icon: '🌀', color: 'bg-slate-600', players: 1 },
  { id: 'mine-lite', title: 'Minas Lite', description: 'No pises la bomba.', icon: '💣', color: 'bg-red-600', players: 1 },
  { id: 'color-logic', title: 'Lógica Color', description: 'Descifra el código.', icon: '💡', color: 'bg-fuchsia-600', players: 1 },
  { id: 'quick-tap-1p', title: 'Reflejo Solo', description: 'Toca el círculo rápido.', icon: '🎯', color: 'bg-orange-500', players: 1 },
  { id: 'tictactoe', title: '3 en Raya', description: 'Duelo estratégico.', icon: '❌', color: 'bg-blue-500', players: 2 },
  { id: 'reflex', title: 'Duelo Reflex', description: '¡El más rápido gana!', icon: '⚡', color: 'bg-red-500', players: 2 },
  { id: 'tug-of-war', title: 'Soga-Tira', description: 'Pulsa rápido tu botón.', icon: '🧶', color: 'bg-orange-600', players: 2 },
  { id: 'math-duel', title: 'Duelo Mate', description: 'Cálculo mental dual.', icon: '⚖️', color: 'bg-amber-500', players: 2 },
  { id: 'hockey-2p', title: 'Air Hockey', description: 'Golpea el disco.', icon: '🏒', color: 'bg-sky-400', players: 2 },
  { id: 'dots-boxes', title: 'Puntos y Cajas', description: 'Cierra los cuadrados.', icon: '🍱', color: 'bg-teal-600', players: 2 },
  { id: 'sink-fleet', title: 'Hundir la Flota', description: 'Guerra naval táctica.', icon: '🚢', color: 'bg-cyan-700', players: 2 },
  { id: 'sync-tap', title: 'Sincro-Tap', description: 'Pulsad al mismo tiempo.', icon: '🤝', color: 'bg-lime-600', players: 2 },
  { id: 'bomb-pass', title: 'Pasa la Bomba', description: '¡Que no te explote!', icon: '🧨', color: 'bg-yellow-600', players: 2 },
  { id: 'mash-battle', title: 'Mash Battle', description: 'Gana el que más pulse.', icon: '🤜', color: 'bg-indigo-400', players: 2 },
];

const App: React.FC = () => {
  const [sector, setSector] = useState<Sector>('HOME');
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Forzar modo oscuro permanentemente
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleBack = () => {
    audioService.playClick();
    if (activeGame) setActiveGame(null);
    else setSector('HOME');
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioService.setMuted(nextMuted).catch(err => console.error("Error al activar audio:", err));
  };

  const changeSector = (s: Sector) => {
    audioService.playClick();
    setSector(s);
  };

  const selectGame = (g: Game) => {
    audioService.playClick();
    setActiveGame(g);
  };

  return (
    <div className={`flex flex-col h-[100dvh] w-full max-w-md mx-auto relative overflow-hidden font-['Fredoka'] shadow-2xl bg-slate-950 text-white`}>
      
      {/* Fondo Ambientale Oscuro */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] rounded-full blur-[120px] bg-indigo-900/40" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full blur-[120px] bg-rose-900/30" />
      </div>

      {!(activeGame?.id === 'snake') && (
        <header className="flex-none p-5 flex items-center justify-between z-[100] backdrop-blur-xl border-b bg-slate-950/60 border-white/5">
          <div className="flex gap-2">
            {sector !== 'HOME' && (
              <button onClick={handleBack} className="w-11 h-11 flex items-center justify-center rounded-2xl transition-all border active:scale-90 bg-slate-900 border-white/10 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
              </button>
            )}
            {/* El icono de la luna ha sido eliminado del Home */}
          </div>
          
          <div className="text-center flex-1 px-2">
            <h1 className="text-[10px] font-black tracking-[0.25em] uppercase italic leading-tight text-indigo-400">
              {activeGame ? activeGame.title : (sector === 'HOME' ? 'Mundo Minijuegos' : `${sector === '1P' ? 'Sector Solitario' : 'Arena de Duelo'}`)}
            </h1>
          </div>

          <button onClick={toggleMute} className={`w-11 h-11 flex items-center justify-center rounded-2xl border transition-all active:scale-90 ${isMuted ? 'bg-slate-900 border-white/10 text-slate-600' : 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]'}`}>
            {isMuted ? '🔇' : '🔊'}
          </button>
        </header>
      )}

      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
        <div className={`flex-1 flex flex-col ${activeGame ? "h-full" : "pb-12"}`}>
          {activeGame ? (
            <GameRunner game={activeGame} />
          ) : sector === 'HOME' ? (
            <Home onSelectSector={changeSector} isDark={true} />
          ) : (
            <div className="px-5 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="mb-8">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                  {sector === '1P' ? 'MODO SOLO' : 'MODO DUEL'}
                </h2>
                <div className="h-1 w-12 rounded-full mt-2 bg-indigo-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-3 text-slate-500">
                  {sector === '1P' ? 'Desafía tu mente contra la IA' : 'Batalla local para dos leyendas'}
                </p>
              </div>
              <GameList 
                games={GAMES.filter(g => g.players === (sector === '1P' ? 1 : 2))} 
                onSelectGame={selectGame} 
                isDark={true}
              />
            </div>
          )}
        </div>
      </main>

      {!activeGame && (
        <footer className="flex-none p-4 text-center border-t backdrop-blur-md bg-slate-950/60 border-white/5 text-slate-600">
          <p className="text-[9px] font-black tracking-[0.4em] uppercase">Creado por Iker Caso</p>
        </footer>
      )}
    </div>
  );
};

export default App;
