import { useGameStore } from '../stores/gameStore';

export const useGame = () => {
  return useGameStore(state => ({
    location: state.currentLocation,
    inventory: state.inventory,
    hasVisited: (loc: string) => state.visitedLocations.includes(loc),
    hasItem: (item: string) => state.inventory.includes(item),
    hasFlag: (flag: string) => !!state.gameFlags[flag],
    move: state.moveToLocation,
    pickupItem: state.addToInventory,
    setFlag: state.setGameFlag,
    reset: state.resetGame,
  }));
};