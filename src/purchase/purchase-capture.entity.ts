import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('purchase_captures')
export class PurchaseCaptureEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  batchId: string;

  @Column({ type: 'text' })
  photoKey: string;

  @Column({ type: 'text' })
  photoMime: string;

  @Column({ type: 'text', default: 'draft' })
  status: 'draft' | 'finalized';

  @Column({ type: 'uuid', nullable: true })
  itemId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
