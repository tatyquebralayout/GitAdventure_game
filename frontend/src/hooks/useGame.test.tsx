import { describe, expect, test, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from './useGame';
import { useGameStore } from '../stores/gameStore';

// Reset the store before each test
beforeEach(() => {
  useGameStore.setState({
    currentLocation: 'start',
    inventory: [],
    visitedLocations: ['start'],
    gameFlags: {},
  });
});

describe('useGame Hook', () => {
  test('should provide the correct game state and actions', () => {
    const { result } = renderHook(() => useGame());
    
    // Check initial state
    expect(result.current.location).toBe('start');
    expect(result.current.inventory).toEqual([]);
  });

  test('helper methods should work correctly', () => {
    const { result } = renderHook(() => useGame());
    
    // Set up some state to test with
    act(() => {
      useGameStore.setState({
        inventory: ['map', 'compass'],
        visitedLocations: ['start', 'cave'],
        gameFlags: { bridge_fixed: true }
      });
    });
    
    // Test hasItem
    expect(result.current.hasItem('map')).toBe(true);
    expect(result.current.hasItem('sword')).toBe(false);
    
    // Test hasVisited
    expect(result.current.hasVisited('cave')).toBe(true);
    expect(result.current.hasVisited('mountain')).toBe(false);
    
    // Test hasFlag
    expect(result.current.hasFlag('bridge_fixed')).toBe(true);
    expect(result.current.hasFlag('quest_completed')).toBe(false);
  });

  test('actions should update the store correctly', () => {
    const { result } = renderHook(() => useGame());
    
    // Test move
    act(() => {
      result.current.move('forest');
    });
    expect(result.current.location).toBe('forest');
    
    // Test pickupItem
    act(() => {
      result.current.pickupItem('lantern');
    });
    expect(result.current.inventory).toContain('lantern');
    
    // Test setFlag
    act(() => {
      result.current.setFlag('puzzle_solved', true);
    });
    expect(result.current.hasFlag('puzzle_solved')).toBe(true);
    
    // Test reset
    act(() => {
      result.current.reset();
    });
    expect(result.current.location).toBe('start');
    expect(result.current.inventory).toEqual([]);
  });
});