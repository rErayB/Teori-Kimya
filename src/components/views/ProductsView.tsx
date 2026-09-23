import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Barcode,
  Printer,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  QrCode,
  FlaskConical,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Product, ProductCategory, ProductUnit } from '../../types';
import { repository } from '../../services/storage';

interface ProductsViewProps {
  initialOpenAdd?: boolean;
  onOpenScanner?: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ initialOpenAdd = false, onOpenScanner }) => {
  const [products, setProducts] = useState<Product[]>(repository.getProducts());
  const [recipes] = useState(repository.getRecipes());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Hepsi');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'critical' | 'out'>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(initialOpenAdd);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [printBarcodeProduct, setPrintBarcodeProduct] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    barcode: '',
    brand: 'TEORİ KİMYA',
    category: 'Ağır Sanayi & Yağ Sökücüler' as ProductCategory,
    subCategory: 'Konsantre Temizleyici',
    unit: 'Bidon (20L)' as ProductUnit,
    purchasePrice: 0,
    salePrice: 0,
    vatRate: 20,
    discountRate: 0,
    stock: 0,
    minStock: 10,
    description: '',
    phValue: '12.5',
    unNumber: '',
    active: true,
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = repository.subscribe(() => {
      setProducts(repository.getProducts());
    });
    return unsub;
  }, []);

  const categories = [
    'Hepsi',
    ...new Set(products.map((p) => p.category)),
  ];

  // Open modal for new product
  const handleOpenAdd = () => {
    const code = `TK-${Math.floor(100 + Math.random() * 900)}`;
    const barcode = repository.generateBarcode();
    setFormData({
      code,
      name: '',
      barcode,
      brand: 'TEORİ KİMYA',
      category: 'Ağır Sanayi & Yağ Sökücüler',
      subCategory: 'Konsantre Temizleyici',
      unit: 'Bidon (20L)',
      purchasePrice: 150,
      salePrice: 280,
      vatRate: 20,
      discountRate: 0,
      stock: 20,
      minStock: 10,
      description: '',
      phValue: '10.5',
      unNumber: '',
      active: true,
    });
    setEditingProduct(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (p: Product) => {
    setFormData({
      code: p.code,
      name: p.name,
      barcode: p.barcode,
      brand: p.brand || 'TEORİ KİMYA',
      category: p.category,
      subCategory: p.subCategory || '',
      unit: p.unit,
      purchasePrice: p.purchasePrice,
      salePrice: p.salePrice,
      vatRate: p.vatRate,
      discountRate: p.discountRate || 0,
      stock: p.stock,
      minStock: p.minStock,
      description: p.description,
      phValue: p.phValue || '7.0',
      unNumber: p.unNumber || '',
      active: p.active,
    });
    setEditingProduct(p);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Ürün adı boş bırakılamaz.');
      return;
    }
    if (!formData.barcode.trim()) {
      setFormError('Barkod alanı zorunludur.');
      return;
    }

    if (editingProduct) {
      const result = repository.updateProduct(editingProduct.id, {
        ...formData,
      });
      if (!result.success) {
        setFormError(result.error || 'Güncelleme yapılamadı.');
        return;
      }
    } else {
      const result = repository.addProduct({
        ...formData,
      });
      if (!result.success) {
        setFormError(result.error || 'Ürün kaydedilemedi.');
        return;
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) {
      repository.deleteProduct(id);
    }
  };

  // Filtering
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.barcode.includes(q);

    const matchesCategory = categoryFilter === 'Hepsi' || p.category === categoryFilter;

    let matchesStock = true;
    if (stockStatusFilter === 'critical') {
      matchesStock = p.stock > 0 && p.stock <= p.minStock;
    } else if (stockStatusFilter === 'out') {
      matchesStock = p.stock <= 0;
    }

    return matchesQuery && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Package className="w-6 h-6 text-cyan-400" />
            Ürün Yönetimi & Portföy
          </h2>
          <p className="text-xs text-slate-400">
            Toplam {products.length} mamül kimyasal ürün kayıtlı
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          icon={<Plus className="w-4 h-4" />}
          className="shadow-lg shadow-cyan-950/40"
        >
          Yeni Ürün Ekle
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Ürün adı, kod veya barkod ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#102A43] border border-cyan-500/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#102A43] border border-cyan-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Stock Filter Pills */}
          <div className="flex items-center gap-1 bg-[#102A43] p-1 rounded-xl border border-cyan-500/25 text-xs">
            <button
              onClick={() => setStockStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                stockStatusFilter === 'all' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setStockStatusFilter('critical')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                stockStatusFilter === 'critical' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Azalan
            </button>
            <button
              onClick={() => setStockStatusFilter('out')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                stockStatusFilter === 'out' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Biten
            </button>
          </div>
        </div>
      </div>

      {/* Products Table (Responsive & Mobile scrollable) */}
      <div className="rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-[#102A43]/60 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Kod & İsim</th>
                <th className="py-3 px-4">Barkod</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">Birim</th>
                <th className="py-3 px-4 text-right">Maliyet</th>
                <th className="py-3 px-4 text-right">Satış Fiyatı</th>
                <th className="py-3 px-4 text-center">Stok</th>
                <th className="py-3 px-4 text-center">Durum</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Arama kriterlerine uygun ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const profit = p.salePrice - p.purchasePrice;
                  const margin = p.purchasePrice > 0 ? Math.round((profit / p.salePrice) * 100) : 0;
                  const isCritical = p.stock > 0 && p.stock <= p.minStock;
                  const isOutOfStock = p.stock <= 0;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#102A43]/40 transition-colors group"
                    >
                      {/* Code & Name */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-cyan-300 font-bold text-xs">{p.code}</div>
                        <div className="font-bold text-white text-xs">{p.name}</div>
                        {p.phValue && (
                          <span className="text-[10px] text-slate-400">
                            pH: {p.phValue} {p.unNumber ? `| UN: ${p.unNumber}` : ''}
                          </span>
                        )}
                      </td>

                      {/* Barcode */}
                      <td className="py-3 px-4 font-mono text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Barcode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{p.barcode}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-300">{p.category}</td>

                      {/* Unit */}
                      <td className="py-3 px-4 text-center text-slate-300">{p.unit}</td>

                      {/* Cost */}
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {p.purchasePrice.toLocaleString('tr-TR')} ₺
                      </td>

                      {/* Sale Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        <div>{p.salePrice.toLocaleString('tr-TR')} ₺</div>
                        <div className="text-[10px] text-emerald-400 font-normal">
                          Kâr: %{margin}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-black text-xs ${
                            isOutOfStock
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : isCritical
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {p.stock}
                        </span>
                        <div className="text-[9px] text-slate-500 mt-0.5">Min: {p.minStock}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <Badge variant={p.active ? 'success' : 'neutral'} size="sm">
                          {p.active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPrintBarcodeProduct(p)}
                            title="Barkod Etiketi Yazdır"
                            className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Düzenle"
                            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            title="Sil"
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Ürün Düzenle' : 'Yeni Mamül Ürün Ekle'}
        subtitle="Kimyasal mamül bilgilerini eksiksiz doldurunuz"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Ürün Adı *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: TK-100 Ağır Kir & Yağ Sökücü"
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Code */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ürün Kodu *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Barcode */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Barkod *</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, barcode: repository.generateBarcode() })}
                  className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                >
                  Otomatik Üret
                </button>
              </div>
              <input
                type="text"
                required
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="Ağır Sanayi & Yağ Sökücüler">Ağır Sanayi & Yağ Sökücüler</option>
                <option value="Otomotiv & Araç Bakım">Otomotiv & Araç Bakım</option>
                <option value="Gıda Hijyeni & Mutfak">Gıda Hijyeni & Mutfak</option>
                <option value="Tekstil & Çamaşırhane">Tekstil & Çamaşırhane</option>
                <option value="Genel Temizlik & Hijyen">Genel Temizlik & Hijyen</option>
                <option value="Dezenfektan & Biyosidal">Dezenfektan & Biyosidal</option>
                <option value="Özel Kimyasallar">Özel Kimyasallar</option>
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Birim</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as ProductUnit })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="Bidon (20L)">Bidon (20L)</option>
                <option value="Bidon (30L)">Bidon (30L)</option>
                <option value="Litre">Litre</option>
                <option value="Kg">Kg</option>
                <option value="Koli">Koli</option>
                <option value="Adet">Adet</option>
                <option value="Varil (200L)">Varil (200L)</option>
                <option value="IBC Tank (1000L)">IBC Tank (1000L)</option>
              </select>
            </div>

            {/* Purchase Price */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Maliyet (Alış Fiyatı) ₺</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Sale Price */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Satış Fiyatı ₺</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Başlangıç Stoğu</label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Min Stock */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Minimum Kritik Stok Eşiği</label>
              <input
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* pH & UN */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">pH Değeri (Örn: 13.5 Bazik / 1.2 Asidik)</label>
              <input
                type="text"
                value={formData.phValue}
                onChange={(e) => setFormData({ ...formData, phValue: e.target.value })}
                placeholder="Örn: 13.5 (Bazik)"
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ADR / UN Kodu</label>
              <input
                type="text"
                value={formData.unNumber}
                onChange={(e) => setFormData({ ...formData, unNumber: e.target.value })}
                placeholder="Örn: UN 1824 veya Muaf"
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Kullanım Açıklaması & Talimatı</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              placeholder="Ürünün uygulama dozu, yüzey uyumluluğu ve temizlik performansı..."
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              İptal
            </Button>
            <Button type="submit" variant="primary">
              {editingProduct ? 'Değişiklikleri Kaydet' : 'Ürünü Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Barcode Print Label Modal */}
      <Modal
        isOpen={!!printBarcodeProduct}
        onClose={() => setPrintBarcodeProduct(null)}
        title="Barkod Etiketi Yazdır"
        subtitle="Ürün üzerine yapıştırılacak termal etiket şablonu"
        maxWidth="md"
      >
        {printBarcodeProduct && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white text-slate-900 border-2 border-slate-800 flex flex-col items-center text-center space-y-2 select-all">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                TEORİ KİMYA
              </h4>
              <p className="font-black text-sm text-slate-900 max-w-[240px]">
                {printBarcodeProduct.name}
              </p>
              <p className="font-mono text-xs font-bold text-slate-600">
                Kod: {printBarcodeProduct.code} | {printBarcodeProduct.unit}
              </p>

              {/* Barcode lines visual */}
              <div className="py-2 flex flex-col items-center">
                <div className="flex items-center h-12 gap-0.5">
                  {printBarcodeProduct.barcode.split('').map((char, idx) => (
                    <div
                      key={idx}
                      className={`h-full bg-black ${
                        parseInt(char, 10) % 2 === 0 ? 'w-1' : 'w-0.5'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono font-bold tracking-widest text-xs mt-1">
                  {printBarcodeProduct.barcode}
                </span>
              </div>

              <div className="text-[10px] text-slate-500 pt-1 border-t w-full">
                Kütahya Sanayi Sitesi | +90 544 214 5940
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
                Yazdır (Termal)
              </Button>
              <Button onClick={() => setPrintBarcodeProduct(null)}>Kapat</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
