import { createContext } from 'react';

interface GitRepository {
  executeCommand: (command: string) => Promise<{ success: boolean; message: string }>;
  currentBranch: string;
  branches: string[];
  commits: Array<{
    hash: string;
    message: string;
    author: string;
    date: Date;
  }>;
  status: {
    staged: string[];
    modified: string[];
    untracked: string[];
  };
}

export interface GitRepositoryContextType {
  executeCommand: (command: string) => Promise<{ success: boolean; message: string }>;
  currentBranch: string;
  branches: string[];
  commits: Array<{
    hash: string;
    message: string;
    author: string;
    date: Date;
  }>;
  status: {
    staged: string[];
    modified: string[];
    untracked: string[];
  };
}

// Estado inicial do repositório
export const initialRepositoryState: GitRepository = {
  executeCommand: async () => ({ success: false, message: 'Git repository not initialized' }), 
  currentBranch: 'main',
  branches: ['main'],
  commits: [],
  status: {
    staged: [],
    modified: [],
    untracked: []
  }
};

// Criar o contexto
export const GitRepositoryContext = createContext<GitRepositoryContextType>(initialRepositoryState); 