import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { QuestModule } from './QuestModule';
import { ModuleTheme } from '../../../shared/types/enums';

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'text',
    enum: ModuleTheme,
    default: ModuleTheme.GENERAL
  })
  theme: ModuleTheme;

  @Column({ type: 'integer', default: 0 })
  order: number;

  @Column('uuid', { array: true, default: '{}' })
  prerequisites: string[];

  // Relacionamentos
  @OneToMany(() => QuestModule, questModule => questModule.module)
  questModules: QuestModule[];
}