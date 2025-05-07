import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { World } from './World';
import { PlayerWorldsQuest } from './PlayerWorldsQuest';

// Tipo de status do jogador em um mundo
export type PlayerWorldStatus = 'started' | 'completed';

@Entity('player_worlds')
export class PlayerWorld {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'world_id' })
  worldId: string;

  @Column({ 
    type: 'text',
    enum: ['started', 'completed'] 
  })
  status: PlayerWorldStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => User, user => user.playerWorlds)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => World, world => world.playerWorlds)
  @JoinColumn({ name: 'world_id' })
  world: World;

  @OneToMany(() => PlayerWorldsQuest, playerQuest => playerQuest.playerWorld)
  quests: PlayerWorldsQuest[];
}