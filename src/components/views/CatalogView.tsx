import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  Droplets,
  Layers,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  Download,
  Printer,
  DollarSign,
  EyeOff,
  Sliders,
  Grid3X3,
  LayoutGrid,
  List,
  Table as TableIcon,
  FileText,
  Upload,
  Image as ImageIcon,
  Check,
  Building,
  Globe,
  MapPin,
  Calendar,
  Zap,
  Info,
  ChevronRight,
  Sun,
  Moon,
  CheckSquare,
  Square,
  Share2,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Product, ProductCategory, UserRole } from '../../types';
import { repository } from '../../services/storage';
import { ProductVisual } from '../common/ProductVisual';
import { generateCatalogPdf, generateDirectCatalogPdf, triggerCatalogPrint, downloadPdfBlob } from '../../utils/catalogPdf';

interface CatalogViewProps {
  userRole?: UserRole;
  onAddToCart?: (product: Product) => void;
}

type ViewMode = 'grid' | 'brochure' | 'table' | 'a4_preview';
type PriceFormat = 'net' | 'vat_included' | 'with_discount';
type CatalogTheme = 'dark' | 'light';

export const CatalogView: React.FC<CatalogViewProps> = ({ userRole = 'authorized', onAddToCart }) => {
  const [products, setProducts] = useState<Product[]>(repository.getProducts());
  const [company, setCompany] = useState(repository.getCompany());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Hepsi');
  const [stockOnly, setStockOnly] = useState(false);

  // Selected Products for Custom Catalog (Empty means ALL filtered products)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Key Catalog Configuration Options (User Request: "fiyat açma kapama olsun")
  const [showPrices, setShowPrices] = useState<boolean>(true);
  const [priceFormat, setPriceFormat] = useState<PriceFormat>('net');
  const [showSpecs, setShowSpecs] = useState<boolean>(true);
  const [showBarcodes, setShowBarcodes] = useState<boolean>(true);
  const [showStockStatus, setShowStockStatus] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [catalogTheme, setCatalogTheme] = useState<CatalogTheme>('dark');

  // Modals & Actions
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imageUploadProduct, setImageUploadProduct] = useState<Product | null>(null);
  const [imageFileUrl, setImageFileUrl] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<{ percent: number; message: string } | null>(null);
  const [generatedPdfResult, setGeneratedPdfResult] = useState<{ url: string; fileName: string; blob?: Blob } | null>(null);

  // File Input Ref for Photo Upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = repository.subscribe(() => {
      setProducts(repository.getProducts());
      setCompany(repository.getCompany());
    });
    return unsub;
  }, []);

  const categories = ['Hepsi', ...new Set(products.map((p) => p.category))];

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (!p.active) return false;
    const matchCat = selectedCategory === 'Hepsi' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.barcode.includes(q);
    const matchStock = !stockOnly || p.stock > 0;
    return matchCat && matchQuery && matchStock;
  });

  // Effective products for PDF / Catalog output
  const activeCatalogProducts =
    selectedProductIds.length > 0
      ? filteredProducts.filter((p) => selectedProductIds.includes(p.id))
      : filteredProducts;

  // Toggle single product selection
  const toggleProductSelect = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all or clear
  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  // Group products by category for structured catalog brochure & PDF
  const productsByCategory = activeCatalogProducts.reduce((acc, prod) => {
    if (!acc[prod.category]) {
      acc[prod.category] = [];
    }
    acc[prod.category].push(prod);
    return acc;
  }, {} as Record<ProductCategory, Product[]>);

  // Calculate Display Price
  const getDisplayPrice = (product: Product) => {
    if (!showPrices) return null;
    let basePrice = product.salePrice;
    if (priceFormat === 'with_discount' && product.discountRate > 0) {
      basePrice = basePrice * (1 - product.discountRate / 100);
    }
    if (priceFormat === 'vat_included') {
      basePrice = basePrice * (1 + (product.vatRate || 20) / 100);
    }
    return basePrice;
  };

  // Handle PDF Export
  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    setGeneratedPdfResult(null);
    setPdfProgress({ percent: 15, message: 'PDF Motoru ve A4 sayfaları başlatılıyor...' });

    const fileName = `Teori_Kimya_${showPrices ? 'Fiyatli' : 'Fiyatsiz'}_Katalog_${
      new Date().toISOString().split('T')[0]
    }.pdf`;

    // Direct vector & photo generator: fast, beautiful, 100% reliable on iOS & Android
    const result = generateDirectCatalogPdf(
      activeCatalogProducts,
      company,
      {
        showPrices,
        priceFormat,
        showStock: showStockStatus,
        showSpecs,
        theme: catalogTheme,
      },
      fileName,
      (percent, message) => {
        setPdfProgress({ percent, message });
      }
    );

    if (result.success && result.url) {
      setGeneratedPdfResult({
        url: result.url,
        fileName,
        blob: result.blob,
      });
      setPdfProgress({ percent: 100, message: 'PDF Başarıyla Oluşturuldu ve İndirildi!' });
    } else {
      setPdfProgress({ percent: 100, message: result.error || 'PDF oluşturulamadı.' });
      setTimeout(() => {
        setIsGeneratingPdf(false);
      }, 3000);
    }
  };

  // Handle Photo File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && imageUploadProduct) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        repository.updateProduct(imageUploadProduct.id, {
          image: base64,
        });
        setImageUploadProduct(null);
        setImageFileUrl('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Image from URL
  const handleSaveImageUrl = () => {
    if (imageUploadProduct && imageFileUrl.trim()) {
      repository.updateProduct(imageUploadProduct.id, {
        image: imageFileUrl.trim(),
      });
      setImageUploadProduct(null);
      setImageFileUrl('');
    }
  };

  // Remove Custom Image
  const handleRemoveImage = () => {
    if (imageUploadProduct) {
      repository.updateProduct(imageUploadProduct.id, {
        image: '',
      });
      setImageUploadProduct(null);
      setImageFileUrl('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hidden file input for product photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Main Top Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#071322] via-[#0B1B2E] to-[#163A5F] border-2 border-cyan-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-400/40">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>TEORİ KİMYA • B2B ENDÜSTRİYEL ÜRÜN PORTFÖYÜ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            DİJİTAL ÜRÜN KATALOĞU & PDF OLUŞTURUCU
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Yüksek konsantrasyonlu endüstriyel formüller, pH değerleri, seyreltme oranları ve güvenlik yönergeleri. 
            Müşterileriniz ve bayileriniz için anında <strong>fiyatlı veya fiyatsız A4 PDF kataloğu</strong> oluşturup indirin.
          </p>
        </div>

        {/* Action Buttons: PDF Export & Print */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 w-full lg:w-auto z-10">
          <Button
            onClick={handleExportPdf}
            disabled={isGeneratingPdf || activeCatalogProducts.length === 0}
            icon={<Download className="w-4 h-4" />}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-black font-black shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-300 py-3"
          >
            {isGeneratingPdf ? 'PDF Hazırlanıyor...' : '📄 PDF Kataloğu İndir'}
          </Button>

          <Button
            variant="outline"
            onClick={triggerCatalogPrint}
            icon={<Printer className="w-4 h-4" />}
            className="w-full sm:w-auto border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-200"
          >
            🖨️ Yazdır / A4 Kaydet
          </Button>

          <div className="text-[11px] text-cyan-300 font-mono flex items-center gap-1.5 justify-end">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {activeCatalogProducts.length} Ürün Hazır • Güncel Versiyon {new Date().toLocaleDateString('tr-TR')}
          </div>
        </div>
      </div>

      {/* Catalog Customization & Control Hub (User Request: "fiyat açma kapama", layout, filters) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/25 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          {/* Price Toggle & Status Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#07111F] border border-cyan-500/30">
              <button
                type="button"
                onClick={() => setShowPrices(!showPrices)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  showPrices
                    ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {showPrices ? <DollarSign className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{showPrices ? 'FİYATLAR AÇIK (GÖSTERİLİYOR)' : 'FİYATLAR KAPALI (GİZLİ)'}</span>
              </button>

              {showPrices && (
                <select
                  value={priceFormat}
                  onChange={(e) => setPriceFormat(e.target.value as PriceFormat)}
                  className="bg-[#0B1B2E] border border-cyan-500/30 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="net">Liste Fiyatı (KDV Hariç)</option>
                  <option value="vat_included">KDV Dahil Fiyat (+%20)</option>
                  <option value="with_discount">İskontolu Fiyat</option>
                </select>
              )}
            </div>

            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                showPrices
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
            >
              {showPrices ? '✓ Bayi / Müşteri Satış Kataloğu' : '🔒 Fiyatsız Genel Tanıtım Kataloğu'}
            </span>
          </div>

          {/* View Mode & Theme Switcher */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle (Dark Cyber vs Clean Print Light) */}
            <button
              type="button"
              onClick={() => setCatalogTheme(catalogTheme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                catalogTheme === 'light'
                  ? 'bg-amber-400 text-black border-amber-300 font-bold'
                  : 'bg-[#07111F] text-slate-300 border-cyan-500/30 hover:text-white'
              }`}
              title="Katalog Tema Seçimi (Siber Koyu / Yazıcı Dostu Açık)"
            >
              {catalogTheme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {catalogTheme === 'light' ? 'Açık Tema (Yazıcı)' : 'Koyu Tema'}
              </span>
            </button>

            {/* View Mode Pills */}
            <div className="flex items-center bg-[#07111F] p-1 rounded-xl border border-cyan-500/30 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg flex items-center gap-1 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="4'lü Kart Izgara"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden md:inline">Izgara</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('brochure')}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg flex items-center gap-1 transition-all ${
                  viewMode === 'brochure'
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="2'li Broşür Düzeni"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline">Broşür</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg flex items-center gap-1 transition-all ${
                  viewMode === 'table'
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Teknik Tablo"
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden md:inline">Tablo</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('a4_preview')}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg flex items-center gap-1 transition-all ${
                  viewMode === 'a4_preview'
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Canlı A4 Sayfa Önizleme"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden md:inline">A4 Sayfa</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search, Filter Pills & Select Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Ürün adı, kod, barkod veya etki alanı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#07111F] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Quick Option Toggles */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowSpecs(!showSpecs)}
              className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                showSpecs
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-medium'
                  : 'bg-[#07111F] border-slate-800 text-slate-400'
              }`}
            >
              pH & Teknik Değerler: {showSpecs ? 'Açık' : 'Gizli'}
            </button>

            <button
              type="button"
              onClick={() => setShowBarcodes(!showBarcodes)}
              className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                showBarcodes
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-medium'
                  : 'bg-[#07111F] border-slate-800 text-slate-400'
              }`}
            >
              Barkod / QR: {showBarcodes ? 'Açık' : 'Gizli'}
            </button>

            {/* Custom Selection Button */}
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-3 py-1.5 rounded-xl bg-[#07111F] border border-cyan-500/30 text-cyan-200 hover:text-white flex items-center gap-1.5 font-medium transition-colors"
            >
              {selectedProductIds.length === filteredProducts.length ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Seçimi Kaldır</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {selectedProductIds.length > 0
                      ? `${selectedProductIds.length} Seçili (Hepsini Seç)`
                      : 'Ürün Seçerek Katalogla'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all cursor-pointer ${
                selectedCategory === c
                  ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white font-bold shadow-md'
                  : 'bg-[#07111F] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dynamic Viewport Container */}
      <div
        id="catalog-pdf-export-root"
        data-theme={catalogTheme}
        className={`rounded-3xl p-4 sm:p-6 transition-all duration-300 ${
          catalogTheme === 'light'
            ? 'bg-white text-slate-900 border-2 border-slate-300 shadow-2xl'
            : 'bg-[#07111F] text-slate-100 border border-cyan-500/20'
        }`}
      >
        {/* Printable/Export Cover Header inside PDF / Print */}
        <div
          className={`p-6 rounded-2xl mb-6 border ${
            catalogTheme === 'light'
              ? 'bg-slate-100 border-slate-300 text-slate-900'
              : 'bg-gradient-to-r from-[#0B1B2E] via-[#102A43] to-[#07111F] border-cyan-500/30 text-white'
          } flex flex-col md:flex-row items-start md:items-center justify-between gap-4 catalog-avoid-break`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400" />
              <h2 className="text-xl sm:text-2xl font-black tracking-wider uppercase">
                {company.name}
              </h2>
            </div>
            <p className={`text-xs ${catalogTheme === 'light' ? 'text-slate-600' : 'text-cyan-200'}`}>
              {company.subtitle}
            </p>
            <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 pt-1">
              <span>📍 {company.address}</span>
              <span>•</span>
              <span>🏛️ {company.taxOffice} / No: {company.taxNumber}</span>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border text-xs text-right space-y-1 ${
              catalogTheme === 'light'
                ? 'bg-white border-slate-300'
                : 'bg-[#07111F]/80 border-cyan-500/20'
            }`}
          >
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Doğrudan Sipariş & Satış Danışmanı
            </span>
            <p className="font-bold flex items-center gap-1.5 justify-end">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              {company.phone}
            </p>
            <p className="font-medium text-cyan-400">{company.contactPerson}</p>
            <p className="text-[10px] text-slate-400">{company.email}</p>
          </div>
        </div>

        {/* ViewMode: 1) 4-Grid Cards */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeCatalogProducts.map((p) => {
              const displayPrice = getDisplayPrice(p);
              const isSelected = selectedProductIds.includes(p.id);

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between shadow-lg space-y-3 group catalog-avoid-break relative ${
                    catalogTheme === 'light'
                      ? 'bg-slate-50 border-slate-200 hover:border-cyan-600'
                      : 'bg-[#0B1B2E] border-cyan-500/20 hover:border-cyan-400/50'
                  } ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-black' : ''}`}
                >
                  {/* Select Checkbox on Card */}
                  <button
                    type="button"
                    onClick={() => toggleProductSelect(p.id)}
                    className="absolute top-6 left-6 z-20 p-1.5 rounded-lg bg-black/70 backdrop-blur text-white hover:text-cyan-300 border border-white/20 transition-all cursor-pointer no-print"
                    title={isSelected ? 'Katalogdan Çıkar' : 'Kataloğa Ekle'}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <div>
                    {/* Visual Container / Uploaded Photo */}
                    <div className="relative">
                      <ProductVisual
                        image={p.image}
                        name={p.name}
                        code={p.code}
                        category={p.category}
                        unit={p.unit}
                        phValue={showSpecs ? p.phValue : undefined}
                        unNumber={showSpecs ? p.unNumber : undefined}
                        className="w-full h-36"
                      />

                      {/* Photo Upload Trigger Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setImageUploadProduct(p);
                          setImageFileUrl(p.image || '');
                        }}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 text-[10px] flex items-center gap-1 backdrop-blur-md opacity-80 group-hover:opacity-100 transition-opacity no-print cursor-pointer"
                        title="Ürün Fotoğrafı Yükle / Değiştir"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span className="hidden group-hover:inline">Fotoğraf</span>
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                        {p.category}
                      </span>
                      <h3
                        className={`text-sm font-bold leading-snug line-clamp-2 ${
                          catalogTheme === 'light' ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {p.name}
                      </h3>
                      <p
                        className={`text-xs line-clamp-2 leading-relaxed ${
                          catalogTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                        }`}
                      >
                        {p.description || 'Endüstriyel kullanıma uygun yüksek konsantrasyonlu formül.'}
                      </p>
                    </div>

                    {/* Technical Specs Chips */}
                    {showSpecs && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/40 grid grid-cols-2 gap-1.5 text-[10px]">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Ambalaj:</span>
                          <span className="font-bold text-cyan-300">{p.unit}</span>
                        </div>
                        {p.phValue && (
                          <div className="flex items-center justify-between text-slate-400">
                            <span>pH Değeri:</span>
                            <span className="font-bold text-emerald-400">{p.phValue}</span>
                          </div>
                        )}
                        {showBarcodes && (
                          <div className="col-span-2 flex items-center justify-between text-slate-400 font-mono">
                            <span>Barkod:</span>
                            <span className="text-slate-200">{p.barcode}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price & Action Section */}
                  <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between">
                    {showPrices ? (
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {priceFormat === 'vat_included'
                            ? 'KDV Dahil'
                            : priceFormat === 'with_discount'
                            ? `İskontolu (%${p.discountRate})`
                            : 'Tavsiye Edilen'}
                        </span>
                        <span className="text-base font-black text-cyan-400">
                          {displayPrice?.toLocaleString('tr-TR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          ₺
                        </span>
                      </div>
                    ) : (
                      <div className="py-1">
                        <span className="text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                          Teklif İsteyiniz
                        </span>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedProduct(p)}
                      icon={<Eye className="w-3.5 h-3.5" />}
                      className="no-print"
                    >
                      Bülten
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ViewMode: 2) 2-Column High-End Brochure Layout */}
        {viewMode === 'brochure' && (
          <div className="space-y-6">
            {Object.entries(productsByCategory).map(([categoryName, prods]) => (
              <div key={categoryName} className="space-y-3 catalog-avoid-break">
                {/* Category Section Header */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    catalogTheme === 'light'
                      ? 'bg-cyan-50 border-cyan-200 text-cyan-900'
                      : 'bg-gradient-to-r from-cyan-950/80 to-[#0B1B2E] border-cyan-500/30 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-black uppercase tracking-wider">{categoryName}</h3>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-black/40 text-cyan-300 border border-cyan-500/30">
                    {prods.length} Ürün
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prods.map((p) => {
                    const displayPrice = getDisplayPrice(p);
                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row gap-4 shadow-md catalog-avoid-break ${
                          catalogTheme === 'light'
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-[#0B1B2E] border-cyan-500/20'
                        }`}
                      >
                        {/* Visual */}
                        <div className="w-full sm:w-36 shrink-0">
                          <ProductVisual
                            image={p.image}
                            name={p.name}
                            code={p.code}
                            category={p.category}
                            unit={p.unit}
                            phValue={showSpecs ? p.phValue : undefined}
                            unNumber={showSpecs ? p.unNumber : undefined}
                            className="w-full h-36"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono text-xs font-black text-cyan-400">
                                {p.code}
                              </span>
                              <span className="text-[10px] text-slate-400">{p.unit}</span>
                            </div>
                            <h4
                              className={`text-sm font-bold leading-tight mt-0.5 ${
                                catalogTheme === 'light' ? 'text-slate-900' : 'text-white'
                              }`}
                            >
                              {p.name}
                            </h4>
                            <p
                              className={`text-xs mt-1 leading-relaxed ${
                                catalogTheme === 'light' ? 'text-slate-600' : 'text-slate-300'
                              }`}
                            >
                              {p.description}
                            </p>
                          </div>

                          {showSpecs && (
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 pt-1">
                              {p.phValue && (
                                <span className="bg-cyan-950/60 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                                  pH: {p.phValue}
                                </span>
                              )}
                              {p.density && (
                                <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                  Yoğunluk: {p.density}
                                </span>
                              )}
                              {showBarcodes && (
                                <span className="font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                  {p.barcode}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between">
                            {showPrices ? (
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-sm font-black text-cyan-400">
                                  {displayPrice?.toLocaleString('tr-TR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}{' '}
                                  ₺
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {priceFormat === 'vat_included' ? '(KDV Dahil)' : '(+KDV)'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-amber-400">
                                Fiyat Teklifi İsteyiniz
                              </span>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedProduct(p)}
                              icon={<Eye className="w-3.5 h-3.5" />}
                              className="no-print"
                            >
                              İncele
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ViewMode: 3) Technical Spec Table */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-700/50">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className={`border-b ${
                    catalogTheme === 'light'
                      ? 'bg-slate-200 text-slate-900 border-slate-300'
                      : 'bg-[#102A43] text-cyan-300 border-cyan-500/30'
                  }`}
                >
                  <th className="p-3 font-bold">Kod & Görsel</th>
                  <th className="p-3 font-bold">Ürün Adı & Kategori</th>
                  <th className="p-3 font-bold">Ambalaj</th>
                  {showSpecs && <th className="p-3 font-bold">pH Değeri</th>}
                  {showSpecs && <th className="p-3 font-bold">Yoğunluk</th>}
                  {showBarcodes && <th className="p-3 font-bold">Barkod</th>}
                  {showPrices && <th className="p-3 font-bold text-right">Fiyat</th>}
                  <th className="p-3 font-bold text-center no-print">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {activeCatalogProducts.map((p) => {
                  const displayPrice = getDisplayPrice(p);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-cyan-500/5 transition-colors ${
                        catalogTheme === 'light' ? 'text-slate-800' : 'text-slate-200'
                      }`}
                    >
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 shrink-0">
                            <ProductVisual
                              image={p.image}
                              name={p.name}
                              code={p.code}
                              category={p.category}
                              unit={p.unit}
                              showBadge={false}
                              className="w-10 h-10"
                            />
                          </div>
                          <span className="font-mono font-bold text-cyan-400">{p.code}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.category}</div>
                      </td>
                      <td className="p-3 font-medium">{p.unit}</td>
                      {showSpecs && (
                        <td className="p-3 font-mono font-bold text-cyan-300">
                          {p.phValue || '-'}
                        </td>
                      )}
                      {showSpecs && <td className="p-3 font-mono">{p.density || '-'}</td>}
                      {showBarcodes && (
                        <td className="p-3 font-mono text-slate-400">{p.barcode}</td>
                      )}
                      {showPrices && (
                        <td className="p-3 font-black text-right text-cyan-400">
                          {displayPrice?.toLocaleString('tr-TR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          ₺
                        </td>
                      )}
                      <td className="p-3 text-center no-print">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedProduct(p)}
                        >
                          İncele
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ViewMode: 4) A4 Page-by-Page Simulation */}
        {viewMode === 'a4_preview' && (
          <div className="space-y-8 flex flex-col items-center">
            {Object.entries(productsByCategory).map(([categoryName, prods], pageIdx) => (
              <div
                key={categoryName}
                className={`w-full max-w-4xl p-8 rounded-2xl shadow-2xl border catalog-page-break ${
                  catalogTheme === 'light'
                    ? 'bg-white text-slate-900 border-slate-300'
                    : 'bg-[#0B1B2E] text-white border-cyan-500/30'
                }`}
              >
                {/* Simulated A4 Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/50 mb-6">
                  <div>
                    <h3 className="text-lg font-black text-cyan-400">{company.name}</h3>
                    <p className="text-xs text-slate-400">{company.subtitle}</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-bold text-cyan-300">{categoryName}</span>
                    <p className="text-[10px] text-slate-400">
                      Sayfa {pageIdx + 1} / {Object.keys(productsByCategory).length}
                    </p>
                  </div>
                </div>

                {/* 3-column A4 grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {prods.map((p) => {
                    const displayPrice = getDisplayPrice(p);
                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 catalog-avoid-break ${
                          catalogTheme === 'light'
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-[#07111F] border-cyan-500/20'
                        }`}
                      >
                        <ProductVisual
                          image={p.image}
                          name={p.name}
                          code={p.code}
                          category={p.category}
                          unit={p.unit}
                          phValue={showSpecs ? p.phValue : undefined}
                          unNumber={showSpecs ? p.unNumber : undefined}
                          className="w-full h-32"
                        />

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold leading-tight">{p.name}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            {p.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs">
                          <span className="font-bold text-cyan-300">{p.unit}</span>
                          {showPrices ? (
                            <span className="font-black text-cyan-400">
                              {displayPrice?.toLocaleString('tr-TR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                              ₺
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-400">Teklif Alınız</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Simulated A4 Footer */}
                <div className="mt-8 pt-4 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                  <span>📞 {company.phone} • 🌐 {company.website}</span>
                  <span>{company.contactPerson}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Catalog Page Footer Banner */}
        <div
          className={`mt-8 p-4 rounded-xl border text-center text-xs space-y-1 catalog-avoid-break ${
            catalogTheme === 'light'
              ? 'bg-slate-100 border-slate-300 text-slate-700'
              : 'bg-[#0B1B2E] border-cyan-500/20 text-slate-300'
          }`}
        >
          <p className="font-bold text-cyan-400">
            TEORİ KİMYA SANAYİ VE TİCARET • KÜTAHYA MERKEZ
          </p>
          <p className="text-[11px] text-slate-400">
            {company.address} • Tel: {company.phone} • E-Posta: {company.email} • Web: {company.website}
          </p>
          <p className="text-[10px] text-slate-500">
            * Tüm kimyasal ürünler yürürlükteki Çevre ve Şehircilik Bakanlığı ile Sağlık Bakanlığı Biyosidal yönetmeliklerine uygundur.
          </p>
        </div>
      </div>

      {/* PDF Generation Progress & Download Modal */}
      <Modal
        isOpen={isGeneratingPdf}
        onClose={() => {
          setIsGeneratingPdf(false);
          setGeneratedPdfResult(null);
        }}
        title={generatedPdfResult ? 'PDF Kataloğu Hazır' : 'PDF Kataloğu Hazırlanıyor'}
        subtitle={
          generatedPdfResult
            ? 'Dosyanız cihazınıza aktarılıyor. Dilerseniz hemen tarayıcıda açabilirsiniz.'
            : 'Lütfen bekleyiniz, A4 yüksek çözünürlüklü sayfalar derleniyor...'
        }
        maxWidth="md"
      >
        <div className="p-6 text-center space-y-4">
          {generatedPdfResult ? (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">
                  Katalog Başarıyla Oluşturuldu!
                </h3>
                <p className="text-xs text-slate-300">
                  {showPrices ? 'Fiyatlı Katalog' : 'Fiyatsız Tanıtım Portföyü'} • {activeCatalogProducts.length} Ürün Listelendi
                </p>
                <p className="text-[11px] text-cyan-300 font-mono mt-1">
                  {generatedPdfResult.fileName}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#07111F] border border-cyan-500/30 text-xs text-slate-300 text-left space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Check className="w-4 h-4" />
                  <span>İndirme işlemi otomatik başlatıldı.</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  iPhone Safari veya diğer mobil tarayıcılarda indirme bildirimi çıkmadıysa aşağıdaki <strong>"PDF'i Görüntüle / Aç"</strong> butonuna dokunarak doğrudan tam ekran açabilir veya Paylaş menüsünden kaydedebilirsiniz.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-3 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  icon={<FileText className="w-4 h-4" />}
                  onClick={() => {
                    if (generatedPdfResult.url) {
                      window.open(generatedPdfResult.url, '_blank');
                    }
                  }}
                >
                  📄 PDF'i Tarayıcıda Görüntüle / Aç
                </Button>

                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => {
                    if (generatedPdfResult.blob) {
                      downloadPdfBlob(generatedPdfResult.blob, generatedPdfResult.fileName);
                    }
                  }}
                >
                  Tekrar İndir
                </Button>

                <Button
                  variant="ghost"
                  className="w-full sm:w-auto text-slate-400 hover:text-white"
                  onClick={() => {
                    setIsGeneratingPdf(false);
                    setGeneratedPdfResult(null);
                  }}
                >
                  Kapat
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center mx-auto animate-pulse">
                <BookOpen className="w-8 h-8 text-cyan-400 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  {pdfProgress?.message || 'Sayfalar derleniyor...'}
                </h3>
                <p className="text-xs text-slate-400">
                  {showPrices ? 'Fiyatlı Katalog' : 'Fiyatsız Tanıtım Kataloğu'} • Toplam {activeCatalogProducts.length} Ürün
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-cyan-500/30">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${pdfProgress?.percent || 20}%` }}
                />
              </div>

              <p className="text-[11px] font-mono text-cyan-300">
                %{pdfProgress?.percent || 20} Tamamlandı
              </p>
            </>
          )}
        </div>
      </Modal>

      {/* Product Photo Upload Modal */}
      <Modal
        isOpen={!!imageUploadProduct}
        onClose={() => {
          setImageUploadProduct(null);
          setImageFileUrl('');
        }}
        title="Ürün Fotoğrafı / Görseli Yükle"
        subtitle={imageUploadProduct ? `${imageUploadProduct.code} - ${imageUploadProduct.name}` : ''}
        maxWidth="md"
      >
        {imageUploadProduct && (
          <div className="space-y-4 text-xs">
            {/* Current Image Preview */}
            <div className="p-4 rounded-xl bg-[#07111F] border border-cyan-500/30 flex flex-col items-center justify-center">
              <div className="w-40 h-40 rounded-xl overflow-hidden mb-2">
                <ProductVisual
                  image={imageFileUrl || imageUploadProduct.image}
                  name={imageUploadProduct.name}
                  code={imageUploadProduct.code}
                  category={imageUploadProduct.category}
                  unit={imageUploadProduct.unit}
                  className="w-full h-full"
                />
              </div>
              <span className="text-[10px] text-slate-400">Görsel Önizleme</span>
            </div>

            {/* Option 1: File picker */}
            <div className="space-y-2">
              <label className="font-bold text-white block">1. Cihazdan / Kameradan Fotoğraf Yükle:</label>
              <Button
                variant="outline"
                className="w-full border-cyan-500/40 text-cyan-200"
                icon={<Upload className="w-4 h-4" />}
                onClick={() => fileInputRef.current?.click()}
              >
                Fotoğraf Seç veya Çek (Galeri / Kamera)
              </Button>
            </div>

            {/* Option 2: Image URL */}
            <div className="space-y-2">
              <label className="font-bold text-white block">2. veya Fotoğraf Web Linki (URL):</label>
              <input
                type="url"
                placeholder="https://example.com/urun-fotografi.jpg"
                value={imageFileUrl}
                onChange={(e) => setImageFileUrl(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {imageUploadProduct.image && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleRemoveImage}
                >
                  Fotoğrafı Kaldır
                </Button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setImageUploadProduct(null);
                    setImageFileUrl('');
                  }}
                >
                  İptal
                </Button>
                {imageFileUrl.trim() && (
                  <Button onClick={handleSaveImageUrl}>
                    Kaydet
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Technical Spec Detail Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Kimyasal Teknik Ürün Bülteni (TDS)"
        subtitle={selectedProduct ? selectedProduct.name : ''}
        maxWidth="lg"
      >
        {selectedProduct && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#102A43] to-[#0B1B2E] border border-cyan-500/25 flex flex-col sm:flex-row justify-between items-start gap-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 shrink-0">
                  <ProductVisual
                    image={selectedProduct.image}
                    name={selectedProduct.name}
                    code={selectedProduct.code}
                    category={selectedProduct.category}
                    unit={selectedProduct.unit}
                    showBadge={false}
                    className="w-16 h-16"
                  />
                </div>
                <div>
                  <span className="font-mono text-cyan-300 font-bold">{selectedProduct.code}</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-300">{selectedProduct.category}</p>
                </div>
              </div>

              {showPrices && (
                <div className="text-right sm:self-center">
                  <span className="text-[10px] text-slate-400">Liste Fiyatı</span>
                  <p className="text-xl font-black text-cyan-300">
                    {selectedProduct.salePrice.toLocaleString('tr-TR')} ₺
                  </p>
                  <span className="text-[10px] text-slate-500">+%20 KDV</span>
                </div>
              )}
            </div>

            {/* Technical Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-[#07111F] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">pH Değeri:</span>
                <span className="font-black text-cyan-300 text-sm">{selectedProduct.phValue || '7.0'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#07111F] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Ambalaj:</span>
                <span className="font-bold text-white text-xs">{selectedProduct.unit}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#07111F] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Yoğunluk:</span>
                <span className="font-mono font-bold text-emerald-300 text-xs">{selectedProduct.density || '1.05 g/cm³'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#07111F] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Barkod / EAN:</span>
                <span className="font-mono font-bold text-slate-200 text-xs">{selectedProduct.barcode}</span>
              </div>
            </div>

            {/* Usage and Description */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                Uygulama Alanı & Seyreltme Talimatı
              </h4>
              <p className="text-slate-300 leading-relaxed">
                {selectedProduct.description ||
                  'Endüstriyel zeminler, madencilik tesisleri, iş makineleri ve ağır sanayi ekipmanlarında güvenle kullanılır. Yoğun kirlilikte 1/5, hafif kirlilikte 1/20 oranında su ile seyreltilerek basınçlı püskürtme veya mop ile uygulanır.'}
              </p>
            </div>

            {/* ADR Hazard Info if available */}
            {selectedProduct.unNumber && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5 text-amber-200">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-snug">
                  <p className="font-bold text-white">ADR Tehlikeli Madde Sınıflandırması:</p>
                  <p>
                    {selectedProduct.unNumber} • {selectedProduct.adrClass || 'Sınıf 8 Aşındırıcı'} • Ambalaj Grubu: {selectedProduct.packagingGroup || 'II'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-slate-400 text-[11px]">
                Danışman: <span className="text-white font-bold">{company.contactPerson}</span> ({company.phone})
              </div>
              <Button onClick={() => setSelectedProduct(null)}>Kapat</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
