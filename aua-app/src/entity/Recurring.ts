import { Column, PrimaryColumn, Entity, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Recurring {
  @PrimaryColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUpdatedAt: Date;

  @Column()
  nameTemplate: string;

  @Column('uuid')
  taskTemplateId: string;

  @Column('uuid')
  portfolioId: string;

  @Column({nullable: true})
  dueDay: number;

  @Column({nullable: true})
  startFrom?: Date;
    
  @Column({nullable: true})
  every: number;
  
  @Column({nullable: true})
  period: 'day' | 'week' | 'month' | 'year';

  @Column({nullable: true})
  lastRunAt: Date;

  @Column({nullable: true})
  nextRunAt: Date;
}


