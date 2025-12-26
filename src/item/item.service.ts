import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MinioService } from '../storage/minio.service';
import { PricingSettingsService } from '../pricing/pricing-settings.service';
import { CreateItemDto } from './dto/createItem.dto';
import { UpdateItemDto } from './dto/updateItem.dto';
import { ItemEntity } from './item.entity';
import { ItemRepository } from './item.repository';

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function computeSaleFromMarkup(cost: number, markupPercent: number) {
  return round2(cost * (1 + markupPercent / 100));
}

function computeMarkupFromSale(cost: number, sale: number) {
  if (!cost || cost <= 0) return 0;
  return round2(((sale - cost) / cost) * 100);
}

@Injectable()
export class ItemService {
  constructor(
    private readonly itemRepo: ItemRepository,
    private readonly minio: MinioService,
    private readonly pricingSettings: PricingSettingsService,
  ) {}

  applyPricingMode(item: ItemEntity, updatedField?: 'markup' | 'sale') {
    if (updatedField === 'markup') {
      item.saleUnitManual = null;
      return;
    }
    if (updatedField === 'sale') {
      item.markupOverridePercent = null;
      return;
    }

    if (item.saleUnitManual !== null && item.saleUnitManual !== undefined) {
      item.markupOverridePercent = null;
    }
  }


  private computePricing(
    item: ItemEntity,
    defaultMarkupPercent: number | null,
  ) {
    const cost = item.costUnit ?? 0;

    const hasManualSale =
      item.saleUnitManual !== null && item.saleUnitManual !== undefined;

    const hasItemMarkup =
      item.markupOverridePercent !== null &&
      item.markupOverridePercent !== undefined;

    if (hasManualSale) {
      const saleUnitEffective = item.saleUnitManual as number;
      return {
        pricingMode: 'sale' as const,
        defaultMarkupPercent,
        saleUnitEffective,
        markupEffectivePercent: computeMarkupFromSale(cost, saleUnitEffective),
        profitUnit: round2(saleUnitEffective - cost),
      };
    }

    if (hasItemMarkup) {
      const markupApplied = item.markupOverridePercent as number;
      const saleUnitEffective = computeSaleFromMarkup(cost, markupApplied);
      return {
        pricingMode: 'markup' as const,
        defaultMarkupPercent,
        saleUnitEffective,
        markupEffectivePercent: markupApplied,
        profitUnit: round2(saleUnitEffective - cost),
      };
    }

    if (defaultMarkupPercent === null || defaultMarkupPercent === undefined) {
      return {
        pricingMode: 'unset' as const,
        defaultMarkupPercent,
        saleUnitEffective: null,
        markupEffectivePercent: null,
        profitUnit: null,
      };
    }

    const saleUnitEffective = computeSaleFromMarkup(cost, defaultMarkupPercent);
    return {
      pricingMode: 'global' as const,
      defaultMarkupPercent,
      saleUnitEffective,
      markupEffectivePercent: defaultMarkupPercent,
      profitUnit: round2(saleUnitEffective - cost),
    };
  }

  async toResponse(item: ItemEntity) {
    const defaultMarkupPercent =
      await this.pricingSettings.getDefaultMarkupPercent();

    const photoUrl = item.photoKey
      ? await this.minio.getPresignedUrl(item.photoKey)
      : null;

    return {
      ...item,
      photoUrl,
      pricing: this.computePricing(item, defaultMarkupPercent),
    };
  }

  async createItem(dto: CreateItemDto, photo?: Express.Multer.File) {
    const item = this.itemRepo.create({
      name: dto.name,
      costUnit: dto.costUnit,
      quantity: dto.quantity,
      markupOverridePercent: dto.markupOverridePercent ?? null,
      saleUnitManual: dto.saleUnitManual ?? null,
      purchasedAt: dto.purchasedAt ?? new Date(),
      batchId: null,
      captureId: null,
      photoKey: null,
      photoMime: null,
    });

    this.applyPricingMode(item, dto.updatedField);

    if (photo) {
      const key = `items/${randomUUID()}`;
      await this.minio.upload(key, photo.buffer, photo.mimetype);
      item.photoKey = key;
      item.photoMime = photo.mimetype;
    }

    const saved = await this.itemRepo.save(item);
    return this.toResponse(saved);
  }

  async findAll() {
    const items = await this.itemRepo.findAll();
    return Promise.all(items.map((i) => this.toResponse(i)));
  }

  async updateItem(id: string, dto: UpdateItemDto) {
    const item = await this.itemRepo.findById(id);
    if (!item) throw new NotFoundException('Item não encontrado');

    if (dto.name !== undefined) item.name = dto.name;
    if (dto.costUnit !== undefined) item.costUnit = dto.costUnit;
    if (dto.quantity !== undefined) item.quantity = dto.quantity;
    if (dto.purchasedAt !== undefined) item.purchasedAt = dto.purchasedAt;

    if (dto.markupOverridePercent !== undefined) {
      item.markupOverridePercent = dto.markupOverridePercent ?? null;
    }
    if (dto.saleUnitManual !== undefined) {
      item.saleUnitManual = dto.saleUnitManual ?? null;
    }

    this.applyPricingMode(item, dto.updatedField);

    const saved = await this.itemRepo.save(item);
    return this.toResponse(saved);
  }

  async resetPricing(id: string) {
    const item = await this.itemRepo.findById(id);
    if (!item) throw new NotFoundException('Item não encontrado');

    item.saleUnitManual = null;
    item.markupOverridePercent = null;

    const saved = await this.itemRepo.save(item);
    return this.toResponse(saved);
  }
}
