export interface GitCommit {
  id: string; // Hash ou SHA do commit
  message: string;
  author: string;
  branch: string; // Nome do branch ao qual este commit pertence, no contexto da visualização
  parents: string[]; // IDs dos commits pais
  date: Date;
}

export interface GitBranch {
  name: string;
  commits: string[]; // Opcional: IDs dos commits neste branch. Pode ser removido se não for estritamente necessário.
  isActive: boolean; // Indica se é o branch atual (HEAD)
  // Podemos adicionar outras propriedades aqui se necessário, como color, etc.
}

export interface GitStatus {
  staged: string[];
  modified: string[];
  untracked: string[];
}

// Pode ser necessário adicionar outras interfaces conforme unificamos os tipos do projeto. 