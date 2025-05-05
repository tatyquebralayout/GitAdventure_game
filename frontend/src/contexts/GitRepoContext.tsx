import React, { ReactNode } from 'react';
import { useContext } from 'react';
import { GitRepositoryContext } from './GitRepositoryContext';
import { GitRepoContext, GitRepoContextType } from './GitRepoContextType';

// Criar o contexto
export const GitRepoContext = createContext<GitRepoContextType | null>(null);

// Hook para usar o contexto
export const useGitRepoContext = () => useContext(GitRepoContext);

interface GitRepoProviderProps {
  children: ReactNode;
}

export const GitRepoProvider: React.FC<GitRepoProviderProps> = ({ children }) => {
  // Usar o GitRepositoryContext internamente
  const gitRepositoryContext = useContext(GitRepositoryContext);
  
  // Criar um wrapper em torno do GitRepositoryContext
  const contextValue: GitRepoContextType = {
    currentBranch: gitRepositoryContext.currentBranch,
    branches: gitRepositoryContext.branches,
    commits: gitRepositoryContext.commits,
    status: gitRepositoryContext.status,
    executeCommand: gitRepositoryContext.executeCommand
  };

  return (
    <GitRepoContext.Provider value={contextValue}>
      {children}
    </GitRepoContext.Provider>
  );
};