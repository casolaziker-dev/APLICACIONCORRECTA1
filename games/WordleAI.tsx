
import React, { useState, useEffect } from 'react';
import { getWordleWord } from '../services/geminiService';
import { record1PScore } from '../services/scoreService';
import { audioService } from '../services/audioService';

type Status = 'correct' | 'present' | 'absent' | 'empty';

const WordleAI: React.FC = () => {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>(Array(6).fill(''));
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
  const [currentLetter, setCurrentLetter] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost' | 'loading'>('loading');
  const [usedLetters, setUsedLetters] = useState<Record<string, Status>>({});

  const initGame = async () => {
    setGameState('loading');
    const word = await getWordleWord();
    setTargetWord(word);
    setGuesses(Array(6).fill(''));
    setCurrentGuessIndex(0);
    setCurrentLetter(0);
    setUsedLetters({});
    setGameState('playing');
  };

  useEffect(() => {
    initGame();
  }, []);

  const onKeyPress = (key: string) => {
    if (gameState !== 'playing') return;

    if (key === 'ENTER') {
      if (currentLetter === 5) {
        submitGuess();
      } else {
        audioService.playError();
      }
      return;
    }

    if (key === 'BACKSPACE') {
      if (currentLetter > 0) {
        audioService.playClick();
        const newGuesses = [...guesses];
        const row = newGuesses[currentGuessIndex];
        newGuesses[currentGuessIndex] = row.substring(0, row.length - 1);
        setGuesses(newGuesses);
        setCurrentLetter(currentLetter - 1);
      }
      return;
    }

    if (currentLetter < 5 && key.length === 1 && key.match(/[A-Z]/)) {
      audioService.playClick();
      const newGuesses = [...guesses];
      newGuesses[currentGuessIndex] += key;
      setGuesses(newGuesses);
      setCurrentLetter(currentLetter + 1);
    }
  };

  const submitGuess = () => {
    const guess = guesses[currentGuessIndex];
    const newUsedLetters = { ...usedLetters };

    for (let i = 0; i < 5; i++) {
      const char = guess[i];
      let status: Status = 'absent';
      if (targetWord[i] === char) {
        status = 'correct';
      } else if (targetWord.includes(char)) {
        status = 'present';
      }

      if (newUsedLetters[char] !== 'correct') {
        newUsedLetters[char] = status;
      }
    }

    setUsedLetters(newUsedLetters);

    if (guess === targetWord) {
      audioService.playSuccess();
      setGameState('won');
      record1PScore('wordle-ai', 6 - currentGuessIndex, 'high');
    } else if (currentGuessIndex === 5) {
      audioService.playError();
      setGameState('lost');
    } else {
      audioService.playClick();
      setCurrentGuessIndex(currentGuessIndex + 1);
      setCurrentLetter(0);
    }
  };

  const getLetterStatus = (rowIdx: number, colIdx: number): Status => {
    if (rowIdx >= currentGuessIndex) return 'empty';
    
    const char = guesses[rowIdx][colIdx];
    if (targetWord[colIdx] === char) return 'correct';
    if (targetWord.includes(char)) return 'present';
    return 'absent';
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'correct': 
        return 'bg-emerald-600 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
      case 'present': 
        return 'bg-amber-500 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]';
      case 'absent': 
        return 'bg-slate-800 border-slate-700';
      default: 
        return 'bg-slate-900/50 border-slate-800';
    }
  };

  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20 bg-slate-950">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Cifrando palabra secreta...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full p-2 space-y-6 pt-6 bg-slate-950">
      <style>{`
        .letter-glow { text-shadow: 0 0 10px rgba(255,255,255,0.3); }
      `}</style>
      
      {/* Grid */}
      <div className="grid grid-rows-6 gap-2.5">
        {guesses.map((row, r) => (
          <div key={r} className="grid grid-cols-5 gap-2.5">
            {[0, 1, 2, 3, 4].map((c) => {
              const char = row[c] || '';
              const status = getLetterStatus(r, c);
              const isActiveRow = r === currentGuessIndex;
              
              return (
                <div
                  key={c}
                  className={`w-12 h-14 border-2 flex items-center justify-center text-2xl font-black rounded-xl transition-all duration-500 
                    text-white letter-glow
                    ${getStatusColor(status)} 
                    ${char && status === 'empty' ? 'scale-105 border-indigo-500 bg-slate-800' : ''}
                    ${isActiveRow && c === currentLetter ? 'border-indigo-400 ring-2 ring-indigo-400/20' : ''}
                  `}
                >
                  {char}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {gameState !== 'playing' && (
        <div className="text-center bg-slate-900/95 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl w-full max-w-[320px] animate-in zoom-in duration-500 z-50">
          <h2 className={`text-2xl font-black mb-1 italic tracking-tight uppercase ${gameState === 'won' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {gameState === 'won' ? '¡Misión Lograda!' : '¡Fallo Crítico!'}
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">La respuesta era: <span className="text-white font-black">{targetWord}</span></p>
          <button 
            onClick={() => { audioService.playClick(); initGame(); }}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs tracking-[0.2em] active:scale-95 transition-all shadow-xl"
          >
            NUEVA PALABRA
          </button>
        </div>
      )}

      {/* Keyboard */}
      <div className="w-full max-w-[420px] space-y-2 pb-8 mt-auto px-1">
        {[
          ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
          ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
          ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
        ].map((row, i) => (
          <div key={i} className="flex justify-center gap-1">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`
                  ${key.length > 1 ? 'px-3 text-[10px]' : 'w-8 h-12 text-sm'} 
                  rounded-xl flex items-center justify-center font-black transition-all active:scale-90 border-b-4 uppercase
                  text-white letter-glow
                  ${usedLetters[key] === 'correct' ? 'bg-emerald-600 border-emerald-800' : 
                    usedLetters[key] === 'present' ? 'bg-amber-500 border-amber-700' :
                    usedLetters[key] === 'absent' ? 'bg-slate-800 border-slate-950' : 
                    'bg-slate-700 border-slate-800'}
                `}
              >
                {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? '✓' : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordleAI;
