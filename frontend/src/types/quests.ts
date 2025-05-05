// Interface para Quest (unificada)
export interface Quest {
  id: string; // Padronizado para string
  name: string;
  title?: string; // Adicionado de questsApi
  description: string;
  imageUrl?: string; // Adicionado de questsApi
  difficulty?: number; // Adicionado de questsApi
  xpReward?: number; // Adicionado de questsApi
  type?: string; // Mantido de questApi
  parentQuestId?: string | null; // Mantido de questApi
  commandSteps?: QuestCommandStep[]; // Mantido de questsApi
  createdAt: Date;
  updatedAt: Date;
}

// Interface para QuestCommandStep (unificada)
export interface QuestCommandStep {
  id: string; // Padronizado para string
  questId: string; // Padronizado para string
  stepNumber: number;
  commandName: string;
  commandRegex: string;
  description: string;
  hint?: string;
  isOptional: boolean;
  expectedPattern?: string; // Mantido de questApi
  successMessage?: string; // Mantido de questApi
  createdAt?: Date; // Adicionado de questsApi (opcional?)
  updatedAt?: Date; // Adicionado de questsApi (opcional?)
}

// Interface para QuestNarrative (mantida de questApi)
export interface QuestNarrative {
  id: string;
  questId: string;
  status: 'starting' | 'ongoing' | 'completed';
  context: string;
}

// Interface para PlayerWorldsQuest (mantida de questApi, renomeada?)
// Ou talvez UserProgress de questsApi seja mais adequado?
// Vamos manter PlayerWorldsQuest por enquanto, mas pode precisar de revisão
export interface PlayerWorldsQuest {
  id: string;
  playerWorldId: string; // Específico de questApi
  questId: string;
  status: 'starting' | 'ongoing' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// Interface para UserProgress (mantida de questsApi)
// Pode sobrepor ou complementar PlayerWorldsQuest
export interface UserProgress {
  id: string; // Padronizado para string
  userId: string; // Manter como string por enquanto
  questId: string; // Padronizado para string
  currentStep: number;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  quest?: Quest; // Relacionamento
} 