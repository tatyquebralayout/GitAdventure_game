import { GameState } from '../stores/gameStore';

// Efeitos que um comando pode causar no estado do jogo
export interface CommandEffect {
  setLocation?: string;
  addToInventory?: string[];
  removeFromInventory?: string[];
  setFlag?: Record<string, boolean>;
}

// Resultado da execução de um comando
export interface CommandResult {
  success: boolean;
  message: string;
  effects?: CommandEffect;
}

// Informações passadas para o comando help
export interface HelpInfo {
  name: string;
  description?: string;
  helpText?: string;
}

// Interface unificada para um comando
export interface Command {
  name: string;
  description: string; // Descrição curta (obrigatória)
  aliases?: string[];
  // Assinatura de execute aceita dados extras opcionais (para help)
  execute: (args: string[], state: GameState, extraData?: HelpInfo[]) => CommandResult;
  help?: string; // Texto de ajuda mais detalhado (opcional)
  availability?: (state: GameState) => boolean; // Função para verificar disponibilidade (opcional)
  patterns?: RegExp[]; // Padrões Regex para matching alternativo (opcional, usado por helpCommand)
}