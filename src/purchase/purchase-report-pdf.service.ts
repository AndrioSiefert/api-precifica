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
        Title: 'Relatório de Compras',
        Author: 'Precifica',
      },
    });

    const stream = new PassThrough();
    doc.pipe(stream);

    // ===== Header =====
    doc.font('Helvetica-Bold').fontSize(18).text('Relatório de Compras', { align: 'left' });
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

    if (report.summary.unpricedItemsCount > 0) {
      doc
        .fillColor('gray')
        .text(`Itens sem preço calculado: ${report.summary.unpricedItemsCount}`)
        .fillColor('black');
    }

    doc.moveDown(0.8);
    doc
      .moveTo(doc.x, doc.y)
      .lineTo(555, doc.y) 
      .stroke();

    doc.moveDown(0.7);
    const pageBottom = doc.page.height - doc.page.margins.bottom;

    const imgSize = 72;
    const rowPadding = 10;
    const rowHeight = imgSize + rowPadding;

    for (const row of report.rows) {
     
      if (doc.y + rowHeight + 20 > pageBottom) {
        doc.addPage();
      }

      const startX = doc.x;
      const startY = doc.y;

      const imgX = startX;
      const imgY = startY;

      let drewImage = false;
      if (row.photoUrl) {
        const buf = await fetchImageBuffer(row.photoUrl);
        if (buf) {
          try {
            doc.image(buf, imgX, imgY, { fit: [imgSize, imgSize] });
            drewImage = true;
          } catch {
          }
        }
      }

      if (!drewImage) {
        doc.rect(imgX, imgY, imgSize, imgSize).stroke();
        doc.font('Helvetica').fontSize(8).fillColor('gray').text('Sem foto', imgX, imgY + imgSize / 2 - 4, {
          width: imgSize,
          align: 'center',
        });
        doc.fillColor('black');
      }

  
      const textX = imgX + imgSize + 12;
      const textWidth = 555 - textX; 
      const lineGap = 3;

      doc.font('Helvetica-Bold').fontSize(11).text(row.name, textX, imgY, {
        width: textWidth,
      });

      doc.font('Helvetica').fontSize(9);

      const lines = [
        `Qtd: ${row.quantity}`,
        `Custo un.: ${moneyBRL(row.costUnit)}`,
        `Total custo: ${moneyBRL(row.costTotal)}`,
        `Venda un.: ${moneyBRL(row.saleUnitEffective)}`,
        `Total venda: ${moneyBRL(row.saleTotal)}`,
        `Lucro total: ${moneyBRL(row.profitTotal)}`,
      ];

      let currentY = imgY + 16;
      for (const l of lines) {
        doc.text(l, textX, currentY, { width: textWidth });
        currentY += 10 + lineGap;
      }
      doc.moveTo(startX, startY + rowHeight).lineTo(555, startY + rowHeight).strokeOpacity(0.15).stroke().strokeOpacity(1);

      doc.y = startY + rowHeight + 8;
    }

    doc.moveDown(1);
    doc.font('Helvetica').fontSize(8).fillColor('gray').text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
    doc.fillColor('black');

    doc.end();

    return { stream, filename };
  }
}
