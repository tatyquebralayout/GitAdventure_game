import { Command, CommandResult } from '../../types/commands';
import { GameState } from '../../stores/gameStore';
import { moveCommand } from './moveCommand';
import { lookCommand } from './lookCommand';
import { takeCommand } from './takeCommand';
import { useCommand } from './useCommand';
import { inventoryCommand } from './inventoryCommand';
import { helpCommand, registerCommands } from './helpCommand';

// Export commands array 
export const commands: Command[] = [
  moveCommand,
  lookCommand,
  takeCommand,
  useCommand,
  inventoryCommand,
  helpCommand
];

// Register commands with helpCommand to avoid circular dependency
registerCommands(commands);

/**
 * Process a user command input against the game state
 * 
 * @param input The raw text input from the user
 * @param gameState Current game state to execute command against
 * @returns Command execution result with success/failure and effects
 */
export const processCommand = (input: string, gameState: GameState): CommandResult => {
  const trimmedInput = input.trim();
  
  // Empty command
  if (!trimmedInput) {
    return {
      success: false,
      message: 'Digite um comando.'
    };
  }
  
  // Search for a matching command
  for (const command of commands) {
    // Check command availability in current game state
    if (command.availability && !command.availability(gameState)) {
      continue;
    }
    
    // Test each pattern of the command
    for (const pattern of command.patterns) {
      const match = trimmedInput.match(pattern);
      if (match) {
        // Extract arguments from match (ignoring the complete match)
        const args = match.slice(1).filter(Boolean);
        return command.execute(args, gameState);
      }
    }
  }
  
  return {
    success: false,
    message: `Comando não reconhecido: "${trimmedInput}"`
  };
};