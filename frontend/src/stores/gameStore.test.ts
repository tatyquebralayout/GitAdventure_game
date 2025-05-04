import { beforeEach, describe, expect, test } from 'vitest';
import { useGameStore } from './gameStore';

// Reset the store before each test
beforeEach(() => {
  useGameStore.setState({
    currentLocation: 'start',
    inventory: [],
    visitedLocations: ['start'],
    gameFlags: {},
  });
});

describe('Game Store', () => {
  test('Initial state should be correct', () => {
    const state = useGameStore.getState();
    expect(state.currentLocation).toBe('start');
    expect(state.inventory).toEqual([]);
    expect(state.visitedLocations).toEqual(['start']);
    expect(state.gameFlags).toEqual({});
  });

  test('moveToLocation should update current location and visited locations', () => {
    const { moveToLocation } = useGameStore.getState();
    
    // Move to a new location
    moveToLocation('mission-1');
    
    // Check state changes
    const state = useGameStore.getState();
    expect(state.currentLocation).toBe('mission-1');
    expect(state.visitedLocations).toContain('mission-1');
    expect(state.visitedLocations).toHaveLength(2); // start + mission-1
    
    // Moving to the same location again shouldn't add a duplicate
    moveToLocation('mission-1');
    expect(useGameStore.getState().visitedLocations).toHaveLength(2);
  });

  test('addToInventory should add items without duplicates', () => {
    const { addToInventory } = useGameStore.getState();
    
    // Add item to inventory
    addToInventory('key');
    
    // Check state changes
    const state = useGameStore.getState();
    expect(state.inventory).toContain('key');
    expect(state.inventory).toHaveLength(1);
    
    // Adding the same item again shouldn't create a duplicate
    addToInventory('key');
    expect(useGameStore.getState().inventory).toHaveLength(1);
    
    // Add another item
    addToInventory('map');
    expect(useGameStore.getState().inventory).toHaveLength(2);
    expect(useGameStore.getState().inventory).toEqual(['key', 'map']);
  });

  test('setGameFlag should set and update game flags', () => {
    const { setGameFlag } = useGameStore.getState();
    
    // Set a flag
    setGameFlag('tutorial_completed', true);
    
    // Check state changes
    const state = useGameStore.getState();
    expect(state.gameFlags.tutorial_completed).toBe(true);
    
    // Update the flag
    setGameFlag('tutorial_completed', false);
    expect(useGameStore.getState().gameFlags.tutorial_completed).toBe(false);
    
    // Add another flag
    setGameFlag('branch_created', true);
    expect(useGameStore.getState().gameFlags.branch_created).toBe(true);
  });

  test('resetGame should restore initial state', () => {
    const { moveToLocation, addToInventory, setGameFlag, resetGame } = useGameStore.getState();
    
    // Make some changes to the state
    moveToLocation('mission-2');
    addToInventory('flashlight');
    setGameFlag('puzzle_solved', true);
    
    // Reset the game
    resetGame();
    
    // Check if state is reset to initial values
    const state = useGameStore.getState();
    expect(state.currentLocation).toBe('start');
    expect(state.inventory).toEqual([]);
    expect(state.visitedLocations).toEqual(['start']);
    expect(state.gameFlags).toEqual({});
  });
});