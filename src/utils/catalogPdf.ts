import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

/**
 * Downloads a high-quality multi-page PDF catalog from the DOM container.
 */
export const generateCatalogPdf = async (
  elementId: string,
  fileName = 'Teori_Kimya_Urun_Katalogu.pdf',
  onProgress?: (percent: number, message: string) => void
): Promise<boolean> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found.`);
    }

    onProgress?.(15, 'Katalog düzeni ve yüksek çözünürlüklü görseller hazırlanıyor...');

    // Wait for any images to complete rendering
    await new Promise((resolve) => setTimeout(resolve, 300));

    onProgress?.(35, 'Sayfalar A4 formatında taranıyor ve çiziliyor...');

    const canvas = await html2canvas(element, {
      scale: 2, // High resolution for crisp text & vector graphics
      useCORS: true,
      allowTaint: true,
      backgroundColor: element.getAttribute('data-theme') === 'light' ? '#FFFFFF' : '#07111F',
      logging: false,
      windowWidth: 1200,
    });

    onProgress?.(70, 'PDF sayfaları derleniyor ve sayfa kesimleri oluşturuluyor...');

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Add additional pages if content spans across multiple A4 pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    onProgress?.(95, 'PDF dosyası kaydediliyor...');
    pdf.save(fileName);

    onProgress?.(100, 'Katalog başarıyla indirildi!');
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    return false;
  }
};

/**
 * Triggers the browser's native print engine with optimized A4 CSS
 */
export const triggerCatalogPrint = () => {
  window.print();
};
