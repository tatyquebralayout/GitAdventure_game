import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { QuestCommandStep } from "./QuestCommandStep";

@Entity("quests")
export class Quest {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ default: 1 })
  difficulty!: number;

  @Column({ default: 0 })
  xpReward!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => QuestCommandStep, step => step.quest)
  commandSteps!: QuestCommandStep[];
}