// filepath: f:\G\GitAdventurev2\shared\types\worlds.ts
// Interface para o mundo
export interface World {
  id: string;
  name: string;
  description: string;
  slug: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'review' | 'published';
}

// Interface para o progresso do jogador em um mundo
export interface PlayerWorld {
  id: string;
  userId: string;
  worldId: string;
  status: 'started' | 'completed';
  createdAt: Date; // Keep as Date for potential frontend use, backend might use string
  updatedAt: Date; // Keep as Date for potential frontend use, backend might use string
}