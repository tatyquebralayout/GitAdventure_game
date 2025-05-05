const gitCommands = [
  'git init',
  'git status',
  'git add',
  'git commit',
  'git branch',
  'git checkout',
  'git merge',
  'git log',
  'git diff',
  'git remote',
  'git push',
  'git pull',
  'git clone',
  'git fetch',
  'git stash',
  'git stash list',
  'git stash pop',
  'git stash apply',
  'git stash drop',
  'git stash clear',
  'git reset',
  'git reset --hard',
  'git reset --soft',
  'git revert'
];

const shellCommands = [
  'ls',
  'cd',
  'pwd',
  'mkdir',
  'touch',
  'rm',
  'cat',
  'echo',
  'clear',
  'man',
  'grep',
  'find',
  'diff',
  'less',
  'more',
  'head',
  'tail',
  'vimdiff'
];

const gameCommands = [
  'move',
  'go',
  'look',
  'take',
  'use',
  'inventory',
  'help'
];

// Todos os comandos agrupados
const allCommands = [...gitCommands, ...shellCommands, ...gameCommands];

/**
 * Função que implementa autocomplete de comandos
 * @param input Texto atual do comando
 * @returns Comando completo ou null se não houver match
 */
export const autocompleteCommand = (input: string): string | null => {
  // Se a entrada estiver vazia, não fazer nada
  if (!input.trim()) {
    return null;
  }
  
  const inputLower = input.toLowerCase();
  
  // Verificar se algum comando começa com a entrada do usuário
  const matches = allCommands.filter(cmd => 
    cmd.toLowerCase().startsWith(inputLower)
  );
  
  // Se encontrar exatamente um comando, retornar
  if (matches.length === 1) {
    return matches[0];
  }
  
  // Se encontrar múltiplos, buscar o prefixo comum mais longo
  if (matches.length > 1) {
    let result = '';
    const minLength = Math.min(...matches.map(cmd => cmd.length));
    
    for (let i = 0; i < minLength; i++) {
      const char = matches[0][i];
      if (matches.every(cmd => cmd[i] === char)) {
        result += char;
      } else {
        break;
      }
    }
    
    // Se o resultado for maior que a entrada, retornar
    if (result.length > input.length) {
      return result;
    }
  }
  
  return null;
};

/**
 * Função que retorna sugestões de comandos com base na entrada
 * (útil para interfaces que exibem sugestões)
 */
export const getSuggestions = (input: string): string[] => {
  const inputLower = input.toLowerCase();
  
  return allCommands.filter(cmd => 
    cmd.toLowerCase().startsWith(inputLower)
  );
};