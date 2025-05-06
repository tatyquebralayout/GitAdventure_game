import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PlayerWorldsQuest } from './PlayerWorldsQuest';
import { QuestCommandStep } from './QuestCommandStep';

// Tipo para status do passo do comando
export type PlayerStepStatus = 'pending' | 'completed';

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
    enum: ['pending', 'completed'],
    default: 'pending'
  })
  status: PlayerStepStatus;

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