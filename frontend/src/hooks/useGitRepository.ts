import { useContext } from 'react';
import { GitRepositoryContext } from '../contexts/GitRepositoryContext';

// Hook personalizado para uso do contexto
export const useGitRepository = () => {
  const context = useContext(GitRepositoryContext);
  
  if (!context) {
    throw new Error('useGitRepository deve ser usado dentro de um GitRepositoryProvider');
  }
  
  return context;
}; 