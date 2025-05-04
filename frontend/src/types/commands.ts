import { GameState } from '../stores/gameStore';

export interface CommandResult {
  success: boolean;
  message: string;
  effects?: {
    addToInventory?: string[];
    removeFromInventory?: string[];
    setLocation?: string;
    setFlag?: Record<string, boolean>;
  };
}

export interface Command {
  name: string;
  patterns: RegExp[];
  execute: (args: string[], gameState: GameState) => CommandResult;
  help: string;
  availability?: (gameState: GameState) => boolean;
}