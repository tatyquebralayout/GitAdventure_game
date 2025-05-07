import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PlayerWorldsQuest } from './PlayerWorldsQuest';
import { QuestCommandStep } from './QuestCommandStep';
import { StepStatus } from '../../../shared/types/enums';

@Entity('player_quest_steps')
export class PlayerQuestStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'player_worlds_quests_id' })
  playerWorldsQuestsId: string;

  @Column({ name: 'quest_command_step_id' })
  questCommandStepId: string;

  @Column({ 
    type: 'text',
    enum: StepStatus,
    default: StepStatus.PENDING
  })
  status: StepStatus;

  @Column({ name: 'start_time', type: 'timestamptz', nullable: true })
  startTime: Date | null;

  @Column({ name: 'time_spent', type: 'integer', default: 0 })
  timeSpent: number;

  @Column({ type: 'integer', default: 0 })
  attempts: number;

  @Column({ name: 'failed_attempts', type: 'jsonb', default: '[]' })
  failedAttempts: Array<{
    command: string;
    timestamp: Date;
    error?: string;
  }>;

  @Column({ type: 'integer', default: 0 })
  score: number;

  @Column({ name: 'bonus_points', type: 'integer', default: 0 })
  bonusPoints: number;

  @Column({ name: 'executed_at', type: 'timestamptz', nullable: true })
  executedAt: Date | null;

  // Relacionamentos
  @ManyToOne(() => PlayerWorldsQuest, playerQuest => playerQuest.steps)
  @JoinColumn({ name: 'player_worlds_quests_id' })
  playerWorldsQuest: PlayerWorldsQuest;

  @ManyToOne(() => QuestCommandStep, commandStep => commandStep.playerSteps)
  @JoinColumn({ name: 'quest_command_step_id' })
  questCommandStep: QuestCommandStep;
}