import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

const numericTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity('items')
export class ItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column('numeric', {
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  costUnit: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'uuid', nullable: true })
  batchId: string | null;

  @Column({ type: 'uuid', nullable: true })
  captureId: string | null;

  @Column({ type: 'text', nullable: true })
  photoKey: string | null;

  @Column({ type: 'text', nullable: true })
  photoMime: string | null;

  @Column('numeric', {
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
    nullable: true,
  })
  markupOverridePercent: number | null;

  @Column('numeric', {
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
    nullable: true,
  })
  saleUnitManual: number | null;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  purchasedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
