// Tipos para o contexto
export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: Date;
}

export interface GitStatus {
  staged: string[];
  modified: string[];
  untracked: string[];
}

export interface GitRepoContextType {
  currentBranch: string;
  branches: string[];
  commits: GitCommit[];
  status: GitStatus;
  executeCommand: (command: string) => Promise<{ success: boolean; message: string }>;
}

// Estado inicial
export const initialGitRepoState: GitRepoContextType = {
  currentBranch: 'main',
  branches: ['main'],
  commits: [],
  status: {
    staged: [],
    modified: [],
    untracked: []
  },
  executeCommand: async () => ({ success: false, message: 'Git repository not initialized' })
}; 