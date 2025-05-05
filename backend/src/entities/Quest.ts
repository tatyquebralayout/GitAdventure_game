import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { QuestModule } from './QuestModule';
import { QuestNarrative } from './QuestNarrative';
import { WorldQuest } from './WorldQuest';
import { QuestCommandStep } from './QuestCommandStep';
import { PlayerWorldsQuest } from './PlayerWorldsQuest';

@Entity('quests')
export class Quest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'text' })
  type!: string;

  @Column({ name: 'parent_quest_id', nullable: true })
  parentQuestId!: string | null;

  // Auto-relacionamento (sub-quests)
  @ManyToOne(() => Quest, quest => quest.childQuests)
  @JoinColumn({ name: 'parent_quest_id' })
  parentQuest!: Quest | null;

  @OneToMany(() => Quest, quest => quest.parentQuest)
  childQuests!: Quest[];

  // Outros relacionamentos
  @OneToMany(() => QuestModule, questModule => questModule.quest)
  questModules!: QuestModule[];

  @OneToMany(() => QuestNarrative, narrative => narrative.quest)
  narratives!: QuestNarrative[];

  @OneToMany(() => WorldQuest, worldQuest => worldQuest.quest)
  worldQuests!: WorldQuest[];

  @OneToMany(() => QuestCommandStep, step => step.quest)
  commandSteps!: QuestCommandStep[];

  @OneToMany(() => PlayerWorldsQuest, playerQuest => playerQuest.quest)
  playerQuests!: PlayerWorldsQuest[];
}