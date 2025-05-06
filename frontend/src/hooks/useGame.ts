import { useGameStore } from '../stores/gameStore';
import { useCallback } from 'react';

// Versão modificada do hook para evitar loops infinitos de renderização
export const useGame = () => {
  const location = useGameStore(state => state.currentLocation);
  const inventory = useGameStore(state => state.inventory);
  const visitedLocations = useGameStore(state => state.visitedLocations);
  const gameFlags = useGameStore(state => state.gameFlags);
  const moveToLocation = useGameStore(state => state.moveToLocation);
  const addToInventory = useGameStore(state => state.addToInventory);
  const removeFromInventory = useGameStore(state => state.removeFromInventory);
  const setGameFlag = useGameStore(state => state.setGameFlag);
  const resetGame = useGameStore(state => state.resetGame);
  
  // Wrappers para funções que checam o estado
  const hasVisited = useCallback(
    (loc: string) => visitedLocations.includes(loc),
    [visitedLocations]
  );
  
  const hasItem = useCallback(
    (item: string) => inventory.includes(item),
    [inventory]
  );
  
  const hasFlag = useCallback(
    (flag: string) => !!gameFlags[flag],
    [gameFlags]
  );
  
  return {
    location,
    inventory,
    hasVisited,
    hasItem,
    hasFlag,
    move: moveToLocation,
    pickupItem: addToInventory,
    removeItem: removeFromInventory,
    setFlag: setGameFlag,
    reset: resetGame,
  };
};