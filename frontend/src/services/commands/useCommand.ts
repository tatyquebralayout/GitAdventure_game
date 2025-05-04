import { Command, CommandResult } from '../../types/commands';
import { GameState } from '../../stores/gameStore';
import { locations } from '../../constants/locations';

export const useCommand: Command = {
  name: 'use',
  patterns: [
    /^(?:use|activate)\s+(.+)$/i,
    /^(?:use|activate)\s+(.+)\s+(?:on|with)\s+(.+)$/i,
  ],
  execute: (args, gameState) => {
    const itemName = args[0].toLowerCase();
    const target = args[1]?.toLowerCase();
    const currentLocation = locations[gameState.currentLocation];
    
    if (!currentLocation) {
      return {
        success: false,
        message: 'Erro: Localização atual desconhecida.'
      };
    }
    
    // Check if player has the item
    if (!gameState.inventory.includes(itemName)) {
      return {
        success: false,
        message: `Você não tem ${itemName} no seu inventário.`
      };
    }
    
    // Handle special use cases
    if (itemName === 'lantern' && currentLocation.id === 'forest' && target === 'cave') {
      return {
        success: true,
        message: 'Você usa a lanterna para iluminar o caminho para a caverna. Agora você pode ver claramente.',
        effects: {
          setFlag: { 'cave_illuminated': true }
        }
      };
    }
    
    if (itemName === 'map') {
      return {
        success: true,
        message: 'Você consulta o mapa. Ele mostra todas as localizações que você já visitou e algumas áreas inexploradas.',
      };
    }
    
    if (itemName === 'branch' && target === 'git') {
      return {
        success: true,
        message: 'Você cria um novo branch Git. Isso representa um novo caminho de desenvolvimento independente.',
        effects: {
          setFlag: { 'created_branch': true }
        }
      };
    }
    
    // Generic case when no special interaction is defined
    return {
      success: false,
      message: target 
        ? `Você tenta usar ${itemName} em ${target}, mas nada acontece.` 
        : `Você tenta usar ${itemName}, mas não sabe como neste contexto.`
    };
  },
  help: "use [item] (on/with [target]) - usa um item do inventário, opcionalmente em um alvo específico"
};