import React, { useState, ReactNode } from 'react';
import { GitRepositoryContext, GitRepositoryContextType, initialRepositoryState } from './GitRepositoryContext';

interface GitRepositoryProviderProps {
  children: ReactNode;
}

// Componente Provider
export const GitRepositoryProvider: React.FC<GitRepositoryProviderProps> = ({ children }) => {
  const [repository, setRepository] = useState(initialRepositoryState);

  // Implementar a lógica para executar comandos Git
  const executeCommand = async (command: string): Promise<{ success: boolean; message: string }> => {
    // Dividir o comando para processamento
    const parts = command.split(' ').filter(part => part.trim() !== '');
    
    // Verificar se é um comando Git
    if (parts[0] !== 'git') {
      return { 
        success: false, 
        message: 'Not a git command' 
      };
    }
    
    const gitCommand = parts[1];
    
    // Implementar comandos básicos do Git
    switch (gitCommand) {
      case 'init':
        return handleGitInit();
      case 'status':
        return handleGitStatus();
      case 'add':
        return handleGitAdd(parts.slice(2));
      case 'commit':
        return handleGitCommit(parts.slice(2));
      case 'branch':
        return handleGitBranch(parts.slice(2));
      case 'checkout':
        return handleGitCheckout(parts.slice(2));
      case 'log':
        return handleGitLog();
      default:
        return {
          success: false,
          message: `Git command not implemented: ${gitCommand}`
        };
    }
  };
  
  // Implementação de comandos Git
  
  const handleGitInit = () => {
    setRepository((prev: typeof initialRepositoryState) => ({
      ...prev,
      currentBranch: 'main',
      branches: ['main'],
      commits: [],
      status: {
        staged: [],
        modified: [],
        untracked: ['README.md', 'app.js']
      }
    }));
    
    return {
      success: true,
      message: 'Initialized empty Git repository'
    };
  };
  
  const handleGitStatus = () => {
    const { staged, modified, untracked } = repository.status;
    
    let message = `On branch ${repository.currentBranch}\n\n`;
    
    if (staged.length === 0 && modified.length === 0 && untracked.length === 0) {
      message += 'nothing to commit, working tree clean';
    } else {
      if (staged.length > 0) {
        message += 'Changes to be committed:\n';
        staged.forEach((file: string) => {
          message += `  (use "git restore --staged <file>..." to unstage)\n`;
          message += `        modified: ${file}\n`;
        });
        message += '\n';
      }
      
      if (modified.length > 0) {
        message += 'Changes not staged for commit:\n';
        modified.forEach((file: string) => {
          message += `  (use "git add <file>..." to update what will be committed)\n`;
          message += `  (use "git restore <file>..." to discard changes in working directory)\n`;
          message += `        modified: ${file}\n`;
        });
        message += '\n';
      }
      
      if (untracked.length > 0) {
        message += 'Untracked files:\n';
        message += `  (use "git add <file>..." to include in what will be committed)\n`;
        untracked.forEach((file: string) => {
          message += `        ${file}\n`;
        });
        message += '\n';
      }
    }
    
    return {
      success: true,
      message
    };
  };
  
  const handleGitAdd = (args: string[]) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'Nothing specified, nothing added.'
      };
    }
    
    // Implementação simples para adicionar arquivos
    let stagedFiles: string[] = [...repository.status.staged];
    let modifiedFiles: string[] = [...repository.status.modified];
    let untrackedFiles: string[] = [...repository.status.untracked];
    
    if (args[0] === '.') {
      // Adicionar todos os arquivos
      stagedFiles = [...stagedFiles, ...modifiedFiles, ...untrackedFiles];
      modifiedFiles = [];
      untrackedFiles = [];
    } else {
      // Adicionar arquivos específicos
      args.forEach(file => {
        if (modifiedFiles.includes(file)) {
          modifiedFiles = modifiedFiles.filter(f => f !== file);
          if (!stagedFiles.includes(file)) {
            stagedFiles.push(file);
          }
        } else if (untrackedFiles.includes(file)) {
          untrackedFiles = untrackedFiles.filter(f => f !== file);
          if (!stagedFiles.includes(file)) {
            stagedFiles.push(file);
          }
        }
      });
    }
    
    setRepository((prev: typeof initialRepositoryState) => ({
      ...prev,
      status: {
        staged: stagedFiles,
        modified: modifiedFiles,
        untracked: untrackedFiles
      }
    }));
    
    return {
      success: true,
      message: `Added ${args.join(', ')} to staging area`
    };
  };
  
  const handleGitCommit = (args: string[]) => {
    if (repository.status.staged.length === 0) {
      return {
        success: false,
        message: 'nothing to commit, working tree clean'
      };
    }
    
    // Verificar mensagem de commit
    const messageIndex = args.indexOf('-m');
    if (messageIndex === -1 || messageIndex === args.length - 1) {
      return {
        success: false,
        message: 'error: switch `m` requires a value'
      };
    }
    
    const commitMessage = args[messageIndex + 1];
    
    // Criar novo commit
    const newCommit = {
      hash: generateFakeHash(),
      message: commitMessage,
      author: 'Git Adventure User <user@git-adventure.com>',
      date: new Date()
    };
    
    // Atualizar estado
    setRepository((prev: typeof initialRepositoryState) => ({
      ...prev,
      commits: [newCommit, ...prev.commits],
      status: {
        ...prev.status,
        staged: [] // Limpar área de staging
      }
    }));
    
    return {
      success: true,
      message: `[${repository.currentBranch} ${newCommit.hash.substring(0, 7)}] ${commitMessage}`
    };
  };
  
  const handleGitBranch = (args: string[]) => {
    if (args.length === 0) {
      // Listar branches
      const branchList = repository.branches.map((branch: string) => 
        branch === repository.currentBranch ? `* ${branch}` : `  ${branch}`
      ).join('\n');
      
      return {
        success: true,
        message: branchList
      };
    } else {
      // Criar nova branch
      const newBranch = args[0];
      
      if (repository.branches.includes(newBranch)) {
        return {
          success: false,
          message: `fatal: a branch named '${newBranch}' already exists`
        };
      }
      
      setRepository((prev: typeof initialRepositoryState) => ({
        ...prev,
        branches: [...prev.branches, newBranch]
      }));
      
      return {
        success: true,
        message: `Created branch ${newBranch}`
      };
    }
  };
  
  const handleGitCheckout = (args: string[]) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'error: you must specify a branch name'
      };
    }
    
    const targetBranch = args[0];
    
    // Verificar se a branch existe
    if (!repository.branches.includes(targetBranch)) {
      // Verificar se é para criar uma nova branch
      if (args.includes('-b')) {
        setRepository((prev: typeof initialRepositoryState) => ({
          ...prev,
          currentBranch: targetBranch,
          branches: [...prev.branches, targetBranch]
        }));
        
        return {
          success: true,
          message: `Switched to a new branch '${targetBranch}'`
        };
      }
      
      return {
        success: false,
        message: `error: pathspec '${targetBranch}' did not match any file(s) known to git`
      };
    }
    
    // Mudar para a branch especificada
    setRepository((prev: typeof initialRepositoryState) => ({
      ...prev,
      currentBranch: targetBranch
    }));
    
    return {
      success: true,
      message: `Switched to branch '${targetBranch}'`
    };
  };
  
  const handleGitLog = () => {
    if (repository.commits.length === 0) {
      return {
        success: true,
        message: 'No commits yet'
      };
    }
    
    const logOutput = repository.commits.map((commit: {hash: string; author: string; date: Date; message: string}) => {
      const dateStr = commit.date.toISOString();
      return `commit ${commit.hash}\nAuthor: ${commit.author}\nDate: ${dateStr}\n\n    ${commit.message}\n`;
    }).join('\n');
    
    return {
      success: true,
      message: logOutput
    };
  };
  
  // Função auxiliar para gerar hash de commit
  const generateFakeHash = () => {
    const chars = 'abcdef0123456789';
    let hash = '';
    for (let i = 0; i < 40; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };
  
  // Valor provido pelo contexto
  const contextValue: GitRepositoryContextType = {
    executeCommand,
    currentBranch: repository.currentBranch,
    branches: repository.branches,
    commits: repository.commits,
    status: repository.status
  };
  
  return (
    <GitRepositoryContext.Provider value={contextValue}>
      {children}
    </GitRepositoryContext.Provider>
  );
}; 