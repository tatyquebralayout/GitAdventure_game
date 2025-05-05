import { createContext } from 'react';
import { GitCommit, GitBranch, GitStatus } from '../types/git'; // Importar tipos unificados

interface GitRepository {
  executeCommand: (command: string) => Promise<{ success: boolean; message: string }>;
  currentBranch: string;
  branches: GitBranch[]; // Usar tipo unificado
  commits: GitCommit[]; // Usar tipo unificado
  status: GitStatus; // Usar tipo unificado
}

export interface GitRepositoryContextType {
  executeCommand: (command: string) => Promise<{ success: boolean; message: string }>;
  currentBranch: string;
  branches: GitBranch[]; // Usar tipo unificado
  commits: GitCommit[]; // Usar tipo unificado
  status: GitStatus; // Usar tipo unificado
}

// Estado inicial do repositório
export const initialRepositoryState: GitRepository = {
  executeCommand: async () => ({ success: false, message: 'Git repository not initialized' }), 
  currentBranch: 'main',
//  branches: ['main'], // Ajustar para o novo tipo GitBranch[]
  branches: [{ name: 'main', commits: [], isActive: true }], // Ajustado
  commits: [],
  status: {
    staged: [],
    modified: [],
    untracked: []
  }
};

// Criar o contexto
export const GitRepositoryContext = createContext<GitRepositoryContextType>(initialRepositoryState); 