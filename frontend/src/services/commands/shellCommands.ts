import { CommandResult } from './index';

// Definição da interface para sistema de arquivos virtual
interface VirtualFile {
  type: 'file' | 'dir';
  content?: string;
}

interface VirtualFS {
  currentDir: string;
  files: Record<string, VirtualFile>;
}

// Interface para os manipuladores de comandos shell
export interface ShellCommandHandler {
  (args: string[], fsState: VirtualFS): CommandResult;
}

// Estado inicial do sistema de arquivos virtual
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

// Estado atual do FS (seria melhor usar um store/context real em produção)
const fsState: VirtualFS = { ...initialFS };

// Helpers para manipulação de caminhos
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

const getDirectoryContents = (path: string, fs: VirtualFS): string[] => {
  const normalizedPath = normalizePath(path, fs.currentDir);
  const prefix = normalizedPath === '/' ? '/' : normalizedPath + '/';
  
  return Object.keys(fs.files)
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
};

// Implementação dos comandos shell
export const shellCommandHandlers: Record<string, ShellCommandHandler> = {
  // Mostrar diretório atual
  pwd: (_args, fs) => {
    return {
      success: true,
      message: fs.currentDir
    };
  },
  
  // Listar conteúdo do diretório
  ls: (args, fs) => {
    const targetDir = args.length > 0 ? args[0] : fs.currentDir;
    const contents = getDirectoryContents(targetDir, fs);
    
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
  cd: (args, fs) => {
    if (args.length === 0) {
      // Ir para home quando cd é chamado sem argumentos
      fsState.currentDir = '/home/player';
      return {
        success: true,
        message: ''
      };
    }
    
    const targetPath = normalizePath(args[0], fs.currentDir);
    
    // Verificar se existe e é um diretório
    if (!fs.files[targetPath]) {
      return {
        success: false,
        message: `cd: ${args[0]}: No such file or directory`
      };
    }
    
    if (fs.files[targetPath].type !== 'dir') {
      return {
        success: false,
        message: `cd: ${args[0]}: Not a directory`
      };
    }
    
    // Atualizar diretório atual
    fsState.currentDir = targetPath;
    
    return {
      success: true,
      message: ''
    };
  },
  
  // Mostrar conteúdo de arquivo
  cat: (args, fs) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'cat: missing file operand'
      };
    }
    
    const targetPath = normalizePath(args[0], fs.currentDir);
    
    // Verificar se existe e é um arquivo
    if (!fs.files[targetPath]) {
      return {
        success: false,
        message: `cat: ${args[0]}: No such file or directory`
      };
    }
    
    if (fs.files[targetPath].type !== 'file') {
      return {
        success: false,
        message: `cat: ${args[0]}: Is a directory`
      };
    }
    
    return {
      success: true,
      message: fs.files[targetPath].content || ''
    };
  },
  
  // Criar diretório
  mkdir: (args, fs) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'mkdir: missing operand'
      };
    }
    
    const newDirPath = normalizePath(args[0], fs.currentDir);
    
    // Verificar se já existe
    if (fs.files[newDirPath]) {
      return {
        success: false,
        message: `mkdir: cannot create directory '${args[0]}': File exists`
      };
    }
    
    // Criar o diretório
    fsState.files[newDirPath] = { type: 'dir' };
    
    return {
      success: true,
      message: ''
    };
  },
  
  // Criar arquivo vazio
  touch: (args, fs) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'touch: missing file operand'
      };
    }
    
    const newFilePath = normalizePath(args[0], fs.currentDir);
    
    // Criar ou atualizar timestamp
    fsState.files[newFilePath] = fsState.files[newFilePath] || { type: 'file', content: '' };
    
    return {
      success: true,
      message: ''
    };
  },
  
  // Remover arquivo ou diretório vazio
  rm: (args, fs) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'rm: missing operand'
      };
    }
    
    const isRecursive = args.includes('-r') || args.includes('-rf');
    const fileArgs = args.filter(arg => !arg.startsWith('-'));
    
    if (fileArgs.length === 0) {
      return {
        success: false,
        message: 'rm: missing operand'
      };
    }
    
    const targetPath = normalizePath(fileArgs[0], fs.currentDir);
    
    // Verificar se existe
    if (!fs.files[targetPath]) {
      return {
        success: false,
        message: `rm: cannot remove '${fileArgs[0]}': No such file or directory`
      };
    }
    
    // Verificar se é diretório e precisa de -r
    if (fs.files[targetPath].type === 'dir' && !isRecursive) {
      return {
        success: false,
        message: `rm: cannot remove '${fileArgs[0]}': Is a directory`
      };
    }
    
    // Remover do sistema de arquivos
    delete fsState.files[targetPath];
    
    // Caso seja recursivo, remover subdiretórios e arquivos
    if (isRecursive) {
      Object.keys(fs.files).forEach(path => {
        if (path.startsWith(`${targetPath}/`)) {
          delete fsState.files[path];
        }
      });
    }
    
    return {
      success: true,
      message: ''
    };
  },
  
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
  grep: (args, fs) => {
    if (args.length < 2) {
      return {
        success: false,
        message: 'grep: padrão de busca e arquivo necessários'
      };
    }

    const pattern = args[0];
    const filePath = normalizePath(args[1], fs.currentDir);

    // Verificar se arquivo existe
    if (!fs.files[filePath]) {
      return {
        success: false,
        message: `grep: ${args[1]}: No such file or directory`
      };
    }

    if (fs.files[filePath].type !== 'file') {
      return {
        success: false,
        message: `grep: ${args[1]}: Is a directory`
      };
    }

    const content = fs.files[filePath].content || '';
    
    // Buscar linhas que contenham o padrão
    const lines = content.split('\n');
    const matchingLines = lines.filter(line => 
      line.includes(pattern)
    );

    if (matchingLines.length === 0) {
      return {
        success: true,
        message: '' // grep não retorna mensagem quando não encontra nada
      };
    }

    return {
      success: true,
      message: matchingLines.join('\n')
    };
  },

  // Find - procurar arquivos
  find: (args, fs) => {
    const path = args.length > 0 ? normalizePath(args[0], fs.currentDir) : fs.currentDir;
    
    // Verificar se o diretório existe
    if (!fs.files[path]) {
      return {
        success: false,
        message: `find: '${path}': No such file or directory`
      };
    }

    // Encontrar todos os arquivos a partir do caminho especificado
    const results = Object.keys(fs.files)
      .filter(filePath => filePath.startsWith(path + '/') || filePath === path)
      .sort();

    return {
      success: true,
      message: results.join('\n')
    };
  },

  // Diff - comparar arquivos
  diff: (args, fs) => {
    if (args.length < 2) {
      return {
        success: false,
        message: 'diff: missing operand after `diff`'
      };
    }

    const file1Path = normalizePath(args[0], fs.currentDir);
    const file2Path = normalizePath(args[1], fs.currentDir);

    // Verificar se ambos os arquivos existem
    if (!fs.files[file1Path]) {
      return {
        success: false,
        message: `diff: ${args[0]}: No such file or directory`
      };
    }

    if (!fs.files[file2Path]) {
      return {
        success: false,
        message: `diff: ${args[1]}: No such file or directory`
      };
    }

    // Verificar se ambos são arquivos
    if (fs.files[file1Path].type !== 'file') {
      return {
        success: false,
        message: `diff: ${args[0]}: Is a directory`
      };
    }

    if (fs.files[file2Path].type !== 'file') {
      return {
        success: false,
        message: `diff: ${args[1]}: Is a directory`
      };
    }

    const content1 = fs.files[file1Path].content || '';
    const content2 = fs.files[file2Path].content || '';

    if (content1 === content2) {
      return {
        success: true,
        message: '' // diff não exibe nada se os arquivos forem iguais
      };
    }

    // Implementação simplificada de diff
    const lines1 = content1.split('\n');
    const lines2 = content2.split('\n');
    
    let message = `--- ${args[0]}\n+++ ${args[1]}\n`;
    
    for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
      if (i >= lines1.length) {
        message += `+${lines2[i]}\n`;
      } else if (i >= lines2.length) {
        message += `-${lines1[i]}\n`;
      } else if (lines1[i] !== lines2[i]) {
        message += `-${lines1[i]}\n+${lines2[i]}\n`;
      }
    }

    return {
      success: true,
      message: message
    };
  },

  // Less - visualizador de arquivo com paginação
  less: (args, fs) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'less: missing file operand'
      };
    }

    const filePath = normalizePath(args[0], fs.currentDir);

    // Verificar se o arquivo existe
    if (!fs.files[filePath]) {
      return {
        success: false,
        message: `less: ${args[0]}: No such file or directory`
      };
    }

    if (fs.files[filePath].type !== 'file') {
      return {
        success: false,
        message: `less: ${args[0]}: Is a directory`
      };
    }

    // Simulação simplificada de less
    return {
      success: true,
      message: fs.files[filePath].content || ''
    };
  },

  // More - visualizador de arquivo básico (versão antiga do less)
  more: (args, fs) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'more: missing file operand'
      };
    }

    const filePath = normalizePath(args[0], fs.currentDir);

    // Verificar se o arquivo existe
    if (!fs.files[filePath]) {
      return {
        success: false,
        message: `more: ${args[0]}: No such file or directory`
      };
    }

    if (fs.files[filePath].type !== 'file') {
      return {
        success: false,
        message: `more: ${args[0]}: Is a directory`
      };
    }

    // Simulação simplificada de more
    return {
      success: true,
      message: fs.files[filePath].content || ''
    };
  },

  // Head - mostrar o início de um arquivo
  head: (args, fs) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'head: missing file operand'
      };
    }

    let numLines = 10; // Padrão: 10 linhas
    let fileArg = args[0];

    // Verificar se tem opção -n
    if (args[0] === '-n' && args.length > 2) {
      numLines = parseInt(args[1], 10);
      fileArg = args[2];

      if (isNaN(numLines)) {
        return {
          success: false,
          message: `head: invalid number of lines: '${args[1]}'`
        };
      }
    }

    const filePath = normalizePath(fileArg, fs.currentDir);

    // Verificar se o arquivo existe
    if (!fs.files[filePath]) {
      return {
        success: false,
        message: `head: ${fileArg}: No such file or directory`
      };
    }

    if (fs.files[filePath].type !== 'file') {
      return {
        success: false,
        message: `head: ${fileArg}: Is a directory`
      };
    }

    const content = fs.files[filePath].content || '';
    const lines = content.split('\n');
    
    return {
      success: true,
      message: lines.slice(0, numLines).join('\n')
    };
  },

  // Tail - mostrar o final de um arquivo
  tail: (args, fs) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'tail: missing file operand'
      };
    }

    let numLines = 10; // Padrão: 10 linhas
    let fileArg = args[0];

    // Verificar se tem opção -n
    if (args[0] === '-n' && args.length > 2) {
      numLines = parseInt(args[1], 10);
      fileArg = args[2];

      if (isNaN(numLines)) {
        return {
          success: false,
          message: `tail: invalid number of lines: '${args[1]}'`
        };
      }
    }

    const filePath = normalizePath(fileArg, fs.currentDir);

    // Verificar se o arquivo existe
    if (!fs.files[filePath]) {
      return {
        success: false,
        message: `tail: ${fileArg}: No such file or directory`
      };
    }

    if (fs.files[filePath].type !== 'file') {
      return {
        success: false,
        message: `tail: ${fileArg}: Is a directory`
      };
    }

    const content = fs.files[filePath].content || '';
    const lines = content.split('\n');
    
    return {
      success: true,
      message: lines.slice(-numLines).join('\n')
    };
  },

  // Vimdiff - comparar e editar arquivos lado a lado (versão simplificada)
  vimdiff: (args, fs) => {
    if (args.length < 2) {
      return {
        success: false,
        message: 'vimdiff: 2 ou mais arquivos necessários'
      };
    }

    const file1Path = normalizePath(args[0], fs.currentDir);
    const file2Path = normalizePath(args[1], fs.currentDir);

    // Verificar se ambos os arquivos existem
    if (!fs.files[file1Path]) {
      return {
        success: false,
        message: `vimdiff: ${args[0]}: No such file or directory`
      };
    }

    if (!fs.files[file2Path]) {
      return {
        success: false,
        message: `vimdiff: ${args[1]}: No such file or directory`
      };
    }

    // Verificar se ambos são arquivos
    if (fs.files[file1Path].type !== 'file') {
      return {
        success: false,
        message: `vimdiff: ${args[0]}: Is a directory`
      };
    }

    if (fs.files[file2Path].type !== 'file') {
      return {
        success: false,
        message: `vimdiff: ${args[1]}: Is a directory`
      };
    }

    // Versão simplificada do vimdiff (apenas exibe as diferenças)
    const content1 = fs.files[file1Path].content || '';
    const content2 = fs.files[file2Path].content || '';

    if (content1 === content2) {
      return {
        success: true,
        message: `No differences detected between ${args[0]} and ${args[1]}`
      };
    }

    // Implementação simplificada de visualização de diferenças
    const lines1 = content1.split('\n');
    const lines2 = content2.split('\n');
    
    let message = `Vimdiff visualização:\n\n`;
    message += `${args[0]} | ${args[1]}\n`;
    message += `-----------------\n`;
    
    for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
      const line1 = i < lines1.length ? lines1[i] : '';
      const line2 = i < lines2.length ? lines2[i] : '';
      
      if (line1 === line2) {
        message += `${line1} | ${line2}\n`;
      } else {
        message += `${line1} | ${line2} (diferente)\n`;
      }
    }

    return {
      success: true,
      message: message
    };
  }
};

// Função para processar comandos shell
export const processShellCommand = (commandLine: string): CommandResult => {
  const parts = commandLine.split(' ').filter(p => p.trim() !== '');
  
  if (parts.length === 0) {
    return {
      success: true,
      message: ''
    };
  }
  
  const command = parts[0];
  const args = parts.slice(1);
  
  // Verificar se o comando existe
  if (!shellCommandHandlers[command]) {
    return {
      success: false,
      message: `${command}: comando não encontrado`
    };
  }
  
  // Executar o comando
  return shellCommandHandlers[command](args, fsState);
}; 