import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Quest } from './Quest';

// Tipo para status da narrativa
export type NarrativeStatus = 'starting' | 'ongoing' | 'completed';

@Entity('quest_narratives')
export class QuestNarrative {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'quest_id' })
  questId!: string;

  @Column({ 
    type: 'text',
    enum: ['starting', 'ongoing', 'completed'] 
  })
  status!: NarrativeStatus;

  @Column({ type: 'text' })
  context!: string;

  // Relacionamentos
  @ManyToOne(() => Quest, quest => quest.narratives)
  @JoinColumn({ name: 'quest_id' })
  quest!: Quest;
} 