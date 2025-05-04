import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Quest } from "./Quest";

@Entity("quest_command_steps")
export class QuestCommandStep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "quest_id" })
  questId: number;

  @Column({ name: "step_number" })
  stepNumber: number;

  @Column({ name: "command_name" })
  commandName: string;

  @Column({ name: "command_regex" })
  commandRegex: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  hint?: string;

  @Column({ name: "is_optional", default: false })
  isOptional: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => Quest, quest => quest.commandSteps)
  @JoinColumn({ name: "quest_id" })
  quest: Quest;
}