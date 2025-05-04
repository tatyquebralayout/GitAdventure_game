import { Command, CommandResult } from '../../types/commands';
import { GameState } from '../../stores/gameStore';

// Temporary empty array that will be populated by index.ts
// This avoids circular dependency issues
export let allCommands: Command[] = [];

// Function to register commands from index.ts to avoid circular dependency
export function registerCommands(commands: Command[]): void {
  allCommands = commands;
}

export const helpCommand: Command = {
  name: 'help',
  patterns: [
    /^(?:help|commands|ajuda|\?)$/i,
    /^(?:help|ajuda)\s+(?:with|sobre|on)?\s*(.+)$/i,
  ],
  execute: (args, gameState) => {
    // If no specific command is requested, show general help
    if (!args.length || !args[0]) {
      const availableCommands = allCommands
        .filter((cmd: Command) => !cmd.availability || cmd.availability(gameState))
        .map((cmd: Command) => cmd.name)
        .join(', ');
      
      return {
        success: true,
        message: `Comandos disponíveis: ${availableCommands}\n\nDigite 'help [comando]' para obter ajuda específica sobre um comando.`
      };
    }
    
    // Look for help on a specific command
    const commandName = args[0].toLowerCase();
    const command = allCommands.find((cmd: Command) => 
      cmd.name.toLowerCase() === commandName &&
      (!cmd.availability || cmd.availability(gameState))
    );
    
    if (command) {
      return {
        success: true,
        message: command.help
      };
    }
    
    return {
      success: false,
      message: `Comando '${commandName}' não reconhecido. Digite 'help' para ver todos os comandos disponíveis.`
    };
  },
  help: "help [comando] - mostra ajuda sobre os comandos disponíveis"
};