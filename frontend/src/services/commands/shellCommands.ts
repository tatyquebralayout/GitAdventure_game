import { CommandResult } from '../../types/commands';
// import { useFileSystemStore } from '../../stores/fileSystemStore';

// Definição da interface para sistema de arquivos virtual - REMOVIDO
/*
interface VirtualFile {
  type: 'file' | 'dir';
  content?: string;
}

interface VirtualFS {
  currentDir: string;
  files: Record<string, VirtualFile>;
}
*/

// Interface para os manipuladores de comandos shell
export interface ShellCommandHandler {
//  (args: string[], fsState: VirtualFS): CommandResult; // Assinatura será ajustada
  (args: string[]): CommandResult;
}

// Estado inicial do sistema de arquivos virtual - REMOVIDO
/*
const initialFS: VirtualFS = {
  currentDir: '/home/player',
  files: {
    '/': { type: 'dir' },
    '/home': { type: 'dir' },
    '/home/player': { type: 'dir' },
    '/home/player/README.md': { 
      type: 'file', 
      content: '# Bem-vindo ao Git Adventure\n\nEste é um jogo educativo para aprender comandos Git.' 
    },
    '/home/player/src': { type: 'dir' },
    '/home/player/src/index.js': { 
      type: 'file', 
      content: 'console.log("Hello Git Adventure!");' 
    }
  }
};
*/

// Estado atual do FS - REMOVIDO
/*
const fsState: VirtualFS = { ...initialFS };
*/

// Helpers para manipulação de caminhos - Assinatura será ajustada
const normalizePath = (path: string, currentDir: string): string => {
  // Se caminho absoluto
  if (path.startsWith('/')) {
    return path;
  }
  
  // Se caminho relativo
  if (path === '.' || path === '') {
    return currentDir;
  }
  
  if (path === '..') {
    const parts = currentDir.split('/').filter(Boolean);
    return parts.length > 0 
      ? '/' + parts.slice(0, -1).join('/')
      : '/';
  }
  
  // Caminho relativo normal
  return `${currentDir === '/' ? '' : currentDir}/${path}`;
};

// Helper para obter conteúdo do diretório - Assinatura e uso serão ajustados
// const getDirectoryContents = (path: string, fs: VirtualFS): string[] => {
/* const getDirectoryContents = (path: string, files: Record<string, { type: 'file' | 'dir'; content?: string }>, currentDir: string): string[] => {
  const normalizedPath = normalizePath(path, currentDir);
  const prefix = normalizedPath === '/' ? '/' : normalizedPath + '/';
  
  return Object.keys(files)
    .filter(filePath => {
      // Exatamente este diretório
      if (filePath === normalizedPath) {
        return false;
      }
      
      // Arquivos/diretórios diretamente neste diretório
      if (filePath.startsWith(prefix)) {
        const remainingPath = filePath.slice(prefix.length);
        return !remainingPath.includes('/');
      }
      
      return false;
    })
    .map(filePath => filePath.slice(prefix.length));
}; */


// Implementação dos comandos shell - Será ajustada para usar useFileSystemStore
export const shellCommandHandlers: Record<string, ShellCommandHandler> = {
  // Mostrar diretório atual
  pwd: (_args) => { // Remover parâmetro fs
//    const { currentDir } = useFileSystemStore.getState();
    return {
      success: true,
//      message: fs.currentDir
      message: 'TODO: Obter de useFileSystemStore' // Placeholder
    };
  },
  
  // Listar conteúdo do diretório
  ls: (args) => { // Remover parâmetro fs
//    const { currentDir, files } = useFileSystemStore.getState();
//    const targetDir = args.length > 0 ? args[0] : currentDir;
//    const contents = getDirectoryContents(targetDir, files, currentDir);
    const contents: string[] = []; // Placeholder
    
    if (contents.length === 0) {
      return {
        success: true,
        message: ''
      };
    }
    
    return {
      success: true,
      message: contents.join('\n')
    };
  },
  
  // Mudar de diretório
  cd: (args) => { // Remover parâmetro fs
//    const { currentDir, files, changeDirectory } = useFileSystemStore.getState();
    if (args.length === 0) {
//      changeDirectory('/home/player');
      return {
        success: true,
        message: ''
      };
    }
    
//    const targetPath = normalizePath(args[0], currentDir);
    const targetPath = 'TODO'; // Placeholder
    const files = {}; // Placeholder
    
    // Verificar se existe e é um diretório
    if (!files[targetPath]) {
      return {
        success: false,
        message: `cd: ${args[0]}: No such file or directory`
      };
    }
    
    if (files[targetPath].type !== 'dir') {
      return {
        success: false,
        message: `cd: ${args[0]}: Not a directory`
      };
    }
    
//    changeDirectory(targetPath);
    
    return {
      success: true,
      message: ''
    };
  },
  
  // Mostrar conteúdo de arquivo
  cat: (args) => ({ success: false, message: 'TODO: Refatorar cat com useFileSystemStore'}),
  
  // Criar diretório
  mkdir: (args) => ({ success: false, message: 'TODO: Refatorar mkdir com useFileSystemStore'}),
  
  // Criar arquivo vazio
  touch: (args) => ({ success: false, message: 'TODO: Refatorar touch com useFileSystemStore'}),
  
  // Remover arquivo ou diretório
  rm: (args) => ({ success: false, message: 'TODO: Refatorar rm com useFileSystemStore'}),
  
  // Limpar tela
  clear: () => {
    return {
      success: true,
      message: '\x1B[2J\x1B[0f' // Códigos ANSI para limpar tela
    };
  },
  
  // Mostrar manual do comando
  man: (args) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'O que manual você quer?'
      };
    }
    
    const command = args[0];
    
    // Manuais básicos
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
  
  // Echo - imprimir texto
  echo: (args) => {
    return {
      success: true,
      message: args.join(' ')
    };
  },

  // Grep - buscar padrões em arquivos de texto
  grep: (args) => ({ success: false, message: 'TODO: Refatorar grep com useFileSystemStore'}),

  // Find - procurar arquivos
  find: (args) => ({ success: false, message: 'TODO: Refatorar find com useFileSystemStore'}),

  // Diff - comparar arquivos
  diff: (args) => ({ success: false, message: 'TODO: Refatorar diff com useFileSystemStore'}),

  // Less - visualizador de arquivo com paginação
  less: (args) => ({ success: false, message: 'TODO: Refatorar less com useFileSystemStore'}),

  // More - visualizador de arquivo básico (versão antiga do less)
  more: (args) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'more: missing file operand'
      };
    }

    const filePath = normalizePath(args[0], fsState.currentDir);

    // Verificar se o arquivo existe
    if (!fsState.files[filePath]) {
      return {
        success: false,
        message: `more: ${args[0]}: No such file or directory`
      };
    }

    if (fsState.files[filePath].type !== 'file') {
      return {
        success: false,
        message: `more: ${args[0]}: Is a directory`
      };
    }

    // Simulação simplificada de more
    return {
      success: true,
      message: fsState.files[filePath].content || ''
    };
  },

  // Head - mostrar o início de um arquivo
  head: (args) => ({ success: false, message: 'TODO: Refatorar head com useFileSystemStore'}),

  // Tail - mostrar o final de um arquivo
  tail: (args) => ({ success: false, message: 'TODO: Refatorar tail com useFileSystemStore'}),

  // Vimdiff - Simulação simples
  vimdiff: (args) => ({ success: false, message: 'TODO: Refatorar vimdiff com useFileSystemStore'}),
};

// Função para processar o comando shell
export const processShellCommand = (commandLine: string): CommandResult => {
  const parts = commandLine.trim().split(/\s+/);
  const commandName = parts[0];
  const args = parts.slice(1);

  if (!commandName) {
    return { success: true, message: '' }; // Linha vazia, sem erro
  }

  const handler = shellCommandHandlers[commandName];

  if (handler) {
    try {
      return handler(args); // Chamar handler atualizado (sem fsState)
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