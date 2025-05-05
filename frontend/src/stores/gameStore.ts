import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameState {
  currentLocation: string;
  inventory: string[];
  visitedLocations: string[];
  gameFlags: Record<string, boolean>;
}

interface GameActions {
  moveToLocation: (location: string) => void;
  addToInventory: (item: string) => void;
  removeFromInventory: (item: string) => void;
  setGameFlag: (flag: string, value: boolean) => void;
  resetGame: () => void;
}

export type GameStore = GameState & GameActions;

const initialState: GameState = {
  currentLocation: 'start',
  inventory: [],
  visitedLocations: ['start'],
  gameFlags: {}
};

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialState,
      
      moveToLocation: (location) => set((state) => {
        const newVisitedLocations = state.visitedLocations.includes(location)
          ? state.visitedLocations
          : [...state.visitedLocations, location];
        
        return {
          currentLocation: location,
          visitedLocations: newVisitedLocations
        };
      }),
      
      addToInventory: (item) => set((state) => ({
        inventory: state.inventory.includes(item)
          ? state.inventory
          : [...state.inventory, item]
      })),
      
      removeFromInventory: (item) => set((state) => ({
        inventory: state.inventory.filter(i => i !== item)
      })),
      
      setGameFlag: (flag, value) => set((state) => ({
        gameFlags: {
          ...state.gameFlags,
          [flag]: value
        }
      })),
      
      resetGame: () => set(initialState)
    }),
    {
      name: 'git-adventure-game-state',
      partialize: (state) => ({
        currentLocation: state.currentLocation,
        inventory: state.inventory,
        visitedLocations: state.visitedLocations,
        gameFlags: state.gameFlags
      })
    }
  )
);