import { create } from 'zustand';

interface GameState {
  location: string;
  inventory: string[];
  visitedLocations: Set<string>;
  flags: { [key: string]: boolean };
  
  move: (newLocation: string) => void;
  pickupItem: (item: string) => void;
  removeItem: (item: string) => void;
  hasItem: (item: string) => boolean;
  hasVisited: (location: string) => boolean;
  setFlag: (flag: string, value: boolean) => void;
  hasFlag: (flag: string) => boolean;
  reset: () => void;
}

export const useGame = create<GameState>((set, get) => ({
  location: 'start',
  inventory: [],
  visitedLocations: new Set(['start']),
  flags: {},
  
  move: (newLocation: string) => {
    set((state) => {
      const newVisited = new Set(state.visitedLocations);
      newVisited.add(newLocation);
      return {
        location: newLocation,
        visitedLocations: newVisited
      };
    });
  },
  
  pickupItem: (item: string) => {
    set((state) => ({
      inventory: [...state.inventory, item]
    }));
  },
  
  removeItem: (item: string) => {
    set((state) => ({
      inventory: state.inventory.filter(i => i !== item)
    }));
  },
  
  hasItem: (item: string) => {
    return get().inventory.includes(item);
  },
  
  hasVisited: (location: string) => {
    return get().visitedLocations.has(location);
  },
  
  setFlag: (flag: string, value: boolean) => {
    set((state) => ({
      flags: {
        ...state.flags,
        [flag]: value
      }
    }));
  },
  
  hasFlag: (flag: string) => {
    return Boolean(get().flags[flag]);
  },
  
  reset: () => {
    set({
      location: 'start',
      inventory: [],
      visitedLocations: new Set(['start']),
      flags: {}
    });
  },
}));