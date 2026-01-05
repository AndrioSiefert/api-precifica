import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { PurchaseReportService } from './purchase-report.service';

function formatDateBR(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function moneyBRL(v: number | null) {
  if (v === null || v === undefined) return '-';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatPercent(v: number | null) {
  if (v === null || v === undefined) return '-';
  return `${v}%`;
}

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arr = await res.arrayBuffer();
    return Buffer.from(arr);
  } catch {
    return null;
  }
}

@Injectable()
export class PurchaseReportPdfService {
  constructor(private readonly reportService: PurchaseReportService) {}

  async buildBatchPdf(batchId: string) {
    const report = await this.reportService.getBatchReport(batchId);

    const filename = `relatorio-compra-${report.batch.purchasedOn}.pdf`;

    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      info: {
        Title: 'Relatorio de Compras',
        Author: 'Precifica',
      },
    });

    const stream = new PassThrough();
    doc.pipe(stream);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const pageLeft = doc.page.margins.left;
    const pageBottom = doc.page.height - doc.page.margins.bottom;

    // ===== Header =====
    doc.font('Helvetica-Bold').fontSize(18).text('Relatorio de Compras', { align: 'left' });
    doc.moveDown(0.3);

    const title = report.batch.title ? ` - ${report.batch.title}` : '';
    doc.font('Helvetica').fontSize(11).text(`Data da compra: ${formatDateBR(report.batch.purchasedOn)}${title}`);

    if (report.batch.notes) {
      doc.font('Helvetica').fontSize(10).fillColor('gray').text(`Obs.: ${report.batch.notes}`);
      doc.fillColor('black');
    }

    doc.moveDown(0.8);

    // ===== Summary =====
    doc.font('Helvetica-Bold').fontSize(12).text('Resumo');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    doc.text(`Itens: ${report.summary.itemsCount}`);
    doc.text(`Qtd total: ${report.summary.totalQuantity}`);
    doc.text(`Total de compras (custo): ${moneyBRL(report.summary.totalCost)}`);
    doc.text(`Total de venda: ${moneyBRL(report.summary.totalRevenue)}`);
    doc.text(`Lucro total: ${moneyBRL(report.summary.totalProfit)}`);
    doc.text(`Margem da pasta: ${formatPercent(report.summary.defaultMarkupPercent ?? null)}`);

    if (report.summary.unpricedItemsCount > 0) {
      doc
        .fillColor('gray')
        .text(`Itens sem preco calculado: ${report.summary.unpricedItemsCount}`)
        .fillColor('black');
    }

    doc.moveDown(0.8);
    doc
      .moveTo(pageLeft, doc.y)
      .lineTo(pageLeft + pageWidth, doc.y)
      .stroke();

    doc.moveDown(0.7);

    const imgSize = 90;
    const colGap = 16;
    const rowGap = 16;
    const cardPadding = 10;

    for (const row of report.rows) {
      const startY = doc.y;
      let currentY = startY;

      const textX = pageLeft + cardPadding + imgSize + colGap;
      const textWidth = pageWidth - cardPadding * 2 - imgSize - colGap;
      const columnWidth = (textWidth - 10) / 2;

      doc.font('Helvetica-Bold').fontSize(12);
      const nameHeight = doc.heightOfString(row.name, { width: textWidth });

      const metaLine = [
        `Modo: ${String(row.pricingMode || '').toUpperCase()}`,
        `Margem usada: ${formatPercent(row.markupEffectivePercent ?? null)}`,
      ].join('  •  ');

      doc.font('Helvetica').fontSize(9);
      const metaHeight = doc.heightOfString(metaLine, { width: textWidth });

      const leftDetails = [
        `Qtd: ${row.quantity}`,
        `Custo un.: ${moneyBRL(row.costUnit)}`,
        `Total custo: ${moneyBRL(row.costTotal)}`,
      ];
      const rightDetails = [
        `Venda un.: ${moneyBRL(row.saleUnitEffective)}`,
        `Total venda: ${moneyBRL(row.saleTotal)}`,
        `Lucro total: ${moneyBRL(row.profitTotal)}`,
      ];

      const detailsHeight = Math.max(
        doc.heightOfString(leftDetails.join('\n'), { width: columnWidth, lineGap: 2 }),
        doc.heightOfString(rightDetails.join('\n'), { width: columnWidth, lineGap: 2 }),
      );

      const contentHeight = nameHeight + metaHeight + 6 + detailsHeight;
      const rowHeight = cardPadding * 2 + Math.max(imgSize, contentHeight);

      if (currentY + rowHeight + rowGap > pageBottom) {
        doc.addPage();
        currentY = doc.y;
      }

      const cardX = pageLeft;
      const cardY = currentY;

      doc
        .roundedRect(cardX, cardY, pageWidth, rowHeight, 10)
        .fillOpacity(0.02)
        .fillAndStroke('#000000', '#d1d5db');
      doc.fillOpacity(1);

      const imgX = cardX + cardPadding;
      const imgY = cardY + cardPadding;
      let drewImage = false;
      if (row.photoUrl) {
        const buf = await fetchImageBuffer(row.photoUrl);
        if (buf) {
          try {
            doc.image(buf, imgX, imgY, { fit: [imgSize, imgSize] });
            drewImage = true;
          } catch {}
        }
      }
      if (!drewImage) {
        doc.rect(imgX, imgY, imgSize, imgSize).strokeOpacity(0.3).stroke().strokeOpacity(1);
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('gray')
          .text('Sem foto', imgX, imgY + imgSize / 2 - 4, { width: imgSize, align: 'center' });
        doc.fillColor('black');
      }

      const textTop = cardY + cardPadding;
      doc.font('Helvetica-Bold').fontSize(12).text(row.name, textX, textTop, {
        width: textWidth,
      });

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('gray')
        .text(metaLine, textX, textTop + nameHeight + 2, { width: textWidth });
      doc.fillColor('black');

      const detailsTop = textTop + nameHeight + metaHeight + 6;
      doc.font('Helvetica').fontSize(9);
      doc.text(leftDetails.join('\n'), textX, detailsTop, {
        width: columnWidth,
        lineGap: 2,
      });
      doc.text(rightDetails.join('\n'), textX + columnWidth + 10, detailsTop, {
        width: columnWidth,
        lineGap: 2,
      });

      doc.y = currentY + rowHeight + rowGap;
    }

    doc.moveDown(1);
    doc.font('Helvetica').fontSize(8).fillColor('gray').text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
    doc.fillColor('black');

    doc.end();

    return { stream, filename };
  }
}
