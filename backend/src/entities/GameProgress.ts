import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("game_progress")
export class GameProgress {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "user_id" })
  userId!: string;
  
  @Column({ name: "save_slot" })
  saveSlot!: number;
  
  @Column({ name: "save_name" })
  saveName!: string;
  
  @Column("jsonb")
  gameState!: object;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}