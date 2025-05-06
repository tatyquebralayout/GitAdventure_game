import { createContext } from 'react';
import { GitRepositoryState } from '../types/git';

// Use GitRepositoryState for the context type structure, adding executeCommand
export interface GitRepositoryContextType extends GitRepositoryState {
  executeCommand: (command: string) => Promise<{ success: boolean; message: string }>;
}

// Estado inicial do repositório, conforming to GitRepositoryContextType
export const initialRepositoryState: GitRepositoryContextType = {
  executeCommand: async () => ({ success: false, message: 'Git repository not initialized' }),
  currentBranch: 'main',
  branches: [{ name: 'main', isActive: true, isRemote: false }], // Use GitBranch type correctly
  commits: [], // Use GitCommit type
  status: {
    staged: [],
    modified: [],
    untracked: []
  },
  remotes: [] // Initialize remotes array
};

// Criar o contexto
export const GitRepositoryContext = createContext<GitRepositoryContextType>(initialRepositoryState);