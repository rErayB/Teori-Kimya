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
  CameraOff,
  RefreshCw,
  X,
  Volume2,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
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
  const [quickSellError, setQuickSellError] = useState<string | null>(null);

  // Real Camera Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedTimeRef = useRef<number>(0);
  const lastScannedCodeRef = useRef<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // iOS Safari requires video element to have playsinline and webkit-playsinline attributes
  const enforceVideoPlaysInline = () => {
    try {
      const videos = document.querySelectorAll<HTMLVideoElement>('#qr-reader-container video');
      videos.forEach((video) => {
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('muted', 'true');
        video.muted = true;
        video.play?.().catch(() => {});
      });
    } catch (_) {}
  };

  // Focus input automatically on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Teardown camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleScan = (codeToScan?: string) => {
    const code = (codeToScan || barcodeInput).trim();
    if (!code) return;

    setQuickSellSuccess(null);
    setQuickSellError(null);
    const prod = repository.getProductByBarcode(code);

    if (prod) {
      setScannedProduct(prod);
      setNotFoundBarcode(null);
    } else {
      setScannedProduct(null);
      setNotFoundBarcode(code);
    }
  };

  const startCamera = async (targetCameraId?: string) => {
    setIsCameraLoading(true);
    setCameraError(null);

    try {
      // 1. Teardown any existing instance first
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          await scannerRef.current.clear();
        } catch (_) {}
        scannerRef.current = null;
      }

      // Check if mediaDevices is supported
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Tarayıcınız kamera erişimini desteklemiyor veya bağlantınız HTTPS ile korunmuyor. Netlify üzerinden HTTPS bağlantısı kullandığınızdan emin olun.'
        );
      }

      // Query devices if possible
      let cameraToUse: any = { facingMode: 'environment' };
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setAvailableCameras(devices);
          if (targetCameraId) {
            cameraToUse = targetCameraId;
            setActiveCameraId(targetCameraId);
          } else {
            // Find rear camera on iPhone/Android
            const rearCamera =
              devices.find((d) => /back|rear|arka|environment|telephoto|wide/i.test(d.label)) ||
              devices[devices.length - 1]; // On iOS, back camera is usually last
            cameraToUse = rearCamera.id;
            setActiveCameraId(rearCamera.id);
          }
        }
      } catch (devErr) {
        console.warn('Could not enumerate cameras, falling back to facingMode:', devErr);
        cameraToUse = { facingMode: 'environment' };
      }

      const formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.QR_CODE,
      ];

      const html5QrCode = new Html5Qrcode('qr-reader-container', {
        formatsToSupport,
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 280, height: 180 },
        aspectRatio: 1.333333,
      };

      const onScanSuccess = (decodedText: string) => {
        // Debounce duplicate scans within 2.5 seconds
        const now = Date.now();
        if (
          decodedText === lastScannedCodeRef.current &&
          now - lastScannedTimeRef.current < 2500
        ) {
          return;
        }
        lastScannedCodeRef.current = decodedText;
        lastScannedTimeRef.current = now;

        // Haptic feedback on supported mobile devices
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(100);
          } catch (_) {}
        }

        setBarcodeInput(decodedText);
        handleScan(decodedText);
      };

      try {
        await html5QrCode.start(cameraToUse, config, onScanSuccess, () => {});
      } catch (firstErr) {
        console.warn('First camera start attempt failed, falling back to environment facingMode:', firstErr);
        // Fallback for iOS Safari if specific camera ID failed
        await html5QrCode.start({ facingMode: 'environment' }, config, onScanSuccess, () => {});
      }

      // Force video playsinline for iOS Safari
      enforceVideoPlaysInline();
      setTimeout(enforceVideoPlaysInline, 200);
      setTimeout(enforceVideoPlaysInline, 600);

      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera initialization error:', err);
      let message = 'Kamera başlatılamadı.';
      const errStr = err?.message || String(err);

      if (
        err?.name === 'NotAllowedError' ||
        errStr.includes('NotAllowedError') ||
        errStr.includes('Permission denied')
      ) {
        message =
          'Kamera izni reddedildi. iOS Safari kullanıyorsanız: Adres çubuğundaki "aA" veya kilit simgesine dokunun > "Web Sitesi Ayarları" > "Kamera" seçeneğini "İzin Ver" olarak değiştirin ve sayfayı yenileyin.';
      } else if (
        err?.name === 'NotFoundError' ||
        errStr.includes('NotFoundError') ||
        errStr.includes('Requested device not found')
      ) {
        message = 'Cihazınızda kullanılabilir bir kamera bulunamadı.';
      } else if (err?.name === 'NotReadableError' || errStr.includes('NotReadableError')) {
        message = 'Kamera başka bir uygulama veya sekme tarafından kullanılıyor olabilir.';
      } else {
        message = `Kamera hatası: ${errStr}`;
      }

      setCameraError(message);
      setIsCameraActive(false);
    } finally {
      setIsCameraLoading(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (e) {
        console.warn('Scanner stop error:', e);
      }
      scannerRef.current = null;
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
  };

  const handleSwitchCamera = (newCamId: string) => {
    stopCamera().then(() => {
      startCamera(newCamId);
    });
  };

  const handleQuickSale = () => {
    if (!scannedProduct) return;
    setQuickSellError(null);
    setQuickSellSuccess(null);

    if (scannedProduct.stock < quickSellQuantity) {
      setQuickSellError(`Yetersiz stok! Mevcut stok: ${scannedProduct.stock} ${scannedProduct.unit}`);
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
    } else {
      setQuickSellError(result.error || 'Satış işlemi tamamlanamadı.');
    }
  };

  const sampleBarcodes = repository.getProducts().slice(0, 5);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
          <QrCode className="w-3.5 h-3.5 animate-pulse" />
          Mobil Canlı Kamera & El Terminali Lazer Destekli
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          Barkod / QR Tarama & Kamera Terminali
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Cihazınızın kamerasını açarak canlı barkod tarayabilir, USB/Bluetooth el terminali okutabilir veya elle barkod yazabilirsiniz.
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
            
            {isCameraActive ? (
              <Button
                type="button"
                variant="danger"
                size="lg"
                onClick={stopCamera}
                icon={<CameraOff className="w-5 h-5" />}
                title="Kamerayı Kapat"
              >
                Kamerayı Kapat
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => startCamera()}
                disabled={isCameraLoading}
                icon={isCameraLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                title="Canlı Kamerayı Başlat"
              >
                {isCameraLoading ? 'Kamera Açılıyor...' : 'Kamera Aç'}
              </Button>
            )}
          </div>
        </form>

        {/* Camera Error Message */}
        {cameraError && (
          <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Kamera Başlatılamadı</p>
                <p className="mt-0.5 text-red-300">{cameraError}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => startCamera()}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Tekrar Dene
            </Button>
          </div>
        )}

        {/* Live Camera Viewport Container */}
        <div className={`space-y-3 ${isCameraActive ? 'block' : 'hidden'}`}>
          <div className="relative w-full rounded-2xl overflow-hidden bg-black border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.35)] flex flex-col items-center justify-center min-h-[300px]">
            {/* Live Camera Stream Container target for Html5Qrcode */}
            <div id="qr-reader-container" className="w-full max-w-md mx-auto" />

            {/* Visual Guide Overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-cyan-400/40 text-cyan-300 text-xs font-mono backdrop-blur-sm pointer-events-none z-10">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Canlı Kamera Aktif (EAN-13, EAN-8, UPC, QR)</span>
            </div>

            {/* Camera Switcher for Multi-Camera iPhones */}
            {availableCameras.length > 1 && (
              <div className="absolute top-3 right-3 z-10">
                <select
                  value={activeCameraId || ''}
                  onChange={(e) => handleSwitchCamera(e.target.value)}
                  className="bg-slate-900/90 border border-cyan-400/40 text-white text-xs rounded-lg px-2 py-1 backdrop-blur cursor-pointer"
                >
                  {availableCameras.map((cam, idx) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `Kamera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="absolute bottom-3 right-3 z-10">
              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-1.5 rounded-xl bg-red-900/80 hover:bg-red-800 border border-red-500 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur cursor-pointer"
              >
                <X className="w-4 h-4" />
                Durdur
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-cyan-300 font-mono">
            Barkod veya QR kodu yeşil çerçevenin ortasına hizalayınız. Otomatik algılanır.
          </p>
        </div>

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

      {/* Error Notification Alert */}
      {quickSellError && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{quickSellError}</span>
        </div>
      )}

      {/* Product Found Details Card */}
      {scannedProduct && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0B1B2E] via-[#102A43] to-[#0B1B2E] border-2 border-cyan-500/40 shadow-2xl space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
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
              <span className="text-[10px] text-slate-400">+%{scannedProduct.vatRate} KDV</span>
            </div>
          </div>

          {/* Key Product Chemistry & Stock Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#07111F]/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Mevcut Stok</span>
              <p
                className={`text-lg font-black ${
                  scannedProduct.stock <= 0
                    ? 'text-red-500'
                    : scannedProduct.stock <= scannedProduct.minStock
                    ? 'text-amber-400'
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
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Birim Alış Maliyeti</span>
              <p className="text-lg font-black text-slate-200">
                {scannedProduct.purchasePrice.toLocaleString('tr-TR')} ₺
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
                  type="button"
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
                  type="button"
                  onClick={() => setQuickSellQuantity(quickSellQuantity + 1)}
                  className="px-2.5 py-1 text-slate-300 hover:text-white font-bold"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-slate-400 ml-2">
                Toplam: {(quickSellQuantity * scannedProduct.salePrice).toLocaleString('tr-TR')} ₺
              </span>
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
                Kasa / POS'a Git
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Not Found State */}
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
              Bu ürünü sisteminize yeni kimyasal mamül veya hammadde olarak hemen ekleyebilirsiniz.
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
