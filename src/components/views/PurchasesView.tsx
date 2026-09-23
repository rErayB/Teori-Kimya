import React, { useState, useEffect } from 'react';
import {
  PackagePlus,
  Search,
  Plus,
  Filter,
  Building2,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Truck,
  Printer,
  DollarSign,
  ArrowUpRight,
  Receipt,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Purchase, Product, Supplier } from '../../types';
import { repository } from '../../services/storage';

interface PurchasesViewProps {
  onNavigate?: (tab: string) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({ onNavigate }) => {
  const [purchases, setPurchases] = useState<Purchase[]>(repository.getPurchases());
  const [products, setProducts] = useState<Product[]>(repository.getProducts());
  const [suppliers, setSuppliers] = useState<Supplier[]>(repository.getSuppliers());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'month' | 'week' | 'today'>('all');

  // New Purchase Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(10);
  const [costPerUnit, setCostPerUnit] = useState<number>(0);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('paid');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cash' | 'term_account'>('bank_transfer');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [receivedBy, setReceivedBy] = useState(repository.getCompany().contactPerson);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Selected Purchase for Detail/Print Modal
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);

  useEffect(() => {
    const unsub = repository.subscribe(() => {
      setPurchases(repository.getPurchases());
      setProducts(repository.getProducts());
      setSuppliers(repository.getSuppliers());
    });
    return unsub;
  }, []);

  // When product is selected in modal, prefill its current purchase price
  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setCostPerUnit(prod.purchasePrice || 0);
    }
  };

  const openNewPurchaseModal = (prefillProductId?: string) => {
    setFormError(null);
    setSuccessMessage(null);
    const firstProd = prefillProductId
      ? products.find((p) => p.id === prefillProductId)
      : products[0];

    if (firstProd) {
      setSelectedProductId(firstProd.id);
      setCostPerUnit(firstProd.purchasePrice || 0);
    }
    setQuantity(10);
    setInvoiceNo(`FAT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setPaymentStatus('paid');
    setPaymentMethod('bank_transfer');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setReceivedBy(repository.getCompany().contactPerson);
    setIsModalOpen(true);
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedProductId) {
      setFormError('Lütfen mal alımı yapılacak ürünü seçiniz.');
      return;
    }

    if (quantity <= 0) {
      setFormError('Giriş miktarı 0 dan büyük olmalıdır.');
      return;
    }

    if (costPerUnit < 0) {
      setFormError('Birim alış maliyeti negatif olamaz.');
      return;
    }

    const supObj = suppliers.find((s) => s.id === selectedSupplier);

    const result = repository.addPurchase({
      productId: selectedProductId,
      quantity: Number(quantity),
      costPerUnit: Number(costPerUnit),
      supplierId: selectedSupplier || undefined,
      supplierName: supObj ? supObj.companyName : 'Genel Tedarikçi / Spot',
      invoiceNo: invoiceNo.trim() || undefined,
      paymentStatus,
      paymentMethod,
      date: purchaseDate ? `${purchaseDate}T10:00:00.000Z` : undefined,
      notes: notes.trim() || undefined,
      receivedBy: receivedBy.trim() || undefined,
    });

    if (!result.success) {
      setFormError(result.error || 'Mal alımı kaydedilemedi.');
      return;
    }

    setSuccessMessage(
      `Stok girişi başarıyla tamamlandı! ${quantity} adet ürün stoğa eklendi ve maliyet güncellendi.`
    );
    setIsModalOpen(false);
  };

  // Filter purchases
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const filteredPurchases = purchases.filter((p) => {
    if (selectedSupplierId !== 'all' && p.supplierId !== selectedSupplierId) {
      return false;
    }

    if (periodFilter === 'today' && !p.date.startsWith(todayStr)) return false;
    if (periodFilter === 'month' && !p.date.startsWith(currentMonthStr)) return false;
    if (periodFilter === 'week') {
      const diff = (now.getTime() - new Date(p.date).getTime()) / (1000 * 3600 * 24);
      if (diff > 7 || diff < 0) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = p.purchaseNo.toLowerCase().includes(q);
      const matchInv = p.invoiceNo?.toLowerCase().includes(q);
      const matchProd = p.productName.toLowerCase().includes(q);
      const matchSup = p.supplierName.toLowerCase().includes(q);
      if (!matchNo && !matchInv && !matchProd && !matchSup) return false;
    }

    return true;
  });

  // Calculate Metrics
  const totalPurchaseValue = purchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalPurchaseItems = purchases.reduce((sum, p) => sum + p.quantity, 0);
  const totalUnpaidPurchase = purchases
    .filter((p) => p.paymentStatus !== 'paid')
    .reduce((sum, p) => sum + p.totalCost, 0);
  const currentStockValue = products.reduce((sum, p) => sum + p.stock * p.purchasePrice, 0);

  const selectedProductObj = products.find((p) => p.id === selectedProductId);
  const totalFormCost = Number((quantity * costPerUnit).toFixed(2));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Mal Alımı & Stok Girişi
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Maliyet & Tedarikçi Entegre
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gelen hammadde ve kimyasal mamullerin fatura bazlı stok girişleri, birim maliyet güncellemeleri ve tedarikçi cari borç kayıtları.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => openNewPurchaseModal()}
            icon={<Plus className="w-4 h-4" />}
          >
            Yeni Mal Alımı / Fatura Girişi
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-white font-bold"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Toplam Alış Tutarı
          </span>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">
            {totalPurchaseValue.toLocaleString('tr-TR')} ₺
          </p>
          <span className="text-[10px] text-cyan-400 mt-0.5 block font-medium">
            {purchases.length} Alış Hareketi
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-emerald-500/20 shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Stoğa Giren Miktar
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
            {totalPurchaseItems.toLocaleString('tr-TR')} Adet/Birim
          </p>
          <span className="text-[10px] text-emerald-300 mt-0.5 block font-medium">
            Tüm mal alımları toplamı
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-amber-500/20 shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Vadeli / Ödenecek Alışlar
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
            {totalUnpaidPurchase.toLocaleString('tr-TR')} ₺
          </p>
          <span className="text-[10px] text-amber-300 mt-0.5 block font-medium">
            Tedarikçi Cari Borcuna İşlenen
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Depodaki Güncel Stok Değeri
          </span>
          <p className="text-xl sm:text-2xl font-black text-[#8DE7F2] mt-1">
            {currentStockValue.toLocaleString('tr-TR')} ₺
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
            Maliyet bazlı toplam envanter
          </span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Alış no, fatura no, ürün veya tedarikçi ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#102A43] border border-cyan-500/25 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Supplier Select */}
          <div className="flex items-center gap-1.5 bg-[#102A43] border border-cyan-500/20 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="all">Tüm Tedarikçiler</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.companyName}
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div className="flex items-center bg-[#102A43] border border-cyan-500/20 rounded-xl p-0.5 text-xs">
            {(
              [
                { id: 'all', label: 'Tümü' },
                { id: 'month', label: 'Bu Ay' },
                { id: 'week', label: 'Bu Hafta' },
                { id: 'today', label: 'Bugün' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPeriodFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  periodFilter === tab.id
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Purchases Data Table */}
      <div className="rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#07111F] text-slate-400 font-bold border-b border-cyan-500/20 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Alış No & Belge</th>
                <th className="py-3.5 px-4">Tarih</th>
                <th className="py-3.5 px-4">Ürün Adı & Barkod</th>
                <th className="py-3.5 px-4">Tedarikçi</th>
                <th className="py-3.5 px-4 text-center">Giriş Miktarı</th>
                <th className="py-3.5 px-4 text-right">Birim Alış (Maliyet)</th>
                <th className="py-3.5 px-4 text-right">Toplam Alış Tutarı</th>
                <th className="py-3.5 px-4 text-center">Ödeme Durumu</th>
                <th className="py-3.5 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <PackagePlus className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p>Kriterlere uygun mal alımı kaydı bulunamadı.</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => {
                  return (
                    <tr
                      key={purchase.id}
                      className="hover:bg-[#102A43]/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-white block">
                          {purchase.purchaseNo}
                        </span>
                        {purchase.invoiceNo && (
                          <span className="text-[11px] text-cyan-400 font-mono">
                            Fat: {purchase.invoiceNo}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-300">
                        {new Date(purchase.date).toLocaleDateString('tr-TR')}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">
                          {purchase.productName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {purchase.productBarcode}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-200 block">
                          {purchase.supplierName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Kabul: {purchase.receivedBy || 'Yetkili'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                          +{purchase.quantity} {purchase.unit}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-200">
                        {purchase.costPerUnit.toLocaleString('tr-TR')} ₺
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-black text-cyan-300 text-sm">
                        {purchase.totalCost.toLocaleString('tr-TR')} ₺
                      </td>

                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={purchase.paymentStatus === 'paid' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {purchase.paymentStatus === 'paid' ? 'Ödendi' : 'Cari Borç (Vadeli)'}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingPurchase(purchase)}
                          icon={<FileText className="w-3.5 h-3.5" />}
                        >
                          İncele
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni Mal Alımı / Stok Girişi"
        size="lg"
      >
        <form onSubmit={handleSavePurchase} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Product selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Alınan Ürün <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                required
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Mevcut Stok: {p.stock} {p.unit} | Maliyet: {p.purchasePrice} ₺)
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Tedarikçi Firma
              </label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="">Genel Tedarikçi (Cari Bağımsız)</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName} (Bakiye Borcu: {s.balance.toLocaleString('tr-TR')} ₺)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Quantity */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Alış Miktarı ({selectedProductObj?.unit || 'Adet'}) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            {/* Cost Per Unit */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Birim Alış Fiyatı (₺) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            {/* Total Cost Display (Calculated Automatically) */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Toplam Alış Maliyeti (Hesaplanan)
              </label>
              <div className="w-full bg-cyan-950/50 border border-cyan-500/40 rounded-xl px-3 py-2 text-[#8DE7F2] font-black font-mono text-sm">
                {totalFormCost.toLocaleString('tr-TR')} ₺
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Invoice No */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Fatura / İrsaliye No
              </label>
              <input
                type="text"
                placeholder="Örn: GIB20260001"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Giriş Tarihi
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Received By */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Teslim Alan Personel
              </label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Payment Status */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Ödeme / Cari Durumu
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="paid">Peşin Ödendi (Kasa / Banka Çıkışı)</option>
                <option value="unpaid">Vadeli / Tedarikçi Cari Borcuna Ekle</option>
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Ödeme Yöntemi
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="bank_transfer">Banka Havalesi / EFT</option>
                <option value="cash">Nakit Kasa</option>
                <option value="term_account">Açık Hesap / Vadeli</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Açıklama / Not
            </label>
            <textarea
              rows={2}
              placeholder="İrsaliye no, parti no veya mal kabul kontrol notları..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          {/* Profit & Weighted Cost Notice */}
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Otomatik Maliyet & Kâr Güncelleme:</span>
            </div>
            <p className="text-slate-300">
              Bu mal alımı kaydedildiğinde depodaki stok miktarı <span className="font-bold text-emerald-400">+{quantity} {selectedProductObj?.unit}</span> artacak, ürünün ağırlıklı birim maliyeti ve brüt kâr marjı sistem tarafından otomatik olarak yeniden hesaplanacaktır.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Vazgeç
            </Button>
            <Button type="submit" variant="primary" icon={<CheckCircle2 className="w-4 h-4" />}>
              Stok Girişini Onayla ({totalFormCost.toLocaleString('tr-TR')} ₺)
            </Button>
          </div>
        </form>
      </Modal>

      {/* View/Print Purchase Modal */}
      {viewingPurchase && (
        <Modal
          isOpen={true}
          onClose={() => setViewingPurchase(null)}
          title={`Mal Alım Belgesi: ${viewingPurchase.purchaseNo}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#102A43] border border-cyan-500/30 space-y-3">
              <div className="flex justify-between items-start border-b border-slate-700 pb-2">
                <div>
                  <h4 className="text-base font-black text-white">{viewingPurchase.productName}</h4>
                  <p className="font-mono text-slate-400">{viewingPurchase.productBarcode}</p>
                </div>
                <Badge
                  variant={viewingPurchase.paymentStatus === 'paid' ? 'success' : 'warning'}
                >
                  {viewingPurchase.paymentStatus === 'paid' ? 'Ödendi' : 'Cari Borç'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-400 block">Tedarikçi:</span>
                  <span className="font-semibold text-white">{viewingPurchase.supplierName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tarih:</span>
                  <span className="font-mono">{new Date(viewingPurchase.date).toLocaleString('tr-TR')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Fatura No:</span>
                  <span className="font-mono text-cyan-300">{viewingPurchase.invoiceNo || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Kabul Eden:</span>
                  <span>{viewingPurchase.receivedBy || 'Yetkili'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm">
                <span>
                  {viewingPurchase.quantity} {viewingPurchase.unit} × {viewingPurchase.costPerUnit.toLocaleString('tr-TR')} ₺
                </span>
                <span className="font-black text-cyan-300 text-lg">
                  {viewingPurchase.totalCost.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>

            {viewingPurchase.notes && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                <span className="font-bold text-slate-400 block text-[10px] uppercase">Not:</span>
                <p className="mt-0.5">{viewingPurchase.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => window.print()}
                icon={<Printer className="w-4 h-4" />}
              >
                Yazdır
              </Button>
              <Button variant="primary" onClick={() => setViewingPurchase(null)}>
                Kapat
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
