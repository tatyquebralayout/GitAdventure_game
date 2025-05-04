import { useState } from 'react';

export function useCommandHistory(maxHistory = 50) {
  const [history, setHistory] = useState<string[]>([]);
  const [position, setPosition] = useState(-1);
  
  const addToHistory = (command: string) => {
    // Avoid consecutive duplicate commands
    if (history.length === 0 || history[0] !== command) {
      setHistory(prev => [command, ...prev].slice(0, maxHistory));
    }
    setPosition(-1);
  };
  
  const navigateHistory = (direction: 'up' | 'down') => {
    if (history.length === 0) return null;
    
    let newPosition: number;
    
    if (direction === 'up') {
      // Navigate backwards in history
      newPosition = Math.min(position + 1, history.length - 1);
    } else {
      // Navigate forwards in history
      newPosition = Math.max(position - 1, -1);
    }
    
    setPosition(newPosition);
    return newPosition === -1 ? '' : history[newPosition];
  };
  
  return {
    addToHistory,
    navigateHistory,
    history
  };
}