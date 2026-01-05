import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemRepository } from '../item/item.repository';
import { ItemService } from '../item/item.service';
import { PurchaseBatchRepository } from './purchase-batch.repository';

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

@Injectable()
export class PurchaseReportService {
  constructor(
    private readonly batchRepo: PurchaseBatchRepository,
    private readonly itemRepo: ItemRepository,
    private readonly itemService: ItemService,
  ) {}

  async getBatchReport(batchId: string) {
    const batch = await this.batchRepo.findById(batchId);
    if (!batch) throw new NotFoundException('Compra (lote) não encontrada');

    const items = await this.itemRepo.findByBatchId(batchId);
    const itemResponses = await Promise.all(
      items.map((item) => this.itemService.toResponse(item, { batch, batchDefaultMarkup: batch.defaultMarkupPercent ?? null })),
    );

    const defaultMarkupPercent = batch.defaultMarkupPercent ?? itemResponses[0]?.pricing?.defaultMarkupPercent ?? null;

    const rows = itemResponses.map((r) => {
      const qty = r.quantity ?? 0;
      const costUnit = r.costUnit ?? 0;
      const costTotal = round2(costUnit * qty);

      const saleUnitEffective = r.pricing?.saleUnitEffective ?? null;
      const profitUnit = r.pricing?.profitUnit ?? null;

      const saleTotal =
        saleUnitEffective === null ? null : round2(saleUnitEffective * qty);

      const profitTotal =
        profitUnit === null ? null : round2(profitUnit * qty);

      return {
        itemId: r.id,
        name: r.name,
        quantity: qty,
        costUnit,
        costTotal,
        saleUnitEffective,
        saleTotal,
        profitUnit,
        profitTotal,
        pricingMode: r.pricing?.pricingMode ?? 'unset',
        markupEffectivePercent: r.pricing?.markupEffectivePercent ?? null,
        photoUrl: r.photoUrl ?? null,
      };
    });

    const itemsCount = rows.length;
    const totalQuantity = rows.reduce((acc, row) => acc + (row.quantity ?? 0), 0);
    const totalCost = round2(
      rows.reduce((acc, row) => acc + (row.costTotal ?? 0), 0),
    );

    const pricedRows = rows.filter((r) => r.saleTotal !== null);
    const pricedItemsCount = pricedRows.length;
    const unpricedItemsCount = itemsCount - pricedItemsCount;

    const totalRevenue = round2(
      pricedRows.reduce((acc, row) => acc + (row.saleTotal ?? 0), 0),
    );

    const totalProfit = round2(
      pricedRows.reduce((acc, row) => acc + (row.profitTotal ?? 0), 0),
    );

    return {
      batch: {
        id: batch.id,
        purchasedOn: batch.purchasedOn,
        title: batch.title,
        notes: batch.notes,
        defaultMarkupPercent: batch.defaultMarkupPercent ?? null,
      },
      summary: {
        itemsCount,
        pricedItemsCount,
        unpricedItemsCount,
        totalQuantity,
        totalCost,
        totalRevenue,
        totalProfit,
        defaultMarkupPercent,
      },
      rows,
    };
  }
}
