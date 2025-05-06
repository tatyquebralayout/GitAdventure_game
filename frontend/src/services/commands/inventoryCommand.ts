import { Command } from '../../types/commands';

export const inventoryCommand: Command = {
  name: 'inventory',
  patterns: [
    /^(?:inventory|inv|i|items|mochila|itens)$/i,
    /^(?:check|see|view)\s+(?:inventory|items|itens)$/i,
  ],
  execute: (args, gameState) => {
    if (gameState.inventory.length === 0) {
      return {
        success: true,
        message: 'Seu inventário está vazio.'
      };
    }
    
    const itemList = gameState.inventory.join(', ');
    
    return {
      success: true,
      message: `Você está carregando: ${itemList}`
    };
  },
  help: "inventory - mostra os itens que você está carregando"
};