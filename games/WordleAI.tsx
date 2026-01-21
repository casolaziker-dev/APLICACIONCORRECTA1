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
    setTargetWord(word.toUpperCase());
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
