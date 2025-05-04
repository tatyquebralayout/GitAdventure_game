import { Command, CommandResult } from '../../types/commands';
import { GameState } from '../../stores/gameStore';
import { commands } from './index';

export const helpCommand: Command = {
  name: 'help',
  patterns: [
    /^(?:help|commands|ajuda|\?)$/i,
    /^(?:help|ajuda)\s+(?:with|sobre|on)?\s*(.+)$/i,
  ],
  execute: (args, gameState) => {
    // If no specific command is requested, show general help
    if (!args.length || !args[0]) {
      const availableCommands = commands
        .filter(cmd => !cmd.availability || cmd.availability(gameState))
        .map(cmd => cmd.name)
        .join(', ');
      
      return {
        success: true,
        message: `Comandos disponíveis: ${availableCommands}\n\nDigite 'help [comando]' para obter ajuda específica sobre um comando.`
      };
    }
    
    // Look for help on a specific command
    const commandName = args[0].toLowerCase();
    const command = commands.find(cmd => 
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