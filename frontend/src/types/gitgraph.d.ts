// Declaração de tipos para o @gitgraph/react
// Isso evita erros como 'Property branch does not exist on type {}'

declare module '@gitgraph/react' {
  interface GitgraphBranchOptions {
    name: string;
    style?: {
      color?: string;
      lineWidth?: number;
      // Adicione outras opções de estilo conforme necessário
    };
  }

  interface GitgraphCommitOptions {
    subject?: string;
    hash?: string;
    author?: string;
    // Adicione outras opções conforme necessário
  }

  interface GitgraphMergeOptions {
    branch: GitgraphBranch;
    subject?: string;
    commitOptions?: GitgraphCommitOptions;
  }

  interface GitgraphBranch {
    branch: (name: string, options?: GitgraphBranchOptions) => GitgraphBranch;
    commit: (options?: GitgraphCommitOptions) => GitgraphBranch;
    merge: (options: GitgraphMergeOptions) => GitgraphBranch;
    checkout: () => GitgraphBranch;
    // Adicione outros métodos do branch conforme necessário
  }

  interface GitgraphInterface {
    branch: (name: string, options?: GitgraphBranchOptions) => GitgraphBranch;
    checkout: (branchName: string) => void;
    // Adicione outros métodos conforme necessário
  }
  
  // Mantenha exportações existentes
  export { templateExtend, TemplateName };
}