import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Quest } from "./Quest";
import { PlayerQuestStep } from './PlayerQuestStep';

@Entity("quest_command_steps")
export class QuestCommandStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: "quest_id" })
  questId: string;

  @Column({ name: "step_number" })
  stepNumber: number;

  @Column({ name: "command_name" })
  commandName: string;

  @Column({ name: "command_regex" })
  commandRegex: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  hint: string | null;

  @Column({ name: "is_optional", default: false })
  isOptional: boolean;

  @Column({ name: 'expected_pattern', type: 'text' })
  expectedPattern: string;

  @Column({ name: 'success_message', type: 'text' })
  successMessage: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => Quest, quest => quest.commandSteps)
  @JoinColumn({ name: "quest_id" })
  quest: Quest;

  @OneToMany(() => PlayerQuestStep, playerStep => playerStep.questCommandStep)
  playerSteps: PlayerQuestStep[];
}