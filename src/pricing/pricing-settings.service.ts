import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PricingSettingsEntity } from './pricing-settings.entity';
import { InjectRepository } from '@nestjs/typeorm';

const DEFAULT_ID = 'default';

@Injectable()
export class PricingSettingsService {
  constructor(
    @InjectRepository(PricingSettingsEntity)
    private readonly repository: Repository<PricingSettingsEntity>,
  ) {}

  async getOrCreate(): Promise<PricingSettingsEntity> {
    let row = await this.repository.findOne({ where: { id: DEFAULT_ID } });
    if (!row) {
      row = this.repository.create({
        id: DEFAULT_ID,
        defaultMarkupPercent: null,
      });
      row = await this.repository.save(row);
    }
    return row;
  }

  async getDefaultMarkupPercent(): Promise<number | null> {
    const row = await this.getOrCreate();
    return row.defaultMarkupPercent;
  }

  async updateDefaultMarkupPercent(defaultMarkupPercent: number) {
    const row = await this.getOrCreate();
    row.defaultMarkupPercent = defaultMarkupPercent;
    return this.repository.save(row);
  }

  async resetDefaultMarkupPercent() {
    const row = await this.getOrCreate();
    row.defaultMarkupPercent = null;
    return this.repository.save(row);
  }
}
