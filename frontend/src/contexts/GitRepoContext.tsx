import React, { ReactNode, createContext } from 'react';
import { useContext } from 'react';
import { GitRepositoryContext } from './GitRepositoryContext';
import { GitRepoContextType } from './GitRepoContextType';

interface GitRepoProviderProps {
  children: ReactNode;
}

// Nós importamos o tipo mas criamos o contexto localmente
const GitRepoContext = createContext<GitRepoContextType | null>(null);

// Exportamos o hook para usar o contexto
export const useGitRepoContext = () => useContext(GitRepoContext);

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