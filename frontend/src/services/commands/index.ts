import { GameState } from '../../stores/gameStore';
import { processShellCommand, shellCommandHandlers } from './shellCommands';
import { helpCommand as importedHelpCommand } from './helpCommand';
import { Command, CommandResult, HelpInfo } from '../../types/commands';

// Definição básica de comandos
const moveCommand: Command = {
  name: 'move',
  description: 'Mover para um novo local',
  aliases: ['go', 'ir', 'caminhar', 'andar'],
  help: 'move [destino] - Tenta mover o jogador para o destino especificado (ex: move floresta).',
  execute: (args, state) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'Para onde você quer ir?'
      };
    }

    const destination = args[0].toLowerCase();
    
    // Implementação básica
    if (destination === 'floresta' || destination === 'forest') {
      return {
        success: true,
        message: 'Você entrou na floresta...',
        effects: { setLocation: 'forest' }
      };
    } else if (destination === 'vila' || destination === 'village') {
      return {
        success: true, 
        message: 'Você chegou à vila.',
        effects: { setLocation: 'village' }
      };
    } else if (destination === 'caverna' || destination === 'cave') {
      const isCaveIlluminated = state.gameFlags['cave_illuminated'];
      
      if (!state.inventory.includes('lanterna') && !isCaveIlluminated) {
        return {
          success: false,
          message: 'Está muito escuro para entrar na caverna. Você precisa de uma fonte de luz.'
        };
      }
      
      return {
        success: true,
        message: 'Você entrou na caverna escura...',
        effects: { setLocation: 'cave' }
      };
    }

    return {
      success: false,
      message: `Não é possível ir para "${destination}".`
    };
  }
};

const lookCommand: Command = {
  name: 'look',
  description: 'Examinar o ambiente ou um objeto',
  aliases: ['olhar', 'examinar', 'ver', 'observar'],
  help: 'look [objeto] - Descreve o local atual ou examina um objeto específico.',
  execute: (args, state) => {
    if (args.length === 0) {
      // Descrever o ambiente atual
      switch (state.currentLocation) {
        case 'start':
          return {
            success: true,
            message: 'Você está em uma trilha. Ao norte há uma floresta densa, e ao sul uma pequena vila.'
          };
        case 'forest':
          return {
            success: true,
            message: 'Você está no meio de uma floresta. As árvores são altas e os raios de sol mal conseguem atravessar as copas. Você vê algo brilhando entre as folhas no chão.'
          };
        case 'village':
          return {
            success: true,
            message: 'Você está em uma vila pequena. Há algumas casas e uma praça central com um poço. Algumas pessoas estão trabalhando no campo próximo.'
          };
        case 'cave':
          return {
            success: true,
            message: state.gameFlags['cave_illuminated'] 
              ? 'A caverna está iluminada. Você pode ver diversos cristais nas paredes e um pequeno riacho correndo pelo centro.'
              : 'Está muito escuro aqui. Você mal consegue ver alguns metros à sua frente com sua lanterna.'
          };
        default:
          return {
            success: true,
            message: 'Nada de especial para ver aqui.'
          };
      }
    }

    // Examinar algo específico
    const target = args[0].toLowerCase();
    
    if (state.currentLocation === 'forest' && target === 'chão') {
      return {
        success: true,
        message: 'Examinando melhor, você encontra uma lanterna entre as folhas!'
      };
    }
    
    return {
      success: true,
      message: `Você examina ${target} mas não nota nada especial.`
    };
  }
};

const takeCommand: Command = {
  name: 'take',
  description: 'Pegar um item',
  aliases: ['pegar', 'coletar', 'obter'],
  help: 'take [item] - Tenta pegar um item do local atual e adicioná-lo ao inventário.',
  execute: (args, state) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'O que você quer pegar?'
      };
    }

    const item = args[0].toLowerCase();
    
    // Itens específicos por localização
    if (state.currentLocation === 'forest' && item === 'lanterna') {
      if (state.inventory.includes('lanterna')) {
        return {
          success: false,
          message: 'Você já possui uma lanterna.'
        };
      }
      
      return {
        success: true,
        message: 'Você pegou a lanterna!',
        effects: { addToInventory: ['lanterna'] }
      };
    }
    
    if (state.currentLocation === 'cave' && item === 'cristal') {
      if (!state.gameFlags['cave_illuminated']) {
        return {
          success: false,
          message: 'Está muito escuro para encontrar cristais.'
        };
      }
      
      if (state.inventory.includes('cristal')) {
        return {
          success: false,
          message: 'Você já possui um cristal.'
        };
      }
      
      return {
        success: true,
        message: 'Você coletou um cristal brilhante!',
        effects: { addToInventory: ['cristal'] }
      };
    }
    
    return {
      success: false,
      message: `Não há ${item} para pegar aqui.`
    };
  }
};

const useCommand: Command = {
  name: 'use',
  description: 'Usar um item',
  aliases: ['usar', 'utilizar'],
  help: 'use [item] - Tenta usar um item do seu inventário no local atual.',
  execute: (args, state) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'O que você quer usar?'
      };
    }

    const item = args[0].toLowerCase();
    
    // Verificar se o item está no inventário
    if (!state.inventory.includes(item)) {
      return {
        success: false,
        message: `Você não possui ${item}.`
      };
    }
    
    // Usos específicos de itens
    if (item === 'lanterna' && state.currentLocation === 'cave') {
      if (state.gameFlags['cave_illuminated']) {
        return {
          success: false,
          message: 'A caverna já está iluminada.'
        };
      }
      
      return {
        success: true,
        message: 'Você acende a lanterna, iluminando a caverna. Agora você consegue ver vários cristais brilhantes nas paredes!',
        effects: { setFlag: { 'cave_illuminated': true } }
      };
    }
    
    return {
      success: false,
      message: `Você não consegue pensar em como usar ${item} aqui.`
    };
  }
};

const inventoryCommand: Command = {
  name: 'inventory',
  description: 'Verificar seu inventário',
  aliases: ['inventário', 'itens', 'i'],
  help: 'inventory - Lista os itens que você está carregando atualmente.',
  execute: (args, state) => {
    if (state.inventory.length === 0) {
      return {
        success: true,
        message: 'Seu inventário está vazio.'
      };
    }
    
    return {
      success: true,
      message: `Inventário: ${state.inventory.join(', ')}`
    };
  }
};

// Lista de comandos de aventura disponíveis (agora inclui o help importado)
export const adventureCommands: Command[] = [
  moveCommand,
  lookCommand,
  takeCommand,
  useCommand,
  inventoryCommand,
  importedHelpCommand
];

// Obter descrições dos comandos shell para o help
const shellHelpInfo: HelpInfo[] = Object.keys(shellCommandHandlers).map(name => ({
  name,
  description: `Comando de shell: ${name}`, // Descrição genérica
  helpText: `Use 'man ${name}' para obter ajuda sobre este comando shell.`
}));

// Função para processar um comando de texto
export const processCommand = (input: string, state: GameState): CommandResult => {
  const parts = input.trim().toLowerCase().split(/\s+/);
  const commandName = parts[0];
  const args = parts.slice(1);
  
  if (!commandName) {
    return { success: true, message: '' }; // Linha vazia, sem erro
  }

  // --- Tratamento Especial para HELP --- 
  if (commandName === 'help' || commandName === 'ajuda' || commandName === '?') {
    // Coletar informações de todos os comandos disponíveis (aventura + shell)
    const availableAdventureCommands: HelpInfo[] = adventureCommands
      .filter(cmd => !cmd.availability || cmd.availability(state))
      .map(cmd => ({ 
        name: cmd.name, 
        description: cmd.description, 
        helpText: cmd.help // Usar a propriedade help adicionada
      }));
      
    const allAvailableCommandsInfo: HelpInfo[] = [...availableAdventureCommands, ...shellHelpInfo];

    // Chamar o execute do help importado, passando as informações
    return importedHelpCommand.execute(args, state, allAvailableCommandsInfo);
  }
  // --- Fim do Tratamento Especial para HELP ---

  // Verificar se é um comando Git - não processamos aqui
  if (commandName === 'git') {
    return {
      success: false,
      message: 'Comandos Git são processados separadamente.'
    };
  }
  
  // Verificar se é um comando Shell (exceto help)
  if (shellCommandHandlers[commandName]) {
    return processShellCommand(input);
  }
  
  // Buscar comando de aventura correspondente (exceto help, já tratado)
  const matchedCommand = adventureCommands.find(cmd => 
    cmd.name !== 'help' && // Não buscar help aqui novamente
    (cmd.name === commandName || (cmd.aliases && cmd.aliases.includes(commandName))) &&
    (!cmd.availability || cmd.availability(state)) // Verificar disponibilidade
  );
  
  if (!matchedCommand) {
    return {
      success: false,
      message: `Comando não reconhecido: ${commandName}. Digite 'help' para ver os comandos disponíveis.`
    };
  }
  
  // Executar comando encontrado
  return matchedCommand.execute(args, state);
};