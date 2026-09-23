import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Barcode,
  Search,
  ShoppingCart,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  Printer,
  Sparkles,
  Camera,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Product } from '../../types';
import { repository } from '../../services/storage';

interface BarcodeScannerViewProps {
  onNavigate: (tab: string) => void;
  onOpenAddProductWithBarcode?: (barcode: string) => void;
}

export const BarcodeScannerView: React.FC<BarcodeScannerViewProps> = ({
  onNavigate,
  onOpenAddProductWithBarcode,
}) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const [quickSellQuantity, setQuickSellQuantity] = useState(1);
  const [quickSellSuccess, setQuickSellSuccess] = useState<string | null>(null);
  const [isSimulatingCamera, setIsSimulatingCamera] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = (codeToScan?: string) => {
    const code = (codeToScan || barcodeInput).trim();
    if (!code) return;

    setQuickSellSuccess(null);
    const prod = repository.getProductByBarcode(code);

    if (prod) {
      setScannedProduct(prod);
      setNotFoundBarcode(null);
    } else {
      setScannedProduct(null);
      setNotFoundBarcode(code);
    }
  };

  const handleQuickSale = () => {
    if (!scannedProduct) return;
    if (scannedProduct.stock < quickSellQuantity) {
      alert(`Yetersiz stok! Mevcut stok: ${scannedProduct.stock}`);
      return;
    }

    const company = repository.getCompany();
    const result = repository.createSale({
      customerName: 'Hızlı Barkod Satışı',
      paymentMethod: 'cash',
      items: [
        {
          productId: scannedProduct.id,
          quantity: quickSellQuantity,
          unitPrice: scannedProduct.salePrice,
          discountRate: 0,
        },
      ],
      notes: 'Barkod Okutucu Hızlı Kasa Satışı',
      cashierName: company.contactPerson,
    });

    if (result.success && result.sale) {
      setQuickSellSuccess(
        `${quickSellQuantity} adet "${scannedProduct.name}" satışı tamamlandı. Fiş No: ${result.sale.invoiceNo}`
      );
      // Refresh scanned product data
      const updated = repository.getProductById(scannedProduct.id);
      if (updated) setScannedProduct(updated);
    }
  };

  const sampleBarcodes = repository.getProducts().slice(0, 4);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
          <QrCode className="w-3.5 h-3.5 animate-pulse" />
          Klavye & Kamera / El Terminali Destekli
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          Barkod / QR Tarama Terminali
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          El terminali veya barkod okuyucu lazeri ile okutulan kodlar anında algılanır. Manuel kod girişi için alana yazıp Enter tuşuna basabilirsiniz.
        </p>
      </div>

      {/* Main Scan Input Card */}
      <div className="p-6 rounded-2xl bg-[#0B1B2E] border border-cyan-500/30 shadow-2xl space-y-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Barcode className="w-6 h-6 text-cyan-400 absolute left-4 top-3.5 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Barkod okutun veya yazın..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full bg-[#102A43] border-2 border-cyan-500/40 rounded-xl pl-12 pr-4 py-3 text-sm sm:text-base font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-300 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="submit"
              size="lg"
              className="flex-1 sm:flex-none"
              icon={<Search className="w-4 h-4" />}
            >
              Sorgula
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                setIsSimulatingCamera(!isSimulatingCamera);
              }}
              title="Kamera Simülatörü"
            >
              <Camera className="w-5 h-5 text-cyan-400" />
            </Button>
          </div>
        </form>

        {/* Demo Fast Scan Quick Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 shrink-0 font-medium">Hızlı Test Kodları:</span>
          {sampleBarcodes.map((sb) => (
            <button
              key={sb.id}
              onClick={() => {
                setBarcodeInput(sb.barcode);
                handleScan(sb.barcode);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-900/40 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-200 font-mono transition-colors cursor-pointer shrink-0"
            >
              {sb.name.slice(0, 16)}... ({sb.barcode})
            </button>
          ))}
        </div>

        {/* Camera Optical Reader Visual Simulation */}
        {isSimulatingCamera && (
          <div className="relative w-full h-48 rounded-xl bg-black/80 border-2 border-dashed border-cyan-400 flex flex-col items-center justify-center overflow-hidden animate-in zoom-in-95">
            {/* Moving Laser line */}
            <div className="absolute inset-x-4 h-0.5 bg-red-500 shadow-[0_0_12px_#ff0000] animate-bounce" />
            <QrCode className="w-16 h-16 text-cyan-400/40" />
            <p className="text-xs text-cyan-300 mt-2 font-mono">
              Optik Kamera Alanı Aktif — Barkodu hedefe tutunuz
            </p>
          </div>
        )}
      </div>

      {/* Success Notification Alert */}
      {quickSellSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{quickSellSuccess}</span>
          </div>
          <button
            onClick={() => onNavigate('invoices')}
            className="underline font-bold hover:text-emerald-200 cursor-pointer"
          >
            Faturayı Gör
          </button>
        </div>
      )}

      {/* Product Found Details Card */}
      {scannedProduct && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0B1B2E] via-[#102A43] to-[#0B1B2E] border-2 border-cyan-500/40 shadow-2xl space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  {scannedProduct.code}
                </span>
                <span className="font-mono text-xs text-slate-300 flex items-center gap-1">
                  <Barcode className="w-3.5 h-3.5 text-cyan-400" />
                  {scannedProduct.barcode}
                </span>
                <Badge variant={scannedProduct.active ? 'success' : 'neutral'} size="sm">
                  {scannedProduct.active ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">{scannedProduct.name}</h3>
              <p className="text-xs text-slate-300 mt-1">{scannedProduct.description}</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Satış Fiyatı</span>
              <div className="text-2xl sm:text-3xl font-black text-[#8DE7F2]">
                {scannedProduct.salePrice.toLocaleString('tr-TR')} ₺
              </div>
              <span className="text-[10px] text-slate-400">+%20 KDV Dahil</span>
            </div>
          </div>

          {/* Key Product Chemistry & Stock Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#07111F]/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Mevcut Stok</span>
              <p
                className={`text-lg font-black ${
                  scannedProduct.stock <= scannedProduct.minStock
                    ? 'text-red-400'
                    : 'text-emerald-400'
                }`}
              >
                {scannedProduct.stock} {scannedProduct.unit}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#07111F]/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Kategori</span>
              <p className="text-xs font-bold text-white truncate">{scannedProduct.category}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#07111F]/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">pH Değeri</span>
              <p className="text-lg font-black text-cyan-300">
                {scannedProduct.phValue ? scannedProduct.phValue : 'Nötr (7)'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#07111F]/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Depo Rafı</span>
              <p className="text-sm font-bold text-slate-200">
                {scannedProduct.shelfLocation || 'A-01'}
              </p>
            </div>
          </div>

          {/* Direct POS / Quick Sell Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-cyan-500/20">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-semibold">Miktar:</span>
              <div className="flex items-center bg-[#102A43] border border-cyan-500/30 rounded-xl p-0.5">
                <button
                  onClick={() => setQuickSellQuantity(Math.max(1, quickSellQuantity - 1))}
                  className="px-2.5 py-1 text-slate-300 hover:text-white font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={scannedProduct.stock}
                  value={quickSellQuantity}
                  onChange={(e) => setQuickSellQuantity(parseInt(e.target.value) || 1)}
                  className="w-12 text-center bg-transparent text-white font-bold text-xs"
                />
                <button
                  onClick={() => setQuickSellQuantity(quickSellQuantity + 1)}
                  className="px-2.5 py-1 text-slate-300 hover:text-white font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onClick={handleQuickSale}
                disabled={scannedProduct.stock <= 0}
                icon={<ShoppingCart className="w-4 h-4" />}
              >
                Hemen Sat (Nakit)
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('pos')}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                POS Sepetine Git
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Not Found State (Requirement: Prompt to add as new product with prefilled barcode) */}
      {notFoundBarcode && (
        <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-center space-y-4 animate-in slide-in-from-bottom-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Bu Barkoda Kayıtlı Ürün Bulunamadı</h3>
            <p className="text-xs text-slate-300 font-mono">
              Barkod Numarası: <span className="text-amber-300 font-bold">{notFoundBarcode}</span>
            </p>
            <p className="text-xs text-slate-400">
              Bu ürünü sisteminize yeni kimyasal mamül olarak hemen ekleyebilirsiniz.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              onClick={() => {
                if (onOpenAddProductWithBarcode) {
                  onOpenAddProductWithBarcode(notFoundBarcode);
                } else {
                  onNavigate('products');
                }
              }}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Yeni Ürün Olarak Ekle
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
