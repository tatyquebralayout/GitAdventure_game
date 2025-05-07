import { World } from '../../entities/World';
import { PlayerWorld } from '../../entities/PlayerWorld';
import { ModuleTheme, WorldDifficulty } from '@shared/types';

export interface WorldProgress {
  completedQuests: number;
  totalQuests: number;
  score: number;
  isComplete: boolean;
}

export interface WorldFilters {
  theme?: ModuleTheme;
  difficulty?: WorldDifficulty;
  searchTerm?: string;
  includeProgress?: boolean;
}

export interface IWorldService {
  /**
   * Get all available worlds with optional filtering
   */
  getAllWorlds(filters?: WorldFilters): Promise<World[]>;

  /**
   * Get a specific world by ID
   */
  getWorldById(worldId: string): Promise<World | null>;

  /**
   * Get worlds filtered by theme
   */
  getWorldsByTheme(theme: ModuleTheme): Promise<World[]>;

  /**
   * Get a user's progress in a specific world
   */
  getUserWorldProgress(userId: string, worldId: string): Promise<PlayerWorld | null>;

  /**
   * Start a world for a user
   */
  startWorld(userId: string, worldId: string): Promise<PlayerWorld>;

  /**
   * Get all active worlds for a user
   */
  getUserActiveWorlds(userId: string): Promise<PlayerWorld[]>;

  /**
   * Calculate world completion progress
   */
  calculateWorldProgress(worldId: string, userId: string): Promise<WorldProgress>;

  /**
   * Get recommended next worlds for a user based on their progress
   */
  getRecommendedWorlds(userId: string, limit?: number): Promise<World[]>;

  /**
   * Check if a user has completed prerequisites for a world
   */
  checkWorldPrerequisites(userId: string, worldId: string): Promise<{
    canStart: boolean;
    missingPrerequisites?: string[];
  }>;
}