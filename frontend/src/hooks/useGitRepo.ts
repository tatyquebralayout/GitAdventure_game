import { useContext } from 'react';
import { GitRepoContext } from '../contexts/GitRepoContext';

// Hook para acessar o GitRepoContext
export function useGitRepo() {
  const context = useContext(GitRepoContext);
  if (!context) {
    throw new Error('useGitRepo must be used within a GitRepoProvider');
  }
  return context;
}