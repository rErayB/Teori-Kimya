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
  Upload,
  Image as ImageIcon,
  Focus,
  Target,
  Zap,
  ZapOff,
  Scan,
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
  const [isScanningFile, setIsScanningFile] = useState(false);
  const [isManualScanning, setIsManualScanning] = useState(false);
  const [manualScanMessage, setManualScanMessage] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileScannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedTimeRef = useRef<number>(0);
  const lastScannedCodeRef = useRef<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio Beep Feedback using Web Audio API
  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch (_) {}
  };

  // iOS Safari requires video element to have playsinline and webkit-playsinline attributes
  const enforceVideoPlaysInline = () => {
    try {
      const container = document.getElementById('qr-reader-container');
      if (!container) return;
      const videos = container.querySelectorAll<HTMLVideoElement>('video');
      videos.forEach((video) => {
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('muted', 'true');
        video.muted = true;
        video.setAttribute('autoplay', 'true');
        video.autoplay = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
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

  const checkTorchSupport = () => {
    try {
      const video = document.querySelector<HTMLVideoElement>('#qr-reader-container video');
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        if (track) {
          const caps: any = track.getCapabilities?.() || {};
          setHasTorch(!!caps.torch);
        }
      }
    } catch (_) {}
  };

  const toggleTorch = async () => {
    try {
      const video = document.querySelector<HTMLVideoElement>('#qr-reader-container video');
      if (!video || !video.srcObject) return;
      const track = (video.srcObject as MediaStream).getVideoTracks()[0];
      if (track) {
        const newState = !isTorchOn;
        await track.applyConstraints({ advanced: [{ torch: newState } as any] });
        setIsTorchOn(newState);
      }
    } catch (e) {
      console.warn('Torch toggle error:', e);
    }
  };

  const startCamera = async (targetCameraId?: string) => {
    setIsCameraLoading(true);
    setCameraError(null);
    setManualScanMessage(null);
    setIsTorchOn(false);

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
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          'Tarayıcınız canlı kamera erişimini desteklemiyor veya bağlantınız HTTPS ile korunmuyor. Aşağıdaki "Fotoğraf Çekerek Oku" butonunu kullanabilirsiniz.'
        );
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
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      });
      scannerRef.current = html5QrCode;

      // Dynamic qrbox for 1D and 2D barcodes
      const config = {
        fps: 20,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const width = Math.floor(Math.min(viewfinderWidth * 0.9, 360));
          const height = Math.floor(Math.min(viewfinderHeight * 0.7, 220));
          return { width: Math.max(180, width), height: Math.max(140, height) };
        },
      };

      const onScanSuccess = (decodedText: string) => {
        const now = Date.now();
        if (
          decodedText === lastScannedCodeRef.current &&
          now - lastScannedTimeRef.current < 2500
        ) {
          return;
        }
        lastScannedCodeRef.current = decodedText;
        lastScannedTimeRef.current = now;

        playBeep();
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate([100, 50, 100]);
          } catch (_) {}
        }

        setBarcodeInput(decodedText);
        handleScan(decodedText);
        setManualScanMessage(`Barkod okundu: ${decodedText}`);
      };

      // Camera constraint with HD preference
      const cameraConstraint = targetCameraId || {
        facingMode: 'environment',
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
      };

      try {
        await html5QrCode.start(cameraConstraint, config, onScanSuccess, () => {});
      } catch (firstErr: any) {
        console.warn('First camera start attempt failed, trying fallback:', firstErr);
        try {
          await html5QrCode.start({ facingMode: 'environment' }, config, onScanSuccess, () => {});
        } catch (secErr: any) {
          try {
            await html5QrCode.start({ facingMode: 'user' }, config, onScanSuccess, () => {});
          } catch (userErr: any) {
            const devices = await Html5Qrcode.getCameras().catch(() => []);
            if (devices && devices.length > 0) {
              const rearCam =
                devices.find((d) => /back|rear|arka|environment/i.test(d.label)) ||
                devices[devices.length - 1];
              await html5QrCode.start(rearCam.id, config, onScanSuccess, () => {});
            } else {
              throw firstErr;
            }
          }
        }
      }

      // Force video playsinline for iOS Safari WebKit
      enforceVideoPlaysInline();
      setTimeout(enforceVideoPlaysInline, 150);
      setTimeout(enforceVideoPlaysInline, 500);
      setTimeout(checkTorchSupport, 600);

      setIsCameraActive(true);

      // Populate available cameras in background now that permission is granted
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices && devices.length > 0) {
            setAvailableCameras(devices);
            if (targetCameraId) {
              setActiveCameraId(targetCameraId);
            }
          }
        })
        .catch(() => {});
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
          'Kamera izni reddedildi. iPhone Safari için: Adres çubuğundaki "aA" veya kilit simgesine dokunun > "Web Sitesi Ayarları" > "Kamera: İzin Ver" seçip sayfayı yenileyin. Dilerseniz "Fotoğraf Çekerek Oku" butonunu kullanabilirsiniz.';
      } else if (
        err?.name === 'NotFoundError' ||
        errStr.includes('NotFoundError') ||
        errStr.includes('Requested device not found')
      ) {
        message = 'Cihazınızda kullanılabilir bir kamera bulunamadı. "Fotoğraf Çekerek Oku" seçeneğini deneyebilirsiniz.';
      } else if (err?.name === 'NotReadableError' || errStr.includes('NotReadableError')) {
        message = 'Kamera başka bir uygulama veya sekme tarafından kullanılıyor. Diğer uygulamaları kapatıp tekrar deneyin.';
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
    setIsTorchOn(false);
    setHasTorch(false);
  };

  const handleSwitchCamera = (newCamId: string) => {
    stopCamera().then(() => {
      startCamera(newCamId);
    });
  };

  // Dedicated "🎯 ODAKLA & BARKODU OKU" Manual Trigger Function
  const handleManualFocusAndScan = async () => {
    if (isManualScanning) return;
    setIsManualScanning(true);
    setManualScanMessage(null);

    try {
      const video = document.querySelector<HTMLVideoElement>('#qr-reader-container video');
      if (!video || !video.videoWidth || !video.videoHeight) {
        setManualScanMessage('Kamera görüntüsü henüz hazır değil, lütfen 1 saniye bekleyip tekrar deneyin.');
        setIsManualScanning(false);
        return;
      }

      // Attempt hardware optical focus constraint on active camera track
      try {
        if (video.srcObject) {
          const track = (video.srcObject as MediaStream).getVideoTracks()[0];
          if (track) {
            const caps: any = track.getCapabilities?.() || {};
            if (caps.focusMode?.includes('continuous') || caps.focusMode?.includes('single-shot')) {
              await track.applyConstraints({
                advanced: [{ focusMode: caps.focusMode.includes('continuous') ? 'continuous' : 'single-shot' } as any],
              });
            }
          }
        }
      } catch (_) {}

      // Optical stabilization pause
      await new Promise((resolve) => setTimeout(resolve, 80));

      // Capture high-resolution video frame to offscreen canvas
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        throw new Error('Canvas context alınamadı.');
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      let decodedBarcode: string | null = null;

      // Pass 1: Native Hardware BarcodeDetector API (iOS Safari 17+ / Chrome)
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
          });
          const detected = await barcodeDetector.detect(canvas);
          if (detected && detected.length > 0 && detected[0].rawValue) {
            decodedBarcode = detected[0].rawValue;
          }
        } catch (bdErr) {
          console.warn('Native BarcodeDetector pass failed:', bdErr);
        }
      }

      // Pass 2: High-Resolution Snapshot Blob via Html5Qrcode
      if (!decodedBarcode) {
        try {
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
          if (blob) {
            const file = new File([blob], 'snapshot.jpg', { type: 'image/jpeg' });
            let fileScanner = fileScannerRef.current;
            if (!fileScanner) {
              fileScanner = new Html5Qrcode('qr-reader-file-target', {
                formatsToSupport: [
                  Html5QrcodeSupportedFormats.EAN_13,
                  Html5QrcodeSupportedFormats.EAN_8,
                  Html5QrcodeSupportedFormats.UPC_A,
                  Html5QrcodeSupportedFormats.UPC_E,
                  Html5QrcodeSupportedFormats.CODE_128,
                  Html5QrcodeSupportedFormats.CODE_39,
                  Html5QrcodeSupportedFormats.QR_CODE,
                ],
                verbose: false,
              });
              fileScannerRef.current = fileScanner;
            }
            decodedBarcode = await fileScanner.scanFile(file, false);
          }
        } catch (scanErr) {
          console.warn('Canvas blob scan failed:', scanErr);
        }
      }

      // Pass 3: Contrast Enhancement Pass for glossy/damaged barrel barcode labels
      if (!decodedBarcode) {
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imgData.data;
          const contrast = 1.45;
          const intercept = 128 * (1 - contrast);
          for (let i = 0; i < d.length; i += 4) {
            const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            const enhanced = Math.min(255, Math.max(0, gray * contrast + intercept));
            d[i] = enhanced;
            d[i + 1] = enhanced;
            d[i + 2] = enhanced;
          }
          ctx.putImageData(imgData, 0, 0);

          if ('BarcodeDetector' in window) {
            try {
              const barcodeDetector = new (window as any).BarcodeDetector({
                formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
              });
              const detected = await barcodeDetector.detect(canvas);
              if (detected && detected.length > 0 && detected[0].rawValue) {
                decodedBarcode = detected[0].rawValue;
              }
            } catch (_) {}
          }

          if (!decodedBarcode && fileScannerRef.current) {
            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
            if (blob) {
              const file = new File([blob], 'enhanced.jpg', { type: 'image/jpeg' });
              decodedBarcode = await fileScannerRef.current.scanFile(file, false);
            }
          }
        } catch (enhErr) {
          console.warn('Enhanced scan pass failed:', enhErr);
        }
      }

      if (decodedBarcode) {
        playBeep();
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate([100, 50, 100]);
          } catch (_) {}
        }
        setBarcodeInput(decodedBarcode);
        handleScan(decodedBarcode);
        setManualScanMessage(`✓ Barkod başarıyla okundu: ${decodedBarcode}`);
      } else {
        setManualScanMessage(
          'Barkod okunamadı. Lütfen kamerayı barkoda 10-15 cm mesafede dik tutarak tekrar "Odakla & Oku" tuşuna basınız veya "Fotoğrafla Oku" butonunu deneyiniz.'
        );
      }
    } catch (err: any) {
      console.error('Manual focus scan error:', err);
      setManualScanMessage('Tarama sırasında hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsManualScanning(false);
    }
  };

  // Instant Photo / File Scan fallback (works 100% on all iPhones, Safari, and in-app webviews)
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningFile(true);
    setCameraError(null);
    setManualScanMessage(null);

    try {
      const formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.QR_CODE,
      ];

      let fileScanner = fileScannerRef.current;
      if (!fileScanner) {
        fileScanner = new Html5Qrcode('qr-reader-file-target', {
          formatsToSupport,
          verbose: false,
        });
        fileScannerRef.current = fileScanner;
      }

      const decodedText = await fileScanner.scanFile(file, false);
      if (decodedText) {
        playBeep();
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(100);
          } catch (_) {}
        }
        setBarcodeInput(decodedText);
        handleScan(decodedText);
        setManualScanMessage(`✓ Fotoğraftan okundu: ${decodedText}`);
      }
    } catch (err: any) {
      console.warn('File scan error:', err);
      setCameraError(
        'Fotoğraftan barkod okunamadı. Lütfen barkodun net, iyi aydınlatılmış ve düz bir şekilde çekildiğinden emin olunuz.'
      );
    } finally {
      setIsScanningFile(false);
      if (e.target) e.target.value = '';
    }
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

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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
                {isCameraLoading ? 'Açılıyor...' : 'Kamera Aç'}
              </Button>
            )}

            {/* Hidden native camera capture & gallery input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileScan}
              className="hidden"
            />
            <div id="qr-reader-file-target" className="hidden" />

            {/* Instant Photo / Snapshot Barcode Scan Button */}
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanningFile}
              icon={isScanningFile ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              title="iPhone kamerasından fotoğraf çekerek veya galeriden seçerek barkod oku"
            >
              {isScanningFile ? 'Okunuyor...' : 'Fotoğrafla Oku'}
            </Button>
          </div>
        </form>

        {/* Camera Error Message with One-Click Photo Fallback */}
        {cameraError && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Kamera Başlatılamadı</p>
                <p className="mt-0.5 text-red-300 leading-relaxed">{cameraError}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <Button
                size="sm"
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                icon={<Upload className="w-3.5 h-3.5" />}
              >
                Fotoğrafla Oku
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => startCamera()}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Tekrar Dene
              </Button>
            </div>
          </div>
        )}

        {/* Live Camera Viewport Container (always active or during loading so DOM width/height exist) */}
        <div className={`space-y-3 ${isCameraActive || isCameraLoading ? 'block' : 'hidden'}`}>
          <div className="relative w-full rounded-2xl overflow-hidden bg-black border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center min-h-[340px]">
            {/* Target DOM Element for Html5Qrcode */}
            <div id="qr-reader-container" className="w-full max-w-md mx-auto min-h-[300px]" />

            {/* Viewfinder Target Frame & Laser Scan Beam Animation */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 p-6">
                <div className="relative w-[280px] h-[180px] sm:w-[320px] sm:h-[200px] border-2 border-cyan-400/50 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                  {/* Corner Targets */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />

                  {/* Animated Red/Cyan Laser Beam */}
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_#06b6d4] animate-scan-laser" />

                  {/* Center Target Reticle */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <Focus className="w-12 h-12 text-cyan-300" />
                  </div>
                </div>
              </div>
            )}

            {/* Loading Indicator inside scanner container */}
            {isCameraLoading && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30 p-4 text-center">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="font-bold text-white text-sm">Kamera Başlatılıyor...</p>
                <p className="text-xs text-slate-300 max-w-xs">
                  Lütfen ekranda çıkan kamera izin kutusunda <strong>"İzin Ver"</strong> seçeneğine basınız.
                </p>
              </div>
            )}

            {/* Top Bar: Camera Active Badge & Quick Controls */}
            {isCameraActive && (
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-auto">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono backdrop-blur-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Canlı Kamera</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Torch / Flash Toggle Button */}
                  {hasTorch && (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      className={`p-2 rounded-xl border backdrop-blur-md transition-colors cursor-pointer ${
                        isTorchOn
                          ? 'bg-amber-500 text-black border-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                          : 'bg-slate-900/90 text-slate-200 border-cyan-500/40 hover:text-white'
                      }`}
                      title={isTorchOn ? 'Flaşı Kapat' : 'Flaşı Aç'}
                    >
                      {isTorchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                    </button>
                  )}

                  {/* Camera Switcher for Multi-Camera iPhones */}
                  {availableCameras.length > 1 && (
                    <select
                      value={activeCameraId || ''}
                      onChange={(e) => handleSwitchCamera(e.target.value)}
                      className="bg-slate-900/90 border border-cyan-400/40 text-white text-xs rounded-xl px-2.5 py-1.5 backdrop-blur-md cursor-pointer focus:outline-none"
                    >
                      {availableCameras.map((cam, idx) => (
                        <option key={cam.id} value={cam.id}>
                          {cam.label || `Lens ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Stop Camera Button */}
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-red-900/90 hover:bg-red-800 border border-red-500 text-white text-xs font-bold flex items-center gap-1 backdrop-blur-md cursor-pointer shadow-md"
                    title="Kamerayı Kapat"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Kapat</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Prominent Focus & Scan Shutter Button */}
          {isCameraActive && (
            <div className="flex flex-col items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleManualFocusAndScan}
                disabled={isManualScanning}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95 transition-all cursor-pointer border-2 border-white/60"
              >
                {isManualScanning ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin text-black" />
                    <span>Odaklanıyor ve Taranıyor...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-6 h-6 text-black animate-pulse" />
                    <span>🎯 ODAKLA & BARKODU OKU</span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-cyan-300 font-mono">
                Barkodu çerçeveye hizalayın ve <strong>"ODAKLA & BARKODU OKU"</strong> tuşuna basarak anında okutun.
              </p>
            </div>
          )}

          {/* Manual Scan Feedback Message */}
          {manualScanMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in ${
                manualScanMessage.startsWith('✓')
                  ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 font-medium'
                  : 'bg-amber-950/70 border border-amber-500/50 text-amber-200'
              }`}
            >
              {manualScanMessage.startsWith('✓') ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="flex-1">{manualScanMessage}</span>
            </div>
          )}
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
