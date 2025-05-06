import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { WorldQuest } from './WorldQuest';
import { PlayerWorld } from './PlayerWorld';
import { ModuleTheme } from '../../../shared/types/enums';

// Tipo para dificuldade
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Tipo para status do mundo
export type WorldStatus = 'draft' | 'review' | 'published';

@Entity('worlds')
export class World {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', unique: true })
  slug: string;

  @Column({ 
    type: 'text',
    enum: ['beginner', 'intermediate', 'advanced'] 
  })
  difficulty: Difficulty;

  @Column({ 
    type: 'text',
    enum: ['draft', 'review', 'published'] 
  })
  status: WorldStatus;

  @Column({
    type: 'text',
    enum: Object.values(ModuleTheme),
    default: ModuleTheme.GENERAL
  })
  theme: ModuleTheme;

  // Relacionamentos
  @OneToMany(() => WorldQuest, worldQuest => worldQuest.world)
  worldQuests: WorldQuest[];

  @OneToMany(() => PlayerWorld, playerWorld => playerWorld.world)
  playerWorlds: PlayerWorld[];
}