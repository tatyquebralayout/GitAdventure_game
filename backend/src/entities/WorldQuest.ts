import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { World } from './World';
import { Quest } from './Quest';

@Entity('world_quests')
export class WorldQuest {
  @PrimaryColumn({ name: 'world_id' })
  worldId!: string;

  @PrimaryColumn({ name: 'quest_id' })
  questId!: string;

  @Column({ name: 'display_order' })
  displayOrder!: number;

  // Relacionamentos
  @ManyToOne(() => World, world => world.worldQuests)
  @JoinColumn({ name: 'world_id' })
  world!: World;

  @ManyToOne(() => Quest, quest => quest.worldQuests)
  @JoinColumn({ name: 'quest_id' })
  quest!: Quest;
} 