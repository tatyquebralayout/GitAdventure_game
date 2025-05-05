// Interface para o mundo
export interface World {
  id: string;
  name: string;
  description: string;
  slug: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'review' | 'published';
  // Poderíamos adicionar outras propriedades como createdAt, updatedAt, etc., se necessário
}

// Interface para o progresso do jogador em um mundo
export interface PlayerWorld {
  id: string;
  userId: string; // Padronizar para string
  worldId: string;
  status: 'started' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  // Poderíamos adicionar um relacionamento com World aqui: world?: World;
} 