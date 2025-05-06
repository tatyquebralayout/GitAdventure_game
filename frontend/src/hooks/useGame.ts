import { useGameStore } from '../stores/gameStore';
import { useCallback } from 'react';

// Versão modificada do hook para evitar loops infinitos de renderização
export const useGame = () => {
  const location = useGameStore(state => state.location); // Changed from currentLocation
  const inventory = useGameStore(state => state.inventory);
  const visitedLocations = useGameStore(state => state.visitedLocations);
  const gameFlags = useGameStore(state => state.flags); // Changed from gameFlags
  const moveToLocation = useGameStore(state => state.move); // Changed from moveToLocation
  const addToInventory = useGameStore(state => state.pickupItem); // Changed from addToInventory
  const removeFromInventory = useGameStore(state => state.removeItem); // Changed from removeFromInventory
  const setGameFlag = useGameStore(state => state.setFlag); // Changed from setGameFlag
  const resetGame = useGameStore(state => state.reset); // Changed from resetGame
  
  // Wrappers para funções que checam o estado
  const hasVisited = useCallback(
    (loc: string) => visitedLocations.has(loc), // Changed from .includes() to .has()
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