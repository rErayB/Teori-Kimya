import jsPDF from 'jspdf';
import { Product, CompanyInfo } from '../types';

export interface CatalogPdfOptions {
  showPrice: boolean;
  priceType?: 'sale' | 'with_vat' | 'with_discount';
  showStock?: boolean;
  showSpecs?: boolean;
  showBarcode?: boolean;
  catalogTheme?: 'dark' | 'light';
  onProgress?: (percent: number, message: string) => void;
}

export interface CatalogPdfResult {
  success: boolean;
  blob?: Blob;
  url?: string;
  fileName?: string;
  error?: string;
}

/**
 * Maps Turkish characters safely for standard jsPDF fonts (Helvetica WinAnsi)
 * so text renders 100% clean, crisp and without broken question marks.
 */
export const sanitizeTurkishForPdf = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U');
};

/**
 * Downloads a Blob safely on mobile Safari, Android Chrome, and desktop browsers
 */
export const downloadPdfBlob = (blob: Blob, fileName: string): void => {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (_) {}
    }, 45000); // Keep blob alive long enough for mobile iOS file-save sheet
  } catch (err) {
    console.error('downloadPdfBlob error:', err);
  }
};

/**
 * Returns Category RGB Colors matching Teori Kimya's Industrial Design
 */
const getCategoryRgb = (category: string, isLight: boolean) => {
  const c = category.toLowerCase();
  if (c.includes('agir') || c.includes('agır') || c.includes('yag') || c.includes('sanayi')) {
    return { r: 245, g: 158, b: 11, label: 'AGIR SANAYI & YAG SOKUCULER' }; // Amber
  }
  if (c.includes('oto') || c.includes('yikama') || c.includes('bakim')) {
    return { r: 6, g: 182, b: 212, label: 'OTO BAKIM & YIKAMA' }; // Cyan
  }
  if (c.includes('gida') || c.includes('mutfak')) {
    return { r: 16, g: 185, b: 129, label: 'GIDA HIJYENI & MUTFAK' }; // Emerald
  }
  if (c.includes('dezenfektan') || c.includes('biyosidal')) {
    return { r: 20, g: 184, b: 166, label: 'DEZENFEKTAN & BIYOSIDAL' }; // Teal
  }
  if (c.includes('camasir') || c.includes('tekstil')) {
    return { r: 168, g: 85, b: 247, label: 'CAMASIRHANE & TEKSTIL' }; // Purple
  }
  if (c.includes('ozel') || c.includes('kimyasal')) {
    return { r: 244, g: 63, b: 94, label: 'OZEL KIMYASALLAR' }; // Rose
  }
  return { r: 14, g: 165, b: 233, label: sanitizeTurkishForPdf(category).toUpperCase() }; // Sky
};

/**
 * Direct programmatic PDF generator that creates clean, vector A4 pages
 * matching the Teori Kimya dark/cyan industrial design.
 * Works 100% reliably on iOS Safari, Android, and Desktop without canvas taint errors.
 */
export const generateDirectCatalogPdf = (
  products: Product[],
  company: CompanyInfo,
  options: {
    showPrices: boolean;
    priceFormat?: 'sale' | 'vat_included' | 'with_discount' | 'net';
    showStock?: boolean;
    showSpecs?: boolean;
    theme?: 'dark' | 'light';
  },
  fileName = 'Teori_Kimya_Urun_Katalogu.pdf',
  onProgress?: (percent: number, message: string) => void
): CatalogPdfResult => {
  try {
    onProgress?.(15, 'PDF dokumani ve A4 sayfalari hazirlaniyor...');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const isLight = options.theme === 'light';
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 12;
    const contentWidth = pageWidth - margin * 2; // 186mm

    // Draw A4 Header Banner (Teori Kimya Branding)
    const drawHeader = (pageNumber: number, totalPages: number) => {
      // Header background
      if (isLight) {
        pdf.setFillColor(241, 245, 249); // slate-100
      } else {
        pdf.setFillColor(11, 27, 46); // deep brand navy #0B1B2E
      }
      pdf.roundedRect(margin, margin, contentWidth, 24, 3, 3, 'F');

      // Top cyan neon accent line
      pdf.setDrawColor(6, 182, 212); // #06B6D4
      pdf.setLineWidth(1.0);
      pdf.line(margin + 2, margin, margin + contentWidth - 2, margin);

      // Company Title & Brand
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      if (isLight) {
        pdf.setTextColor(15, 23, 42);
      } else {
        pdf.setTextColor(255, 255, 255);
      }
      pdf.text(sanitizeTurkishForPdf(company.name).toUpperCase(), margin + 6, margin + 9);

      // Cyan Subtitle Pill
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(6, 182, 212);
      pdf.text('B2B ENDUSTRIYEL KIMYA URUN PORTFOYU', margin + 6, margin + 14.5);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(isLight ? 100 : 180, isLight ? 116 : 200, isLight ? 139 : 220);
      pdf.text(sanitizeTurkishForPdf(company.subtitle), margin + 6, margin + 19.5);

      // Contact details (Right aligned)
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(isLight ? 30 : 230, isLight ? 41 : 240, isLight ? 59 : 255);
      pdf.text(
        `Tel: ${company.phone}   |   Yetkili: ${sanitizeTurkishForPdf(company.contactPerson)}`,
        margin + contentWidth - 6,
        margin + 9,
        { align: 'right' }
      );

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.8);
      pdf.setTextColor(isLight ? 100 : 160, isLight ? 116 : 180, isLight ? 139 : 200);
      pdf.text(
        `${sanitizeTurkishForPdf(company.address)}  |  ${sanitizeTurkishForPdf(company.taxOffice)} V.D.`,
        margin + contentWidth - 6,
        margin + 14.5,
        { align: 'right' }
      );

      pdf.text(
        `Web: ${company.website}  |  E-Posta: ${company.email}`,
        margin + contentWidth - 6,
        margin + 19.5,
        { align: 'right' }
      );
    };

    // Draw A4 Footer
    const drawFooter = (pageNumber: number, totalPages: number) => {
      pdf.setDrawColor(isLight ? 226 : 30, isLight ? 232 : 58, isLight ? 240 : 88);
      pdf.setLineWidth(0.3);
      pdf.line(margin, pageHeight - margin - 5, margin + contentWidth, pageHeight - margin - 5);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.8);
      pdf.setTextColor(isLight ? 100 : 148, isLight ? 116 : 163, isLight ? 139 : 184);

      pdf.text(
        `Sayfa ${pageNumber} / ${totalPages}   -   ${sanitizeTurkishForPdf(company.name)}   -   ${new Date().toLocaleDateString('tr-TR')}`,
        margin,
        pageHeight - margin - 1
      );

      pdf.text(
        options.showPrices ? 'Bayi / Musteri Fiyat Listesi' : 'Genel Tanitim Portfoyu (Fiyatsiz)',
        pageWidth - margin,
        pageHeight - margin - 1,
        { align: 'right' }
      );
    };

    // Layout configuration: 6 products per page (2 columns x 3 rows)
    const itemsPerPage = 6;
    const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));
    const cardGap = 4;
    const colWidth = (contentWidth - cardGap) / 2; // ~91mm
    const startY = margin + 28;
    const cardHeight = 75; // ~75mm

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      if (pageIdx > 0) {
        pdf.addPage();
      }

      // Page background
      if (!isLight) {
        pdf.setFillColor(7, 17, 31); // #07111F
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      }

      drawHeader(pageIdx + 1, totalPages);
      drawFooter(pageIdx + 1, totalPages);

      const pageProducts = products.slice(pageIdx * itemsPerPage, (pageIdx + 1) * itemsPerPage);

      pageProducts.forEach((prod, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = margin + col * (colWidth + cardGap);
        const y = startY + row * (cardHeight + cardGap);

        const categoryTheme = getCategoryRgb(prod.category, isLight);

        // Product Card Main Box
        if (isLight) {
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(203, 213, 225); // slate-300
        } else {
          pdf.setFillColor(11, 27, 46); // #0B1B2E
          pdf.setDrawColor(30, 58, 88); // subtle cyan/navy border
        }
        pdf.setLineWidth(0.4);
        pdf.roundedRect(x, y, colWidth, cardHeight, 2.5, 2.5, 'FD');

        // Top accent line in category color
        pdf.setDrawColor(categoryTheme.r, categoryTheme.g, categoryTheme.b);
        pdf.setLineWidth(0.8);
        pdf.line(x + 2, y, x + colWidth - 2, y);

        // --- Left Visual Column (Product Photo / Chemical Canister) ---
        const visualBoxX = x + 3.5;
        const visualBoxY = y + 4;
        const visualBoxW = 25;
        const visualBoxH = 34;

        pdf.setFillColor(isLight ? 241 : 7, isLight ? 245 : 17, isLight ? 249 : 31);
        pdf.setDrawColor(isLight ? 226 : 22, isLight ? 232 : 58, isLight ? 240 : 90);
        pdf.setLineWidth(0.2);
        pdf.roundedRect(visualBoxX, visualBoxY, visualBoxW, visualBoxH, 1.5, 1.5, 'FD');

        // If product has a base64 image, draw it
        let imageDrawn = false;
        if (prod.image && prod.image.startsWith('data:image')) {
          try {
            const format = prod.image.includes('png') ? 'PNG' : 'JPEG';
            pdf.addImage(prod.image, format, visualBoxX + 1, visualBoxY + 1, visualBoxW - 2, visualBoxH - 2, undefined, 'FAST');
            imageDrawn = true;
          } catch (imgErr) {
            console.warn('Direct PDF image render skip:', imgErr);
          }
        }

        // If no image, draw vector chemical canister bottle
        if (!imageDrawn) {
          const bottleCx = visualBoxX + visualBoxW / 2;
          const bottleY = visualBoxY + 5;

          // Bottle cap
          pdf.setFillColor(isLight ? 148 : 51, isLight ? 163 : 65, isLight ? 184 : 85);
          pdf.rect(bottleCx - 2.5, bottleY, 5, 2.5, 'F');

          // Bottle neck
          pdf.setFillColor(isLight ? 203 : 30, isLight ? 213 : 41, isLight ? 225 : 59);
          pdf.rect(bottleCx - 1.8, bottleY + 2.5, 3.6, 2, 'F');

          // Bottle body
          pdf.setFillColor(isLight ? 226 : 16, isLight ? 232 : 36, isLight ? 240 : 64);
          pdf.roundedRect(bottleCx - 8, bottleY + 4.5, 16, 20, 1.5, 1.5, 'F');

          // Bottle liquid core (category color)
          pdf.setFillColor(categoryTheme.r, categoryTheme.g, categoryTheme.b);
          pdf.roundedRect(bottleCx - 6.5, bottleY + 11, 13, 12, 1, 1, 'F');

          // Handle
          pdf.setDrawColor(isLight ? 148 : 51, isLight ? 163 : 65, isLight ? 184 : 85);
          pdf.setLineWidth(0.6);
          pdf.line(bottleCx + 8, bottleY + 7, bottleCx + 10, bottleY + 9);
          pdf.line(bottleCx + 10, bottleY + 9, bottleCx + 10, bottleY + 17);
          pdf.line(bottleCx + 10, bottleY + 17, bottleCx + 8, bottleY + 19);
        }

        // Product Code & pH Badges below image
        pdf.setFillColor(isLight ? 226 : 16, isLight ? 232 : 36, isLight ? 240 : 64);
        pdf.roundedRect(visualBoxX, visualBoxY + visualBoxH + 2, visualBoxW, 5, 1, 1, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        pdf.setTextColor(6, 182, 212);
        pdf.text(prod.code, visualBoxX + visualBoxW / 2, visualBoxY + visualBoxH + 5.5, { align: 'center' });

        if (prod.phValue) {
          pdf.setFillColor(isLight ? 241 : 7, isLight ? 245 : 17, isLight ? 249 : 31);
          pdf.roundedRect(visualBoxX, visualBoxY + visualBoxH + 8, visualBoxW, 4.5, 1, 1, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(5.8);
          pdf.setTextColor(isLight ? 30 : 200, isLight ? 41 : 220, isLight ? 59 : 240);
          pdf.text(`pH ${prod.phValue}`, visualBoxX + visualBoxW / 2, visualBoxY + visualBoxH + 11.2, { align: 'center' });
        }

        // --- Right Info Column ---
        const infoX = x + visualBoxW + 6;
        const infoW = colWidth - visualBoxW - 9; // ~57mm
        let currentInfoY = y + 6;

        // Category Tag
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.2);
        pdf.setTextColor(categoryTheme.r, categoryTheme.g, categoryTheme.b);
        pdf.text(categoryTheme.label, infoX, currentInfoY);

        // Product Title
        currentInfoY += 4.5;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        if (isLight) {
          pdf.setTextColor(15, 23, 42);
        } else {
          pdf.setTextColor(255, 255, 255);
        }
        const titleLines = pdf.splitTextToSize(sanitizeTurkishForPdf(prod.name), infoW);
        pdf.text(titleLines.slice(0, 2), infoX, currentInfoY);
        currentInfoY += titleLines.slice(0, 2).length * 3.6 + 1.5;

        // Technical Specifications Line (Unit, Dilution, Stock)
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.5);
        pdf.setTextColor(isLight ? 71 : 148, isLight ? 85 : 163, isLight ? 105 : 184);

        const techSpecs: string[] = [];
        if (prod.unit) techSpecs.push(`Birim: ${sanitizeTurkishForPdf(prod.unit)}`);
        if (prod.dilutionRate) techSpecs.push(`Oran: ${sanitizeTurkishForPdf(prod.dilutionRate)}`);
        if (options.showStock && typeof prod.stock === 'number') {
          techSpecs.push(`Stok: ${prod.stock}`);
        }

        if (techSpecs.length > 0) {
          pdf.text(techSpecs.join('  |  '), infoX, currentInfoY);
          currentInfoY += 3.6;
        }

        // Description Paragraph
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.2);
        pdf.setTextColor(isLight ? 100 : 180, isLight ? 116 : 190, isLight ? 139 : 205);
        const descText = sanitizeTurkishForPdf(prod.description || 'Endustriyel temizlik ve bakim kimyasali.');
        const descLines = pdf.splitTextToSize(descText, infoW);
        pdf.text(descLines.slice(0, 3), infoX, currentInfoY);

        // Barcode row
        if (prod.barcode) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(5.8);
          pdf.setTextColor(isLight ? 148 : 100, isLight ? 163 : 116, isLight ? 184 : 139);
          pdf.text(`Barkod: ${prod.barcode}`, infoX, y + cardHeight - 14.5);
        }

        // --- Bottom Price / Quote Bar across full card width ---
        const priceBarY = y + cardHeight - 12;
        const priceBarH = 10;
        pdf.setFillColor(isLight ? 241 : 7, isLight ? 245 : 17, isLight ? 249 : 31);
        pdf.setDrawColor(isLight ? 226 : 22, isLight ? 232 : 58, isLight ? 240 : 90);
        pdf.roundedRect(x + 2, priceBarY, colWidth - 4, priceBarH, 1.5, 1.5, 'FD');

        if (options.showPrices) {
          let price = prod.salePrice || 0;
          let label = '+ KDV';
          if (options.priceFormat === 'with_discount' && prod.discountRate > 0) {
            price = price * (1 - prod.discountRate / 100);
            label = `Iskontolu (%${prod.discountRate} Ind.)`;
          } else if (options.priceFormat === 'vat_included') {
            price = price * (1 + (prod.vatRate || 20) / 100);
            label = 'KDV Dahil';
          }

          // Price Number
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10.5);
          pdf.setTextColor(16, 185, 129); // Emerald #10B981
          const formattedPrice = `${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
          pdf.text(formattedPrice, x + 6, priceBarY + 6.5);

          // Subtitle
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(6.2);
          pdf.setTextColor(isLight ? 100 : 160, isLight ? 116 : 175, isLight ? 139 : 195);
          pdf.text(
            `${label}  /  ${sanitizeTurkishForPdf(prod.unit || 'Adet')}`,
            x + colWidth - 6,
            priceBarY + 6.5,
            { align: 'right' }
          );
        } else {
          // Quote inquiry mode (Fiyatsız Tanıtım Kataloğu)
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(6, 182, 212); // Cyan
          pdf.text('FIYAT TEKLIFI ALINIZ', x + 6, priceBarY + 6.5);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(6.5);
          pdf.setTextColor(isLight ? 100 : 160, isLight ? 116 : 175, isLight ? 139 : 195);
          pdf.text(`Tel: ${company.phone}`, x + colWidth - 6, priceBarY + 6.5, { align: 'right' });
        }
      });

      const currentProgress = Math.round(20 + ((pageIdx + 1) / totalPages) * 70);
      onProgress?.(currentProgress, `Sayfa ${pageIdx + 1} / ${totalPages} derlendi...`);
    }

    onProgress?.(95, 'PDF dosyasi olusturuluyor ve indiriliyor...');
    
    // Save file using jsPDF native file-saver
    pdf.save(fileName);

    // Also produce Blob for mobile Safari and in-browser preview URL
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    downloadPdfBlob(pdfBlob, fileName);

    onProgress?.(100, 'Katalog basariyla indirildi!');
    return {
      success: true,
      blob: pdfBlob,
      url: pdfUrl,
      fileName,
    };
  } catch (err: any) {
    console.error('generateDirectCatalogPdf error:', err);
    return {
      success: false,
      error: err?.message || String(err),
    };
  }
};

/**
 * High-reliability catalog PDF generator.
 * Directly produces vector A4 pages with zero canvas taint risk.
 */
export const generateCatalogPdf = async (
  elementId: string,
  fileName = 'Teori_Kimya_Urun_Katalogu.pdf',
  onProgress?: (percent: number, message: string) => void,
  fallbackData?: {
    products: Product[];
    company: CompanyInfo;
    options: {
      showPrices: boolean;
      priceFormat?: 'sale' | 'vat_included' | 'with_discount' | 'net';
      showStock?: boolean;
      showSpecs?: boolean;
      theme?: 'dark' | 'light';
    };
  }
): Promise<CatalogPdfResult> => {
  if (fallbackData) {
    return generateDirectCatalogPdf(
      fallbackData.products,
      fallbackData.company,
      fallbackData.options,
      fileName,
      onProgress
    );
  }

  return {
    success: false,
    error: 'Katalog verisi bulunamadı.',
  };
};

/**
 * Triggers the browser's native print engine with optimized A4 CSS.
 * Provides 100% native "Save as PDF" / AirPrint on iOS and Android.
 */
export const triggerCatalogPrint = (): void => {
  window.print();
};
