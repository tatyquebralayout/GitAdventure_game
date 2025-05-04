import { commands } from './index';

export function autocompleteCommand(partial: string): string {
  if (!partial) return '';
  
  // Available commands for autocomplete
  const availableCommands = commands.map(cmd => cmd.name);
  
  // Check if input matches the beginning of any command
  const matchingCommands = availableCommands.filter(cmd => 
    cmd.toLowerCase().startsWith(partial.toLowerCase())
  );
  
  // If there's only one match, return it
  if (matchingCommands.length === 1) {
    return matchingCommands[0];
  }
  
  // If there are multiple matches, return the common prefix
  if (matchingCommands.length > 1) {
    let commonPrefix = matchingCommands[0];
    for (let i = 1; i < matchingCommands.length; i++) {
      let j = 0;
      while (
        j < commonPrefix.length && 
        j < matchingCommands[i].length && 
        commonPrefix[j].toLowerCase() === matchingCommands[i][j].toLowerCase()
      ) {
        j++;
      }
      commonPrefix = commonPrefix.substring(0, j);
    }
    return commonPrefix;
  }
  
  return partial; // No matches, return original input
}