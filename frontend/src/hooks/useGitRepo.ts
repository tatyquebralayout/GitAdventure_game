import { useGitRepoContext } from '../contexts/GitRepoContext';

/**
 * Hook para usar o GitRepoContext
 * @returns O contexto do repositório Git
 */
export const useGitRepo = () => useGitRepoContext();