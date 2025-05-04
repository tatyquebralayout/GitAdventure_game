import { Command, CommandResult } from '../../types/commands';
import { GameState } from '../../stores/gameStore';
import { locations } from '../../constants/locations';

export const takeCommand: Command = {
  name: 'take',
  patterns: [
    /^(?:take|get|pick|grab)\s+(.+)$/i,
    /^(?:pick\s+up)\s+(.+)$/i,
  ],
  execute: (args, gameState) => {
    const itemName = args[0].toLowerCase();
    const currentLocation = locations[gameState.currentLocation];
    
    if (!currentLocation) {
      return {
        success: false,
        message: 'Erro: Localização atual desconhecida.'
      };
    }
    
    // Check if the item exists in the current location
    if (!currentLocation.items?.includes(itemName)) {
      return {
        success: false,
        message: `Não há ${itemName} aqui para pegar.`
      };
    }
    
    // Check if item is already in inventory
    if (gameState.inventory.includes(itemName)) {
      return {
        success: false,
        message: `Você já tem ${itemName} no seu inventário.`
      };
    }
    
    return {
      success: true,
      message: `Você pegou ${itemName}.`,
      effects: {
        addToInventory: [itemName]
      }
    };
  },
  help: "take [item] - pega um item do ambiente"
};