import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PlayerWorld } from './PlayerWorld';
import { Quest } from './Quest';
import { PlayerQuestStep } from './PlayerQuestStep';
import { QuestStatus } from '../../../shared/types/enums';

@Entity('player_worlds_quests')
export class PlayerWorldsQuest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'player_world_id' })
  playerWorldId: string;

  @Column({ name: 'quest_id' })
  questId: string;

  @Column({ 
    type: 'text',
    enum: QuestStatus,
    default: QuestStatus.NOT_STARTED
  })
  status: QuestStatus;

  @Column({ name: 'total_time', type: 'integer', default: 0 })
  totalTime: number;

  @Column({ name: 'total_attempts', type: 'integer', default: 0 })
  totalAttempts: number;

  @Column({ name: 'total_score', type: 'integer', default: 0 })
  totalScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => PlayerWorld, playerWorld => playerWorld.quests)
  @JoinColumn({ name: 'player_world_id' })
  playerWorld: PlayerWorld;

  @ManyToOne(() => Quest, quest => quest.playerQuests)
  @JoinColumn({ name: 'quest_id' })
  quest: Quest;

  @OneToMany(() => PlayerQuestStep, step => step.playerWorldsQuest)
  steps: PlayerQuestStep[];
}