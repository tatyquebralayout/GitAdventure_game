import { CommandResult } from '../../types/commands';
// Import the file system store
import { useFileSystemStore } from '../../stores/fileSystemStore';

// Interface for the shell command handlers (no longer needs fsState)
export interface ShellCommandHandler {
  (args: string[]): CommandResult;
}

// Helpers for path manipulation (using currentDir from store)
const normalizePath = (path: string, currentDir: string): string => {
  if (path.startsWith('/')) {
    return path.replace(/\/$/, '') || '/'; // Ensure root is '/'
  }
  
  const parts = currentDir.split('/').filter(Boolean);
  const pathSegments = path.split('/').filter(Boolean);

  for (const segment of pathSegments) {
    if (segment === '.') continue;
    if (segment === '..') {
      parts.pop();
    } else {
      parts.push(segment);
    }
  }
  
  return '/' + parts.join('/');
};

// Helper to get directory contents from the store
const getDirectoryContents = (path: string): string[] => {
  const { files } = useFileSystemStore.getState();
  const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, ''); // Remove trailing slash unless root
  const prefix = normalizedPath === '/' ? '/' : normalizedPath + '/';

  return Object.keys(files)
    .filter(filePath => {
      if (filePath === normalizedPath) return false; // Exclude the directory itself
      if (filePath.startsWith(prefix)) {
        const remainingPath = filePath.substring(prefix.length);
        // Only include direct children (no further slashes)
        return !remainingPath.includes('/');
      }
      return false;
    })
    .map(filePath => filePath.substring(prefix.length));
};

// Implementation of shell commands using useFileSystemStore
export const shellCommandHandlers: Record<string, ShellCommandHandler> = {
  pwd: (_args) => {
    const { currentDir } = useFileSystemStore.getState();
    return {
      success: true,
      message: currentDir
    };
  },
  
  ls: (args) => {
    const { currentDir, files } = useFileSystemStore.getState();
    const targetDirArg = args.length > 0 ? args[0] : '.';
    const targetPath = normalizePath(targetDirArg, currentDir);

    if (!files[targetPath] || files[targetPath].type !== 'dir') {
      return {
        success: false,
        message: `ls: cannot access '${args[0] || targetPath}': No such file or directory`
      };
    }

    const contents = getDirectoryContents(targetPath);
    
    return {
      success: true,
      message: contents.join('\n')
    };
  },
  
  cd: (args) => {
    const { currentDir, files, changeDirectory } = useFileSystemStore.getState();
    const targetDirArg = args.length === 0 ? '/home/player' : args[0]; // Default to home if no arg
    const targetPath = normalizePath(targetDirArg, currentDir);
    
    if (!files[targetPath]) {
      return {
        success: false,
        message: `cd: ${args[0] || targetDirArg}: No such file or directory`
      };
    }
    
    if (files[targetPath].type !== 'dir') {
      return {
        success: false,
        message: `cd: ${args[0] || targetDirArg}: Not a directory`
      };
    }
    
    changeDirectory(targetPath);
    
    return {
      success: true,
      message: ''
    };
  },
  
  cat: (args) => {
    if (args.length === 0) {
      return { success: false, message: 'cat: missing file operand' };
    }
    const { currentDir, files } = useFileSystemStore.getState();
    const targetPath = normalizePath(args[0], currentDir);

    if (!files[targetPath]) {
      return { success: false, message: `cat: ${args[0]}: No such file or directory` };
    }
    if (files[targetPath].type !== 'file') {
      return { success: false, message: `cat: ${args[0]}: Is a directory` };
    }

    return {
      success: true,
      message: files[targetPath].content || ''
    };
  },
  
  mkdir: (args) => {
    if (args.length === 0) {
      return { success: false, message: 'mkdir: missing operand' };
    }
    const { currentDir, files, createDirectory } = useFileSystemStore.getState();
    const targetPath = normalizePath(args[0], currentDir);

    if (files[targetPath]) {
      return { success: false, message: `mkdir: cannot create directory '${args[0]}': File exists` };
    }

    // Check if parent directory exists
    const parentPath = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
    if (!files[parentPath] || files[parentPath].type !== 'dir') {
       return { success: false, message: `mkdir: cannot create directory '${args[0]}': No such file or directory` };
    }

    createDirectory(targetPath);
    return { success: true, message: '' };
  },
  
  touch: (args) => {
    if (args.length === 0) {
      return { success: false, message: 'touch: missing file operand' };
    }
    const { currentDir, files, createFile } = useFileSystemStore.getState();
    const targetPath = normalizePath(args[0], currentDir);

    // Check if parent directory exists
    const parentPath = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
    if (!files[parentPath] || files[parentPath].type !== 'dir') {
       return { success: false, message: `touch: cannot touch '${args[0]}': No such file or directory` };
    }

    // If file doesn't exist, create it. If it exists, update timestamp (not implemented, so just succeed)
    if (!files[targetPath]) {
      createFile(targetPath, '');
    } else if (files[targetPath].type === 'dir') {
      return { success: false, message: `touch: cannot touch '${args[0]}': Is a directory` };
    }
    // TODO: Update timestamp if file exists

    return { success: true, message: '' };
  },
  
  rm: (args) => {
    // Basic implementation, doesn't handle flags like -r yet
    if (args.length === 0) {
      return { success: false, message: 'rm: missing operand' };
    }
    const { currentDir, files, deletePath } = useFileSystemStore.getState();
    const targetPath = normalizePath(args[0], currentDir);

    if (!files[targetPath]) {
      return { success: false, message: `rm: cannot remove '${args[0]}': No such file or directory` };
    }

    // Basic check: prevent removing non-empty directory without -r (which isn't implemented)
    if (files[targetPath].type === 'dir') {
       const contents = getDirectoryContents(targetPath);
       if (contents.length > 0) {
         return { success: false, message: `rm: cannot remove '${args[0]}': Directory not empty` };
       }
    }

    // For now, recursive is false. Add flag parsing later.
    deletePath(targetPath, false); 
    return { success: true, message: '' };
  },
  
  clear: () => {
    return {
      success: true,
      message: '\x1B[2J\x1B[0f' // ANSI codes to clear screen
    };
  },
  
  man: (args) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'O que manual você quer?'
      };
    }
    
    const command = args[0];
    
    // Basic manuals
    const manuals: Record<string, string> = {
      git: 'GIT(1)\n\nNOME\n    git - sistema de controle de versão distribuído\n\nSINOPSE\n    git [--version] [--help] [-C <path>] [-c name=value]\n       [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]\n       [-p | --paginate | --no-pager] [--no-replace-objects] [--bare]\n       [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]\n       <comando> [<args>]',
      ls: 'LS(1)\n\nNOME\n    ls - listar conteúdo do diretório\n\nSINOPSE\n    ls [OPÇÃO]... [ARQUIVO]...',
      cd: 'CD(1)\n\nNOME\n    cd - mudar o diretório de trabalho atual\n\nSINOPSE\n    cd [dir]',
      pwd: 'PWD(1)\n\nNOME\n    pwd - imprimir nome do diretório atual/de trabalho\n\nSINOPSE\n    pwd [OPÇÃO]...',
      mkdir: 'MKDIR(1)\n\nNOME\n    mkdir - criar diretórios\n\nSINOPSE\n    mkdir [OPÇÃO]... DIRETÓRIO...',
      rm: 'RM(1)\n\nNOME\n    rm - remover arquivos ou diretórios\n\nSINOPSE\n    rm [OPÇÃO]... ARQUIVO...',
      grep: 'GREP(1)\n\nNOME\n    grep - buscar por padrões em arquivos de texto\n\nSINOPSE\n    grep [OPÇÃO]... PADRÃO [ARQUIVO]...',
      find: 'FIND(1)\n\nNOME\n    find - procurar arquivos no sistema de arquivos\n\nSINOPSE\n    find [CAMINHO]... [EXPRESSÃO]',
      diff: 'DIFF(1)\n\nNOME\n    diff - comparar arquivos linha por linha\n\nSINOPSE\n    diff [OPÇÃO]... ARQUIVOS',
      less: 'LESS(1)\n\nNOME\n    less - visualizador de arquivos com suporte a paginação\n\nSINOPSE\n    less [OPÇÃO]... [ARQUIVO]...',
      head: 'HEAD(1)\n\nNOME\n    head - mostrar o início de arquivos\n\nSINOPSE\n    head [OPÇÃO]... [ARQUIVO]...',
      tail: 'TAIL(1)\n\nNOME\n    tail - mostrar o final de arquivos\n\nSINOPSE\n    tail [OPÇÃO]... [ARQUIVO]...',
      vimdiff: 'VIMDIFF(1)\n\nNOME\n    vimdiff - comparar e editar arquivos lado a lado (versão simplificada)\n\nSINOPSE\n    vimdiff [ARQUIVO1] [ARQUIVO2]'
    };
    
    if (!manuals[command]) {
      return {
        success: false,
        message: `Nenhuma entrada de manual para ${command}`
      };
    }
    
    return {
      success: true,
      message: manuals[command]
    };
  },
  
  echo: (args) => {
    return {
      success: true,
      message: args.join(' ')
    };
  },

  grep: (args) => {
    if (args.length < 2) {
      return { success: false, message: 'Usage: grep PATTERN FILE' };
    }
    const pattern = args[0];
    const fileName = args[1];
    const { currentDir, files } = useFileSystemStore.getState();
    const targetPath = normalizePath(fileName, currentDir);

    if (!files[targetPath]) {
      return { success: false, message: `grep: ${fileName}: No such file or directory` };
    }
    if (files[targetPath].type !== 'file') {
      return { success: false, message: `grep: ${fileName}: Is a directory` };
    }

    const matches = (files[targetPath].content || '').split('\n')
      .filter(line => line.includes(pattern));

    return { success: true, message: matches.join('\n') };
  },

  find: (args) => {
    const { currentDir, files } = useFileSystemStore.getState();
    const searchPath = args.length > 0 ? normalizePath(args[0], currentDir) : currentDir;

    if (!files[searchPath]) {
      return { success: false, message: `find: '${args[0]}': No such file or directory` };
    }

    // Get all paths that start with searchPath
    const results = Object.keys(files)
      .filter(path => path.startsWith(searchPath))
      .map(path => path.substring(searchPath.length + 1))
      .filter(Boolean);

    return { success: true, message: results.join('\n') };
  },

  diff: (args) => {
    if (args.length < 2) {
      return { success: false, message: 'Usage: diff FILE1 FILE2' };
    }
    const { currentDir, files } = useFileSystemStore.getState();
    const file1Path = normalizePath(args[0], currentDir);
    const file2Path = normalizePath(args[1], currentDir);

    // Check both files exist and are files
    if (!files[file1Path]) {
      return { success: false, message: `diff: ${args[0]}: No such file or directory` };
    }
    if (!files[file2Path]) {
      return { success: false, message: `diff: ${args[1]}: No such file or directory` };
    }
    if (files[file1Path].type !== 'file') {
      return { success: false, message: `diff: ${args[0]}: Is a directory` };
    }
    if (files[file2Path].type !== 'file') {
      return { success: false, message: `diff: ${args[1]}: Is a directory` };
    }

    const file1Lines = (files[file1Path].content || '').split('\n');
    const file2Lines = (files[file2Path].content || '').split('\n');

    // Simple diff implementation
    let diffOutput = '';
    let i = 0;
    while (i < Math.max(file1Lines.length, file2Lines.length)) {
      if (i >= file1Lines.length) {
        diffOutput += `> ${file2Lines[i]}\n`;
      } else if (i >= file2Lines.length) {
        diffOutput += `< ${file1Lines[i]}\n`;
      } else if (file1Lines[i] !== file2Lines[i]) {
        diffOutput += `< ${file1Lines[i]}\n> ${file2Lines[i]}\n`;
      }
      i++;
    }

    return { success: true, message: diffOutput || 'Files are identical' };
  },

  less: (args) => {
    if (args.length === 0) {
      return { success: false, message: 'less: missing file operand' };
    }
    const { currentDir, files } = useFileSystemStore.getState();
    const targetPath = normalizePath(args[0], currentDir);

    if (!files[targetPath]) {
      return { success: false, message: `less: ${args[0]}: No such file or directory` };
    }
    if (files[targetPath].type !== 'file') {
      return { success: false, message: `less: ${args[0]}: Is a directory` };
    }

    return {
      success: true,
      message: files[targetPath].content || '' 
    };
  },
  more: (args) => {
    if (args.length === 0) {
      return { success: false, message: 'more: missing file operand' };
    }
    const { currentDir, files } = useFileSystemStore.getState();
    const targetPath = normalizePath(args[0], currentDir);

    if (!files[targetPath]) {
      return { success: false, message: `more: ${args[0]}: No such file or directory` };
    }
    if (files[targetPath].type !== 'file') {
      return { success: false, message: `more: ${args[0]}: Is a directory` };
    }

    return {
      success: true,
      message: files[targetPath].content || ''
    };
  },
  head: (args) => {
    if (args.length === 0) {
      return { success: false, message: 'head: missing file operand' };
    }
    const { currentDir, files } = useFileSystemStore.getState();
    const targetPath = normalizePath(args[0], currentDir);

    if (!files[targetPath]) {
      return { success: false, message: `head: ${args[0]}: No such file or directory` };
    }
    if (files[targetPath].type !== 'file') {
      return { success: false, message: `head: ${args[0]}: Is a directory` };
    }

    const lines = (files[targetPath].content || '').split('\n');
    const headLines = lines.slice(0, 10); // Default to first 10 lines

    return {
      success: true,
      message: headLines.join('\n')
    };
  },
  tail: (args) => {
     if (args.length === 0) {
      return { success: false, message: 'tail: missing file operand' };
    }
    const { currentDir, files } = useFileSystemStore.getState();
    const targetPath = normalizePath(args[0], currentDir);

    if (!files[targetPath]) {
      return { success: false, message: `tail: ${args[0]}: No such file or directory` };
    }
    if (files[targetPath].type !== 'file') {
      return { success: false, message: `tail: ${args[0]}: Is a directory` };
    }

    const lines = (files[targetPath].content || '').split('\n');
    const tailLines = lines.slice(-10); // Default to last 10 lines

    return {
      success: true,
      message: tailLines.join('\n')
    };
  },
  vimdiff: (args) => ({ success: false, message: 'TODO: Implement vimdiff with useFileSystemStore'}),
};

// Function to process the shell command (no changes needed here)
export const processShellCommand = (commandLine: string): CommandResult => {
  const parts = commandLine.trim().split(/\s+/);
  const commandName = parts[0];
  const args = parts.slice(1);

  if (!commandName) {
    return { success: true, message: '' }; // Empty line, no error
  }

  const handler = shellCommandHandlers[commandName];

  if (handler) {
    try {
      return handler(args);
    } catch (error) {
      console.error(`Erro ao executar comando shell '${commandName}':`, error);
      return {
        success: false,
        message: `Erro interno ao executar comando ${commandName}.`
      };
    }
  } else {
    return {
      success: false,
      message: `${commandName}: comando não encontrado`
    };
  }
};