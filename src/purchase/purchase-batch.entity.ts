import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity('purchase_batches')
  export class PurchaseBatchEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column({ type: 'date' })
    purchasedOn: string;
  
    @Column({ type: 'text', nullable: true })
    title: string | null;
  
    @Column({ type: 'text', nullable: true })
    notes: string | null;
  
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
  }
  