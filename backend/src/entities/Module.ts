import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { QuestModule } from './QuestModule';

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Relacionamentos
  @OneToMany(() => QuestModule, questModule => questModule.module)
  questModules: QuestModule[];
}