import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Quest } from './Quest';
import { Module } from './Module';

@Entity('quest_modules')
export class QuestModule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quest_id' })
  questId: string;

  @Column({ name: 'module_id' })
  moduleId: string;

  // Relacionamentos
  @ManyToOne(() => Quest, quest => quest.questModules)
  @JoinColumn({ name: 'quest_id' })
  quest: Quest;

  @ManyToOne(() => Module, module => module.questModules)
  @JoinColumn({ name: 'module_id' })
  module: Module;
}