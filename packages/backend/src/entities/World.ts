import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { WorldQuest } from './WorldQuest';
import { PlayerWorld } from './PlayerWorld';
import { ModuleTheme, WorldDifficulty, WorldStatus } from '@shared/types';

@Entity('worlds')
export class World {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'text', unique: true })
  slug!: string;

  @Column({ 
    type: 'text',
    enum: Object.values(WorldDifficulty)
  })
  difficulty!: WorldDifficulty;

  @Column({ 
    type: 'text',
    enum: Object.values(WorldStatus)
  })
  status!: WorldStatus;

  @Column({
    type: 'text',
    enum: Object.values(ModuleTheme),
    default: ModuleTheme.GENERAL
  })
  theme!: ModuleTheme;

  // Relacionamentos
  @OneToMany(() => WorldQuest, worldQuest => worldQuest.world)
  worldQuests!: WorldQuest[];

  @OneToMany(() => PlayerWorld, playerWorld => playerWorld.world)
  playerWorlds!: PlayerWorld[];
}