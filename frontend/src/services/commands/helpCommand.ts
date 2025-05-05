// Importar tipos unificados de commands.ts
import { Command, HelpInfo } from '../../types/commands';

// Temporary empty array that will be populated by index.ts - REMOVIDO
// This avoids circular dependency issues
// export let allCommands: Command[] = [];

// Function to register commands from index.ts to avoid circular dependency - REMOVIDO
/*
export function registerCommands(commands: Command[]): void {
  allCommands = commands;
}
*/

// Interface para a estrutura de ajuda que o comando receberá - REMOVIDO
/*
interface HelpInfo {
  name: string;
  description?: string;
  helpText?: string;
}
*/

export const helpCommand: Command = {
  name: 'help',
  description: 'Mostra a lista de comandos ou ajuda para um comando específico.',
  patterns: [
    /^(?:help|commands|ajuda|\?)$/i,
    /^(?:help|ajuda)\s+(?:with|sobre|on)?\s*(.+)$/i,
  ],
  // Modificar execute para receber a lista de comandos disponíveis
  execute: (args, gameState, availableCommandsInfo?: HelpInfo[]) => { 
    if (!availableCommandsInfo) {
      return { success: false, message: 'Erro interno: Informações de ajuda não disponíveis.' };
    }

    // If no specific command is requested, show general help
    if (!args.length || !args[0]) {
      const commandList = availableCommandsInfo
        // .filter((cmd) => !cmd.availability || cmd.availability(gameState)) // Filtragem deve ocorrer antes
        .map((cmdInfo) => cmdInfo.name)
        .join(', ');
      
      return {
        success: true,
        message: `Comandos disponíveis: ${commandList}\n\nDigite 'help [comando]' para obter ajuda específica sobre um comando.`
      };
    }
    
    // Look for help on a specific command
    const commandName = args[0].toLowerCase();
    const commandInfo = availableCommandsInfo.find((cmdInfo) => 
      cmdInfo.name.toLowerCase() === commandName
      // && (!cmd.availability || cmd.availability(gameState)) // Filtragem deve ocorrer antes
    );
    
    if (commandInfo) {
      return {
        success: true,
        // Usar helpText se disponível, senão description
        message: commandInfo.helpText || commandInfo.description || `Nenhuma ajuda detalhada para ${commandName}.`
      };
    }
    
    return {
      success: false,
      message: `Comando '${commandName}' não reconhecido. Digite 'help' para ver todos os comandos disponíveis.`
    };
  },
  // Manter o texto de ajuda do próprio comando help
  help: "help [comando] - mostra ajuda sobre os comandos disponíveis"
};