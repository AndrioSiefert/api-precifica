import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MinioService } from '../storage/minio.service';
import { PurchaseBatchRepository } from './purchase-batch.repository';
import { PurchaseCaptureRepository } from './purchase-capture.repository';
import { PurchaseCaptureEntity } from './purchase-capture.entity';
import { FinalizePurchaseCaptureDto } from './dto/finalize-purchase-capture.dto';
import { ItemRepository } from '../item/item.repository';
import { ItemService } from '../item/item.service';

@Injectable()
export class PurchaseCaptureService {
  constructor(
    private readonly batchRepo: PurchaseBatchRepository,
    private readonly captureRepo: PurchaseCaptureRepository,
    private readonly minio: MinioService,
    private readonly itemRepo: ItemRepository,
    private readonly itemService: ItemService,
  ) {}

  private async toResponse(capture: PurchaseCaptureEntity) {
    const photoUrl = capture.photoKey
      ? await this.minio.getPresignedUrl(capture.photoKey)
      : null;

    return {
      ...capture,
      photoUrl,
    };
  }

  async createCapture(batchId: string, photo?: Express.Multer.File) {
    if (!photo) throw new BadRequestException('Envie a foto no campo "photo"');

    if (!photo.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Arquivo inv\u00e1lido: envie uma imagem');
    }

    const batch = await this.batchRepo.findById(batchId);
    if (!batch) throw new NotFoundException('Compra (lote) n\u00e3o encontrada');

    const captureId = randomUUID();
    const key = `purchase-batches/${batchId}/captures/${captureId}`;

    await this.minio.upload(key, photo.buffer, photo.mimetype);

    const capture = this.captureRepo.create({
      id: captureId,
      batchId,
      photoKey: key,
      photoMime: photo.mimetype,
      status: 'draft',
      itemId: null,
    });

    const saved = await this.captureRepo.save(capture);
    return this.toResponse(saved);
  }

  async listByBatch(batchId: string) {
    const batch = await this.batchRepo.findById(batchId);
    if (!batch) throw new NotFoundException('Compra (lote) n\u00e3o encontrada');

    const captures = await this.captureRepo.findByBatchId(batchId);
    return Promise.all(captures.map((c) => this.toResponse(c)));
  }

  async finalizeCapture(captureId: string, dto: FinalizePurchaseCaptureDto) {
    const capture = await this.captureRepo.findById(captureId);
    if (!capture) throw new NotFoundException('Foto (capture) n\u00e3o encontrada');

    const batch = await this.batchRepo.findById(capture.batchId);
    if (!batch) throw new NotFoundException('Compra (lote) n\u00e3o encontrada');

    const purchasedAt = new Date(`${batch.purchasedOn}T12:00:00.000Z`);


    if (capture.status === 'finalized' && capture.itemId) {
      const existingItem = await this.itemRepo.findById(capture.itemId);
      if (!existingItem) {
        throw new ConflictException('Essa foto est\u00e1 finalizada, mas o item n\u00e3o foi encontrado');
      }

      existingItem.name = dto.name;
      existingItem.costUnit = dto.costUnit;
      existingItem.quantity = dto.quantity;
      existingItem.markupOverridePercent = dto.markupOverridePercent ?? null;
      existingItem.saleUnitManual = dto.saleUnitManual ?? null;
      existingItem.purchasedAt = purchasedAt;

      this.itemService.applyPricingMode(existingItem, dto.updatedField);

      const savedItem = await this.itemRepo.save(existingItem);

      return {
        capture: await this.toResponse(capture),
        item: await this.itemService.toResponse(savedItem, { batch, batchDefaultMarkup: batch.defaultMarkupPercent ?? null }),
      };
    }

    if (capture.status === 'finalized') {
      throw new ConflictException('Essa foto j\u00e1 foi finalizada');
    }

    const item = this.itemRepo.create({
      name: dto.name,
      costUnit: dto.costUnit,
      quantity: dto.quantity,
      markupOverridePercent: dto.markupOverridePercent ?? null,
      saleUnitManual: dto.saleUnitManual ?? null,
      purchasedAt,
      batchId: batch.id,
      captureId: capture.id,
      photoKey: capture.photoKey,
      photoMime: capture.photoMime,
    });

    this.itemService.applyPricingMode(item, dto.updatedField);

    const savedItem = await this.itemRepo.save(item);

    capture.status = 'finalized';
    capture.itemId = savedItem.id;

    const savedCapture = await this.captureRepo.save(capture);

    return {
      capture: await this.toResponse(savedCapture),
      item: await this.itemService.toResponse(savedItem, { batch, batchDefaultMarkup: batch.defaultMarkupPercent ?? null }),
    };
  }

  async deleteCapture(captureId: string) {
    const capture = await this.captureRepo.findById(captureId);
    if (!capture) throw new NotFoundException('Foto (capture) n\u00e3o encontrada');

    const processed = new Set<string>();

    if (capture.itemId) {
      try {
        const item = await this.itemRepo.findById(capture.itemId);
        if (item?.photoKey && !processed.has(item.photoKey)) {
          try {
            await this.minio.remove(item.photoKey);
            processed.add(item.photoKey);
          } catch {}
        }
        if (item) {
          await this.itemRepo.delete(item.id);
        }
      } catch {}
    }

    if (capture.photoKey && !processed.has(capture.photoKey)) {
      try {
        await this.minio.remove(capture.photoKey);
      } catch {}
    }

    await this.captureRepo.delete(captureId);
    return { deleted: true };
  }
}
