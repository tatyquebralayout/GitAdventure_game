import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameState {
  currentLocation: string;
  inventory: string[];
  visitedLocations: string[];
  gameFlags: Record<string, boolean>;
  // Add other necessary states
}

export interface GameActions {
  moveToLocation: (location: string) => void;
  addToInventory: (item: string) => void;
  setGameFlag: (flag: string, value: boolean) => void;
  resetGame: () => void;
  // Add other actions
}

const initialState: GameState = {
  currentLocation: 'start',
  inventory: [],
  visitedLocations: ['start'],
  gameFlags: {},
};

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set) => ({
      ...initialState,
      
      moveToLocation: (location) => set((state) => ({ 
        currentLocation: location,
        visitedLocations: state.visitedLocations.includes(location) 
          ? state.visitedLocations 
          : [...state.visitedLocations, location],
      })),
      
      addToInventory: (item) => set((state) => ({
        inventory: state.inventory.includes(item) 
          ? state.inventory 
          : [...state.inventory, item],
      })),
      
      setGameFlag: (flag, value) => set((state) => ({
        gameFlags: { ...state.gameFlags, [flag]: value }
      })),
      
      resetGame: () => set(initialState),
    }),
    {
      name: 'git-adventure-storage',
    }
  )
);