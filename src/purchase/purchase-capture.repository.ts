import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseCaptureEntity } from './purchase-capture.entity';

@Injectable()
export class PurchaseCaptureRepository {
  constructor(
    @InjectRepository(PurchaseCaptureEntity)
    private readonly repo: Repository<PurchaseCaptureEntity>,
  ) {}

  create(data: Partial<PurchaseCaptureEntity>) {
    return this.repo.create(data);
  }

  save(capture: PurchaseCaptureEntity) {
    return this.repo.save(capture);
  }

  findByBatchId(batchId: string) {
    return this.repo.find({
      where: { batchId },
      order: { createdAt: 'ASC' },
    });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}
