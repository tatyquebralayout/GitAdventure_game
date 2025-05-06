import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { UserToken } from './UserToken';
import { PlayerWorld } from './PlayerWorld';
import { UserProgress } from './UserProgress'; // Import UserProgress

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: 'text', unique: true })
  username!: string;

  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ type: 'text', select: false })
  password!: string;

  @Column({ default: 0 })
  experience!: number;

  @Column({ default: 1 })
  level!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
  
  @OneToMany(() => UserToken, token => token.user)
  tokens!: UserToken[];

  @OneToMany(() => PlayerWorld, playerWorld => playerWorld.user)
  playerWorlds!: PlayerWorld[];

  @OneToMany(() => UserProgress, progress => progress.user)
  progress!: UserProgress[]; // This property was missing
}