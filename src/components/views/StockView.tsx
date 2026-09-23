import React, { useState, useEffect } from 'react';
import {
  Layers,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Minus,
  Search,
  Filter,
  Package,
  History,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Product, StockMovement, StockMovementType } from '../../types';
import { repository } from '../../services/storage';

export const StockView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(repository.getProducts());
  const [movements, setMovements] = useState<StockMovement[]>(repository.getStockMovements());
  const [activeTab, setActiveTab] = useState<'status' | 'movements'>('status');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Adjustment modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<StockMovementType>('manual_increase');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(1);
  const [adjustNotes, setAdjustNotes] = useState('');
  const [adjustError, setAdjustError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = repository.subscribe(() => {
      setProducts(repository.getProducts());
      setMovements(repository.getStockMovements());
    });
    return unsub;
  }, []);

  const criticalProducts = products.filter((p) => p.stock <= p.minStock);

  const handleOpenAdjust = (p: Product) => {
    setSelectedProduct(p);
    setAdjustType('manual_increase');
    setAdjustQuantity(5);
    setAdjustNotes('');
    setAdjustError(null);
    setIsAdjustModalOpen(true);
  };

  const handleExecuteAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setAdjustError(null);

    const user = repository.getRole();
    const delta =
      adjustType === 'manual_increase' || adjustType === 'purchase_entry' || adjustType === 'return'
        ? Math.abs(adjustQuantity)
        : -Math.abs(adjustQuantity);

    const result = repository.adjustStock(
      selectedProduct.id,
      delta,
      adjustType,
      adjustNotes || 'Manuel stok düzeltmesi',
      `Personel (${user})`
    );

    if (!result.success) {
      setAdjustError(result.error || 'Stok güncellenemedi.');
      return;
    }

    setIsAdjustModalOpen(false);
  };

  // Movement type label & color helper
  const getMovementBadge = (type: StockMovementType) => {
    switch (type) {
      case 'initial':
      case 'purchase_entry':
      case 'manual_increase':
        return <Badge variant="success">Stok Girişi</Badge>;
      case 'production_output':
        return <Badge variant="cyan">Üretim Girişi</Badge>;
      case 'sale':
      case 'manual_decrease':
        return <Badge variant="info">Satış / Çıkış</Badge>;
      case 'production_use':
        return <Badge variant="warning">Üretimde Kullanım</Badge>;
      case 'waste':
        return <Badge variant="danger">Fire / Hasar</Badge>;
      case 'return':
      case 'sale_cancel':
        return <Badge variant="success">İade Girişi</Badge>;
      default:
        return <Badge variant="neutral">{type}</Badge>;
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.barcode.includes(q);

    let matchesStatus = true;
    if (statusFilter === 'in_stock') matchesStatus = p.stock > p.minStock;
    if (statusFilter === 'low_stock') matchesStatus = p.stock > 0 && p.stock <= p.minStock;
    if (statusFilter === 'out_of_stock') matchesStatus = p.stock <= 0;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            Depo & Stok Yönetimi
          </h2>
          <p className="text-xs text-slate-400">
            Gerçek zamanlı depo bakiyeleri ve detaylı denetim hareketleri
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-[#0B1B2E] p-1 rounded-xl border border-cyan-500/20 text-xs">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'status'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Stok Durumu
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'movements'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Stok Hareketleri ({movements.length})
          </button>
        </div>
      </div>

      {/* Critical Stock Alert Ribbon */}
      {criticalProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {criticalProducts.length} Ürün Kritik Eşik Altında!
              </h4>
              <p className="text-xs text-amber-200/80">
                Aşağıdaki ürünlerin stokları minimum seviyenin altındadır. Üretim veya sipariş planlanması önerilir.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('low_stock')}
              className="px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-400/40 text-amber-300 text-xs font-semibold cursor-pointer"
            >
              Kritikleri Filtrele
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: STOCK STATUS */}
      {activeTab === 'status' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="p-3 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Ürün adı, kod veya barkod ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-[#102A43] text-slate-300 hover:text-white'
                }`}
              >
                Tümü ({products.length})
              </button>
              <button
                onClick={() => setStatusFilter('in_stock')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  statusFilter === 'in_stock'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-[#102A43] text-slate-300 hover:text-white'
                }`}
              >
                Stokta
              </button>
              <button
                onClick={() => setStatusFilter('low_stock')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  statusFilter === 'low_stock'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-[#102A43] text-slate-300 hover:text-white'
                }`}
              >
                Az Stok ({criticalProducts.length})
              </button>
              <button
                onClick={() => setStatusFilter('out_of_stock')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  statusFilter === 'out_of_stock'
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-[#102A43] text-slate-300 hover:text-white'
                }`}
              >
                Tükenen
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cyan-500/20 bg-[#102A43]/60 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Ürün Bilgisi</th>
                    <th className="py-3 px-4">Raf Lokasyonu</th>
                    <th className="py-3 px-4 text-center">Birim</th>
                    <th className="py-3 px-4 text-center">Mevcut Stok</th>
                    <th className="py-3 px-4 text-center">Min. Eşik</th>
                    <th className="py-3 px-4 text-center">Durum Etiketi</th>
                    <th className="py-3 px-4 text-right">Stok Değeri</th>
                    <th className="py-3 px-4 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredProducts.map((p) => {
                    const isOut = p.stock <= 0;
                    const isLow = p.stock > 0 && p.stock <= p.minStock;
                    const stockValue = p.stock * p.purchasePrice;

                    return (
                      <tr key={p.id} className="hover:bg-[#102A43]/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-cyan-300 font-bold text-xs">{p.code}</span>
                          <p className="font-bold text-white text-xs">{p.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{p.barcode}</span>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300">
                          {p.category}
                        </td>

                        <td className="py-3 px-4 text-center text-slate-300">{p.unit}</td>

                        <td className="py-3 px-4 text-center font-black text-sm">
                          <span
                            className={
                              isOut
                                ? 'text-red-400'
                                : isLow
                                ? 'text-amber-300'
                                : 'text-emerald-400'
                            }
                          >
                            {p.stock}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center text-slate-400 font-mono">
                          {p.minStock}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {isOut ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/40">
                              STOK YOK
                            </span>
                          ) : isLow ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              AZ STOK
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              STOKTA
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          {stockValue.toLocaleString('tr-TR')} ₺
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenAdjust(p)}
                            icon={<RefreshCw className="w-3.5 h-3.5 text-cyan-400" />}
                          >
                            Düzeltme Yap
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOVEMENTS LOG */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cyan-500/20 bg-[#102A43]/60 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Tarih / Saat</th>
                    <th className="py-3 px-4">Ürün</th>
                    <th className="py-3 px-4">Hareket Türü</th>
                    <th className="py-3 px-4 text-center">Değişim</th>
                    <th className="py-3 px-4 text-center">Önceki Stok</th>
                    <th className="py-3 px-4 text-center">Yeni Stok</th>
                    <th className="py-3 px-4">Personel</th>
                    <th className="py-3 px-4">Açıklama / Belge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Henüz stok hareketi kaydedilmedi.
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => (
                      <tr key={m.id} className="hover:bg-[#102A43]/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {new Date(m.date).toLocaleString('tr-TR')}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">{m.productName}</td>
                        <td className="py-3 px-4">{getMovementBadge(m.type)}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span className={m.quantity >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {m.quantity >= 0 ? `+${m.quantity}` : m.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-400">
                          {m.previousStock}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-cyan-300">
                          {m.newStock}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{m.performedBy || 'Sistem'}</td>
                        <td className="py-3 px-4 text-slate-400 truncate max-w-xs">{m.notes}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manual Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Manuel Stok Düzeltmesi"
        subtitle={selectedProduct ? `${selectedProduct.name} için stok operasyonu` : ''}
        maxWidth="md"
      >
        {selectedProduct && (
          <form onSubmit={handleExecuteAdjustment} className="space-y-4 text-xs">
            {adjustError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{adjustError}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-[#102A43] border border-cyan-500/20 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Mevcut Stok:</span>
                <span className="font-bold text-white">
                  {selectedProduct.stock} {selectedProduct.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ürün Kodu:</span>
                <span className="font-mono text-cyan-300">{selectedProduct.code}</span>
              </div>
            </div>

            {/* Operation Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hareket Türü *</label>
              <select
                value={adjustType}
                onChange={(e) => setAdjustType(e.target.value as StockMovementType)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="manual_increase">Manuel Stok Girişi (+)</option>
                <option value="manual_decrease">Manuel Stok Çıkışı (-)</option>
                <option value="purchase_entry">Satın Alma / Sevkiyat Girişi (+)</option>
                <option value="waste">Fire / Hasar / Dökülme (-)</option>
                <option value="return">Müşteri İade Girişi (+)</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                İşlem Miktarı ({selectedProduct.unit}) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono text-sm font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Açıklama / Referans Belge *</label>
              <input
                type="text"
                required
                placeholder="Örn: Yıllık genel sayım düzeltmesi veya hasarlı bidon tutanağı"
                value={adjustNotes}
                onChange={(e) => setAdjustNotes(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setIsAdjustModalOpen(false)}>
                Vazgeç
              </Button>
              <Button type="submit" variant="primary">
                Stok Hareketini Uygula
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
