
import React from 'react';
import { Sector } from '../types';

interface HomeProps {
  onSelectSector: (sector: Sector) => void;
  isDark: boolean;
}

const Home: React.FC<HomeProps> = ({ onSelectSector, isDark }: HomeProps) => {
  return (
    <div className={`flex flex-col space-y-12 pt-16 relative h-full px-8 transition-all duration-500 bg-transparent`}>
      <div className="text-center space-y-4">
        <h2 className={`text-6xl font-black tracking-tighter leading-[0.85] transition-colors italic uppercase
          ${isDark ? 'text-white' : 'text-slate-950'}
        `}>
          MUNDO<br/>
          <span className={`${isDark ? 'text-indigo-400' : 'text-indigo-600'} not-italic`}>Infinito</span>
        </h2>
        <div className="flex justify-center">
          <p className={`text-[10px] font-black uppercase tracking-[0.5em] px-5 py-1.5 rounded-full border
            ${isDark ? 'text-slate-500 border-white/5 bg-white/5' : 'text-slate-400 border-slate-200 bg-white shadow-sm'}
          `}>
            Define tu modo de gloria
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Sector 1 JUGADOR */}
        <button
          onClick={() => onSelectSector('1P')}
          className={`group relative overflow-hidden rounded-[3rem] border p-12 flex items-center justify-between transition-all duration-300 hover:-translate-y-2 active:scale-[0.97]
            ${isDark 
              ? 'bg-slate-900/60 border-white/5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]' 
              : 'bg-white border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]'}
          `}
        >
          <div className="flex flex-col items-start text-left z-10">
            <h3 className={`text-4xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-950'}`}>Solo</h3>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Versus IA</p>
          </div>
          
          <div className="relative w-20 h-20 group-hover:scale-125 transition-transform duration-500 z-10">
            <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
              <circle cx="12" cy="12" r="10" className="fill-current opacity-10" />
              <path d="M12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M18 19C18 16.2386 15.3137 14 12 14C8.68629 14 6 16.2386 6 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className={`absolute top-0 right-0 w-48 h-48 rounded-full -mr-16 -mt-16 blur-3xl opacity-20 transition-all group-hover:opacity-40
            ${isDark ? 'bg-indigo-400' : 'bg-indigo-100'}
          `} />
        </button>

        {/* Sector 2 JUGADORES */}
        <button
          onClick={() => onSelectSector('2P')}
          className={`group relative overflow-hidden rounded-[3rem] border p-12 flex items-center justify-between transition-all duration-300 hover:-translate-y-2 active:scale-[0.97]
            ${isDark 
              ? 'bg-slate-900/60 border-white/5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]' 
              : 'bg-white border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]'}
          `}
        >
          <div className="flex flex-col items-start text-left z-10">
            <h3 className={`text-4xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-950'}`}>Duel</h3>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>1 vs 1</p>
          </div>

          <div className="relative w-20 h-20 group-hover:scale-125 transition-transform duration-500 z-10">
            <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
              <circle cx="12" cy="12" r="10" className="fill-current opacity-10" />
              <path d="M8.5 10C9.60457 10 10.5 9.10457 10.5 8C10.5 6.89543 9.60457 6 8.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13 17C13 14.7909 10.9853 13 8.5 13C6.01472 13 4 14.7909 4 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M15.5 10C16.6046 10 17.5 9.10457 17.5 8C17.5 6.89543 16.6046 6 15.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M20 17C20 14.7909 17.9853 13 15.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className={`absolute top-0 right-0 w-48 h-48 rounded-full -mr-16 -mt-16 blur-3xl opacity-20 transition-all group-hover:opacity-40
            ${isDark ? 'bg-rose-400' : 'bg-rose-100'}
          `} />
        </button>
      </div>
    </div>
  );
};

export default Home;
