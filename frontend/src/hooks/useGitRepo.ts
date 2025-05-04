import { useContext } from 'react';
// Correct the import path for GitRepoContext
import { GitRepoContext } from '../contexts/GitRepoContextTypes';

// Hook para acessar o GitRepoContext
export function useGitRepo() {
  const context = useContext(GitRepoContext);
  if (!context) {
    throw new Error('useGitRepo must be used within a GitRepoProvider');
  }
  return context;
}