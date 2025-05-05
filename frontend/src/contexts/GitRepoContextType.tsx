// Tipos para o contexto
import { GitCommit, GitStatus, GitRepositoryState } from '../types/git';

export interface GitRepoContextType extends Omit<GitRepositoryState, 'remotes'> { // Omit remotes if not directly managed here
  executeCommand: (command: string) => Promise<{ success: boolean; message: string }>;
}

// Estado inicial
export const initialGitRepoState: GitRepoContextType = {
  currentBranch: 'main',
  branches: [{ name: 'main', isActive: true, isRemote: false }], // Use GitBranch type
  commits: [], // Use GitCommit type
  status: {
    staged: [],
    modified: [],
    untracked: []
  },
  // remotes: [], // Initialize if needed
  executeCommand: async () => ({ success: false, message: 'Git repository not initialized' })
};