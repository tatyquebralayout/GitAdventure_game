import { Command, CommandResult } from '../../types/commands';
import { GameState } from '../../stores/gameStore';

export const inventoryCommand: Command = {
  name: 'inventory',
  patterns: [
    /^(?:inventory|inv|i)$/i,
    /^(?:check\s+inventory)$/i,
    /^(?:items)$/i,
  ],
  execute: (_, gameState) => {
    if (gameState.inventory.length === 0) {
      return {
        success: true,
        message: 'Seu inventário está vazio.'
      };
    }
    
    const itemsList = gameState.inventory.join(', ');
    return {
      success: true,
      message: `Você carrega: ${itemsList}`
    };
  },
  help: "inventory - mostra os itens que você está carregando"
};