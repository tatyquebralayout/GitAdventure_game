import { Command, CommandResult } from '../../types/commands';
import { GameState } from '../../stores/gameStore';
import { locations } from '../../constants/locations';

export const moveCommand: Command = {
  name: 'move',
  patterns: [
    /^(?:move|go|travel)\s+(?:to\s+)?(.+)$/i,
    /^(?:walk|run)\s+(?:to\s+)?(.+)$/i,
  ],
  execute: (args, gameState) => {
    const direction = args[0].toLowerCase();
    const currentLocation = locations[gameState.currentLocation];
    
    if (!currentLocation) {
      return {
        success: false,
        message: 'Erro: Localização atual desconhecida.'
      };
    }
    
    const connection = currentLocation.connections[direction];
    
    if (!connection) {
      return {
        success: false,
        message: `Você não pode ir para ${direction} daqui.`
      };
    }
    
    // Verificar requisitos se existirem
    if (connection.requirements) {
      for (const req of connection.requirements) {
        if (req.type === 'item' && !gameState.inventory.includes(req.value)) {
          return {
            success: false,
            message: `Você precisa de ${req.value} para ir nessa direção.`
          };
        }
        
        if (req.type === 'flag' && !gameState.gameFlags[req.value]) {
          return {
            success: false,
            message: `Algo está impedindo você de ir nessa direção.`
          };
        }
      }
    }
    
    return {
      success: true,
      message: connection.message || `Você foi para ${direction}.`,
      effects: {
        setLocation: connection.locationId
      }
    };
  },
  help: "move [direção] - move para a direção especificada"
};