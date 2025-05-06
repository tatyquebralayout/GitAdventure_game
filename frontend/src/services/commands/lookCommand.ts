import { Command } from '../../types/commands';
import { locations } from '../../constants/locations';

export const lookCommand: Command = {
  name: 'look',
  patterns: [
    /^(?:look|examine|observe)$/i,
    /^(?:look|examine|observe)\s+(?:at\s+)?(.+)$/i,
  ],
  execute: (args, gameState) => {
    const currentLocation = locations[gameState.currentLocation];
    
    if (!currentLocation) {
      return {
        success: false,
        message: 'Erro: Localização atual desconhecida.'
      };
    }
    
    // If no specific thing to look at, describe the location
    if (!args.length || !args[0]) {
      const exits = Object.keys(currentLocation.connections)
        .map(direction => `${direction} (${locations[currentLocation.connections[direction].locationId].name})`)
        .join(', ');
        
      const items = currentLocation.items?.length
        ? `Você pode ver: ${currentLocation.items.join(', ')}.`
        : 'Não há itens visíveis aqui.';
        
      return {
        success: true,
        message: `${currentLocation.description}\n\nSaídas: ${exits}.\n\n${items}`
      };
    }
    
    // Looking at a specific item or direction
    const target = args[0].toLowerCase();
    
    // Check if looking at a direction
    if (currentLocation.connections[target]) {
      const connection = currentLocation.connections[target];
      const targetLocation = locations[connection.locationId];
      
      return {
        success: true,
        message: `Para ${target} você vê ${targetLocation.name}. ${
          connection.requirements 
            ? 'Parece que há requisitos para ir nessa direção.' 
            : 'O caminho parece livre.'
        }`
      };
    }
    
    // Check if looking at an item in the location
    if (currentLocation.items?.includes(target)) {
      // Item-specific descriptions could be expanded in a real implementation
      const itemDescriptions: Record<string, string> = {
        map: 'Um mapa da área. Mostra várias localizações e caminhos.',
        lantern: 'Uma lanterna útil para iluminar áreas escuras.',
        branch: 'Um galho que parece representar uma ramificação de Git.',
        stash: 'Um objeto misterioso que parece guardar coisas temporariamente.'
      };
      
      return {
        success: true,
        message: itemDescriptions[target] || `Você vê ${target}.`
      };
    }
    
    // Check if looking at an item in inventory
    if (gameState.inventory.includes(target)) {
      return {
        success: true,
        message: `Você examina ${target} em seu inventário. Talvez possa usá-lo em algum lugar.`
      };
    }
    
    return {
      success: false,
      message: `Você não vê ${target} aqui.`
    };
  },
  help: "look [objeto] - examina o ambiente ou um objeto específico"
};