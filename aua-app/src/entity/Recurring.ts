import { Column, PrimaryColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity()
export class Recurring {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ default: () => `now()` })
  createdAt?: Date;

  @Column()
  nameTemplate: string;

  @Column('uuid')
  taskTemplateId: string;

  @Column('uuid')
  portfolioId: string;

  @Column({nullable: true})
  cron: string;

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

  @UpdateDateColumn()
  lastUpdatedAt: Date;
}


