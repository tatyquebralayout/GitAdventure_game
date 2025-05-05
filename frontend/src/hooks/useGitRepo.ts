import { useContext } from 'react';
import { GitRepoContext } from '../contexts/GitRepoContextType';

/**
 * Hook para usar o GitRepoContext
 * @returns O contexto do repositório Git
 */
export const useGitRepo = () => useContext(GitRepoContext);