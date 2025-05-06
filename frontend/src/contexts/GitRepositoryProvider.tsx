import React, { useState, ReactNode } from 'react';
import { GitRepositoryContext, GitRepositoryContextType, initialRepositoryState } from './GitRepositoryContext';
import { GitBranch, GitCommit } from '../types/git';

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
    const mainBranch: GitBranch = { name: 'main', isActive: true, isRemote: false };
    
    setRepository((prev) => ({
      ...prev,
      currentBranch: 'main',
      branches: [mainBranch],
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
    
    setRepository((prev) => ({
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
    
    // Criar novo commit com a estrutura correta de GitCommit
    const newCommit: GitCommit = {
      id: generateFakeHash(),
      message: commitMessage,
      author: 'Git Adventure User <user@git-adventure.com>',
      date: new Date(),
      parents: repository.commits.length > 0 ? [repository.commits[0].id] : [],
      branch: repository.currentBranch
    };
    
    // Atualizar estado
    setRepository((prev) => ({
      ...prev,
      commits: [newCommit, ...prev.commits],
      status: {
        ...prev.status,
        staged: [] // Limpar área de staging
      }
    }));
    
    return {
      success: true,
      message: `[${repository.currentBranch} ${newCommit.id.substring(0, 7)}] ${commitMessage}`
    };
  };
  
  const handleGitBranch = (args: string[]) => {
    if (args.length === 0) {
      // Listar branches
      const branchList = repository.branches.map((branch: GitBranch) => 
        branch.name === repository.currentBranch ? `* ${branch.name}` : `  ${branch.name}`
      ).join('\n');
      
      return {
        success: true,
        message: branchList
      };
    } else {
      // Criar nova branch
      const newBranchName = args[0];
      
      // Check if branch already exists
      if (repository.branches.some(branch => branch.name === newBranchName)) {
        return {
          success: false,
          message: `fatal: a branch named '${newBranchName}' already exists`
        };
      }
      
      // Create new branch
      const newBranch: GitBranch = {
        name: newBranchName,
        isActive: false,
        isRemote: false
      };
      
      setRepository((prev) => ({
        ...prev,
        branches: [...prev.branches, newBranch]
      }));
      
      return {
        success: true,
        message: `Created branch ${newBranchName}`
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
    
    // Check if the branch exists
    const branchExists = repository.branches.some(branch => branch.name === targetBranch);
    
    if (!branchExists) {
      // Create a new branch if -b flag is present
      if (args.includes('-b')) {
        const newBranch: GitBranch = {
          name: targetBranch,
          isActive: true,
          isRemote: false
        };
        
        setRepository((prev) => ({
          ...prev,
          currentBranch: targetBranch,
          branches: prev.branches.map(branch => ({
            ...branch,
            isActive: false
          })).concat(newBranch)
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
    
    // Switch to the specified branch
    setRepository((prev) => ({
      ...prev,
      currentBranch: targetBranch,
      branches: prev.branches.map(branch => ({
        ...branch,
        isActive: branch.name === targetBranch
      }))
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
    
    const logOutput = repository.commits.map((commit: GitCommit) => {
      const dateStr = commit.date.toISOString();
      return `commit ${commit.id}\nAuthor: ${commit.author}\nDate: ${dateStr}\n\n    ${commit.message}\n`;
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
    status: repository.status,
    remotes: repository.remotes
  };
  
  return (
    <GitRepositoryContext.Provider value={contextValue}>
      {children}
    </GitRepositoryContext.Provider>
  );
};