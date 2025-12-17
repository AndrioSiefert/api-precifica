import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

const numericTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity('pricing_settings')
export class PricingSettingsEntity {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column('numeric', {
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
    nullable: true,
  })
  defaultMarkupPercent: number | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
