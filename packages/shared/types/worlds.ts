// filepath: f:\G\GitAdventurev2\shared\types\worlds.ts
// Interface para o mundo
export interface World {
  id: string;
  name: string;
  description?: string;
  difficulty: number;
  status: 'draft' | 'published' | 'archived';
}

// Interface para o progresso do jogador em um mundo
export interface PlayerWorld {
  id: string;
  userId: string;
  worldId: string;
  status: 'started' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
}