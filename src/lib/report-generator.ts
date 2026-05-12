import { jsPDF } from 'jspdf';
import type { BetriebsAnalyse, ObjektMetrik, HeatmapConfig } from '@/lib/betriebsdaten-store';
import type { GesamtErgebnis } from '@/types/prozessmodell';

interface ReportData {
  projektName: string;
  analyse: BetriebsAnalyse;
  ergebnis?: GesamtErgebnis | null;
  canvasDataURL?: string;
  halleName?: string;
}

/**
 * Generiert einen Management-Summary Report als PDF.
 */
export function generateReport(data: ReportData): void {
  const { projektName, analyse, ergebnis, canvasDataURL, halleName } = data;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  // ==================== Header ====================
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('TOPIS', margin, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Management-Summary', margin + 30, 16);
  doc.setFontSize(9);
  doc.text(`${projektName} | ${new Date().toLocaleDateString('de-DE')}`, pageWidth - margin, 16, { align: 'right' });

  y = 35;

  // ==================== Projektinfo ====================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(halleName || projektName, margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Zeitraum: ${analyse.zeitraum.von} bis ${analyse.zeitraum.bis} (${analyse.arbeitstage} Arbeitstage)`,
    margin,
    y
  );
  y += 8;

  // ==================== KPI-Boxen ====================
  const colliProTag = analyse.gesamtColli / analyse.arbeitstage;
  const sendungenProTag = analyse.gesamtSendungen / analyse.arbeitstage;
  const gewichtProTag = analyse.gesamtGewicht / analyse.arbeitstage;

  const kpis = [
    { label: 'Colli/Tag', value: Math.round(colliProTag).toLocaleString('de-DE') },
    { label: 'Sendungen/Tag', value: Math.round(sendungenProTag).toLocaleString('de-DE') },
    { label: 'Gewicht/Tag', value: `${Math.round(gewichtProTag).toLocaleString('de-DE')} kg` },
    { label: 'Aktive Tore', value: String(analyse.objektMetriken.length) },
  ];

  if (ergebnis) {
    kpis.push(
      { label: 'Min/Colli', value: ergebnis.minProColli.toFixed(3) },
      { label: 'MA-Stunden/Tag', value: String(Math.round(ergebnis.maStundenBedarf)) },
      { label: 'FTE', value: ergebnis.fte.toFixed(1) },
      { label: 'Colli/MA-Std', value: ergebnis.maStundenBedarf > 0 ? String(Math.round(ergebnis.colliProTag / ergebnis.maStundenBedarf)) : '-' },
    );
  }

  const boxWidth = (pageWidth - 2 * margin - (kpis.length - 1) * 3) / kpis.length;
  const boxHeight = 18;

  kpis.forEach((kpi, i) => {
    const bx = margin + i * (boxWidth + 3);
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(bx, y, boxWidth, boxHeight, 2, 2, 'F');

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.value, bx + boxWidth / 2, y + 8, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(kpi.label, bx + boxWidth / 2, y + 14, { align: 'center' });
  });
  y += boxHeight + 8;

  // ==================== Canvas Screenshot ====================
  if (canvasDataURL) {
    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = Math.min(80, pageHeight - y - 50);

    try {
      doc.addImage(canvasDataURL, 'PNG', margin, y, imgWidth, imgHeight);
      y += imgHeight + 5;
    } catch {
      // Canvas-Screenshot fehlgeschlagen, weiter ohne Bild
    }
  }

  // ==================== Top-10 Tore Tabelle ====================
  if (y + 60 > pageHeight - margin) {
    doc.addPage();
    y = margin + 10;
  }

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Top-10 Tore nach Colli/Tag', margin, y);
  y += 5;

  const topTore = [...analyse.objektMetriken]
    .sort((a, b) => b.colli - a.colli)
    .slice(0, 10);

  // Table header
  const tableColWidths = [50, 30, 30, 30, 35];
  const tableHeaders = ['Tor', 'Colli/Tag', 'Sdg/Tag', 'Gewicht/Tag', 'Auslastung'];

  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y, tableColWidths.reduce((a, b) => a + b), 6, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);

  let tx = margin + 2;
  tableHeaders.forEach((h, i) => {
    doc.text(h, tx, y + 4);
    tx += tableColWidths[i];
  });
  y += 6;

  // Table rows
  doc.setFont('helvetica', 'normal');
  topTore.forEach((tor) => {
    if (y + 5 > pageHeight - margin) return; // Overflow-Schutz

    tx = margin + 2;
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text(tor.objectName, tx, y + 3.5);
    tx += tableColWidths[0];
    doc.text(Math.round(tor.colli).toLocaleString('de-DE'), tx, y + 3.5);
    tx += tableColWidths[1];
    doc.text(Math.round(tor.sendungen).toLocaleString('de-DE'), tx, y + 3.5);
    tx += tableColWidths[2];
    doc.text(`${Math.round(tor.gewicht).toLocaleString('de-DE')} kg`, tx, y + 3.5);
    tx += tableColWidths[3];

    // Auslastungs-Balken
    const barWidth = 30;
    const barHeight = 3;
    doc.setFillColor(226, 232, 240);
    doc.rect(tx, y + 1.5, barWidth, barHeight, 'F');
    const auslPct = Math.min(tor.auslastung, 1);
    if (auslPct > 0.8) {
      doc.setFillColor(239, 68, 68); // red
    } else if (auslPct > 0.5) {
      doc.setFillColor(251, 191, 36); // amber
    } else {
      doc.setFillColor(34, 197, 94); // green
    }
    doc.rect(tx, y + 1.5, barWidth * auslPct, barHeight, 'F');
    doc.text(`${Math.round(auslPct * 100)}%`, tx + barWidth + 2, y + 3.5);

    y += 5;
  });

  // ==================== Prozessmodell (wenn vorhanden) ====================
  if (ergebnis && ergebnis.abteilungen.length > 0) {
    y += 5;
    if (y + 30 > pageHeight - margin) {
      doc.addPage();
      y = margin + 10;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Prozessmodell — Zeitverteilung', margin, y);
    y += 6;

    // Abteilungs-Balken
    const barTotalWidth = pageWidth - 2 * margin;
    const barY = y;
    const barH = 10;

    ergebnis.abteilungen.forEach((abt) => {
      const width = barTotalWidth * abt.anteilGesamt;
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
          : { r: 100, g: 100, b: 100 };
      };
      const rgb = hexToRgb(abt.color);
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      // Calculate x position based on preceding abteilungen
      const precedingWidth = ergebnis.abteilungen
        .slice(0, ergebnis.abteilungen.indexOf(abt))
        .reduce((s, a) => s + barTotalWidth * a.anteilGesamt, 0);
      doc.rect(margin + precedingWidth, barY, width, barH, 'F');

      if (abt.anteilGesamt > 0.1) {
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(
          `${abt.label}: ${abt.minProColli.toFixed(3)}`,
          margin + precedingWidth + width / 2,
          barY + 6,
          { align: 'center' }
        );
      }
    });
    y += barH + 3;

    // Legende
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    let lx = margin;
    ergebnis.abteilungen.forEach((abt) => {
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
          : { r: 100, g: 100, b: 100 };
      };
      const rgb = hexToRgb(abt.color);
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.rect(lx, y, 3, 3, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text(`${abt.label} (${(abt.anteilGesamt * 100).toFixed(0)}%)`, lx + 5, y + 2.5);
      lx += 45;
    });
  }

  // ==================== Footer ====================
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'Erstellt mit TOPIS — ROTH Logistik-Beratung',
    pageWidth / 2,
    pageHeight - 5,
    { align: 'center' }
  );

  // Download
  doc.save(`TOPIS-Report_${projektName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}
