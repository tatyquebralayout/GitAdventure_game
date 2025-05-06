import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { Quest } from "./Quest";

@Entity("user_progress")
export class UserProgress {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "user_id" })
  userId: string;

  @Column({ name: "quest_id" })
  questId: string;

  @Column({ name: "current_step", default: 1 })
  currentStep: number;

  @Column({ name: "is_completed", default: false })
  isCompleted: boolean;

  @Column({ name: "completed_at", type: "timestamptz", nullable: true })
  completedAt: Date | null;

  @Column({ name: "start_time", type: "timestamptz" })
  startTime: Date;

  @Column({ name: "time_spent", type: "integer", default: 0 })
  timeSpent: number;

  @Column({ type: "integer", default: 0 })
  attempts: number;

  @Column({ type: "integer", default: 0 })
  score: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.progress)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Quest)
  @JoinColumn({ name: "quest_id" })
  quest: Quest;
}