import React, { useState, useEffect } from 'react';
import { getWordleWord } from '../services/geminiService';
import { record1PScore } from '../services/scoreService';

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
      }
      return;
    }

    if (key === 'BACKSPACE') {
      if (currentLetter > 0) {
        const newGuesses = [...guesses];
        const row = newGuesses[currentGuessIndex];
        newGuesses[currentGuessIndex] = row.substring(0, row.length - 1);
        setGuesses(newGuesses);
        setCurrentLetter(currentLetter - 1);
      }
      return;
    }

    if (currentLetter < 5 && key.length === 1 && key.match(/[A-ZÑ]/i)) {
      const newGuesses = [...guesses];
      newGuesses[currentGuessIndex] += key.toUpperCase();
      setGuesses(newGuesses);
      setCurrentLetter(currentLetter + 1);
    }
  };

  const submitGuess = () => {
    const guess = guesses[currentGuessIndex].toUpperCase();
    const target = targetWord.toUpperCase();
    const newUsedLetters = { ...usedLetters };

    for (let i = 0; i < 5; i++) {
      const char = guess[i];
      let status: Status = 'absent';
      if (target[i] === char) {
        status = 'correct';
      } else if (target.includes(char)) {
        status = 'present';
      }

      if (newUsedLetters[char] !== 'correct') {
        newUsedLetters[char] = status;
      }
    }

    setUsedLetters(newUsedLetters);

    if (guess === target) {
      setGameState('won');
      record1PScore('wordle-ai', 6 - currentGuessIndex, 'high');
    } else if (currentGuessIndex === 5) {
      setGameState('lost');
    } else {
      setCurrentGuessIndex(currentGuessIndex + 1);
      setCurrentLetter(0);
    }
  };

  const getLetterStatus = (rowIdx: number, colIdx: number): Status => {
    if (rowIdx >= currentGuessIndex) return 'empty';
    
    const char = guesses[rowIdx][colIdx]?.toUpperCase();
    const target = targetWord.toUpperCase();
    
    if (target[colIdx] === char) return 'correct';
    if (target.includes(char)) return 'present';
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
            onClick={() => initGame()}
            className="w-full bg-indigo-600 text-
