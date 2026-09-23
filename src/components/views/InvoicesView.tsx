import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  Calendar,
  DollarSign,
  RotateCcw,
  Ban,
  AlertCircle,
  Plus,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Sale, ProductReturn, Product, Customer } from '../../types';
import { repository } from '../../services/storage';

export const InvoicesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'returns'>('invoices');
  const [sales, setSales] = useState<Sale[]>(repository.getSales());
  const [returns, setReturns] = useState<ProductReturn[]>(repository.getProductReturns());
  const [products, setProducts] = useState<Product[]>(repository.getProducts());
  const [customers, setCustomers] = useState<Customer[]>(repository.getCustomers());
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Sale for Detailed Preview / Print
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  // Cancel Sale Modal State
  const [cancellingSale, setCancellingSale] = useState<Sale | null>(null);
  const [cancellationReason, setCancellationReason] = useState('Müşteri talebi / Yanlış kesim');

  // New Product Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnCustomerId, setReturnCustomerId] = useState('');
  const [returnProductId, setReturnProductId] = useState('');
  const [returnQuantity, setReturnQuantity] = useState<number>(1);
  const [returnUnitPrice, setReturnUnitPrice] = useState<number>(0);
  const [returnReason, setReturnReason] = useState('Hasarlı / Kusurlu Ambalaj');
  const [restockProduct, setRestockProduct] = useState(true);
  const [relatedSaleId, setRelatedSaleId] = useState<string | undefined>(undefined);
  const [returnError, setReturnError] = useState<string | null>(null);

  // Selected Return for Print
  const [viewingReturn, setViewingReturn] = useState<ProductReturn | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const company = repository.getCompany();

  useEffect(() => {
    const unsub = repository.subscribe(() => {
      setSales(repository.getSales());
      setReturns(repository.getProductReturns());
      setProducts(repository.getProducts());
      setCustomers(repository.getCustomers());
    });
    return unsub;
  }, []);

  // Filter sales
  const filteredSales = sales.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      s.invoiceNo.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q)
    );
  });

  // Filter returns
  const filteredReturns = returns.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      r.returnNo.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q)
    );
  });

  // Handle Cancel Sale (Requirement 13)
  const handleConfirmCancelSale = () => {
    if (!cancellingSale) return;
    const result = repository.cancelSale(cancellingSale.id);
    if (result.success) {
      setToastMessage(
        `${cancellingSale.invoiceNo} nolu satış iptal edildi. Stoklar geri yüklendi ve kâr hesaplaması düzeltildi.`
      );
      setCancellingSale(null);
      setCancellationReason('Müşteri talebi / Yanlış kesim');
    } else {
      setToastMessage(result.error || 'Satış iptal edilemedi.');
    }
  };

  // Open Return modal from sale
  const handleOpenReturnFromSale = (sale: Sale) => {
    const cust = customers.find((c) => c.companyName === sale.customerName);
    if (cust) setReturnCustomerId(cust.id);
    else if (customers.length > 0) setReturnCustomerId(customers[0].id);

    if (sale.items.length > 0) {
      const item = sale.items[0];
      setReturnProductId(item.productId);
      setReturnQuantity(1);
      setReturnUnitPrice(item.unitPrice);
    }
    setRelatedSaleId(sale.id);
    setReturnReason('Müşteri Talebi / İade');
    setRestockProduct(true);
    setReturnError(null);
    setIsReturnModalOpen(true);
  };

  // Open generic return modal
  const handleOpenGenericReturn = () => {
    if (customers.length > 0) setReturnCustomerId(customers[0].id);
    if (products.length > 0) {
      setReturnProductId(products[0].id);
      setReturnUnitPrice(products[0].salePrice);
    }
    setReturnQuantity(1);
    setRelatedSaleId(undefined);
    setReturnReason('Hasarlı / Kusurlu Ambalaj');
    setRestockProduct(true);
    setReturnError(null);
    setIsReturnModalOpen(true);
  };

  // When product changes in return modal, prefill unit price
  const handleReturnProductChange = (prodId: string) => {
    setReturnProductId(prodId);
    const p = products.find((x) => x.id === prodId);
    if (p) {
      setReturnUnitPrice(p.salePrice);
    }
  };

  // Submit Product Return (Requirement 14)
  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    setReturnError(null);

    if (!returnCustomerId) {
      setReturnError('Lütfen iade yapan müşteriyi seçiniz.');
      return;
    }
    if (!returnProductId) {
      setReturnError('Lütfen iade edilen ürünü seçiniz.');
      return;
    }
    if (returnQuantity <= 0) {
      setReturnError('İade miktarı sıfırdan büyük olmalıdır.');
      return;
    }

    const selectedCust = customers.find((c) => c.id === returnCustomerId);
    const selectedProd = products.find((p) => p.id === returnProductId);

    const totalRefund = Number((returnQuantity * returnUnitPrice).toFixed(2));

    const result = repository.addProductReturn({
      date: new Date().toISOString(),
      customerId: returnCustomerId,
      customerName: selectedCust?.companyName || 'Müşteri',
      productId: returnProductId,
      productName: selectedProd?.name || 'Ürün',
      quantity: Number(returnQuantity),
      unit: selectedProd?.unit || 'Adet',
      refundAmount: totalRefund,
      reason: returnReason,
      returnToStock: restockProduct,
      notes: `Birim iade bedeli: ${returnUnitPrice} ₺${relatedSaleId ? ` (İlgili Satış Ref)` : ''}`,
    });

    if (result.success) {
      setToastMessage(
        `İade başarıyla alındı. ${restockProduct ? 'Ürün stoğa geri eklendi.' : ''} Finans hesapları güncellendi.`
      );
      setIsReturnModalOpen(false);
      setActiveTab('returns');
    } else {
      setReturnError(result.error || 'İade işlemi kaydedilemedi.');
    }
  };

  const selectedProdForReturn = products.find((p) => p.id === returnProductId);
  const totalRefundPreview = returnQuantity * returnUnitPrice;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
              <FileText className="w-6 h-6 text-cyan-400" />
              Satış Faturaları, İptal & İadeler
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              Stok & Bakiye Entegre
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Resmi e-Fatura taslakları, satış iptalleri (stok iadeli) ve müşteri ürün iade yönetimi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleOpenGenericReturn}
            icon={<RotateCcw className="w-4 h-4 text-amber-400" />}
          >
            Müşteri İadesi Al
          </Button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white font-bold"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'invoices'
              ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-lg'
              : 'bg-[#0B1B2E] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Satış Faturaları ({sales.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'returns'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
              : 'bg-[#0B1B2E] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>İade Belgeleri & İade Geçmişi ({returns.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-md">
        <div className="relative">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder={
              activeTab === 'invoices'
                ? 'Fatura numarası veya müşteri ara...'
                : 'İade no, müşteri veya iade edilen ürün ara...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#102A43] border border-cyan-500/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* TAB 1: INVOICES & CANCELLATION */}
      {activeTab === 'invoices' && (
        <div className="rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cyan-500/20 bg-[#102A43]/60 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Fatura No</th>
                  <th className="py-3 px-4">Tarih</th>
                  <th className="py-3 px-4">Müşteri</th>
                  <th className="py-3 px-4">Ödeme Türü</th>
                  <th className="py-3 px-4 text-center">Durum</th>
                  <th className="py-3 px-4 text-right">KDV</th>
                  <th className="py-3 px-4 text-right">Genel Toplam</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredSales.map((s) => (
                  <tr
                    key={s.id}
                    className={`hover:bg-[#102A43]/40 transition-colors ${
                      s.status === 'cancelled' ? 'opacity-60 bg-red-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                      {s.invoiceNo}
                      {s.status === 'cancelled' && (
                        <span className="block text-[10px] text-red-400 font-sans font-bold">
                          [İPTAL EDİLDİ]
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(s.date).toLocaleString('tr-TR')}
                    </td>

                    <td className="py-3 px-4 font-bold text-white">{s.customerName}</td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          s.paymentMethod === 'open_account'
                            ? 'warning'
                            : s.paymentMethod === 'credit_card'
                            ? 'cyan'
                            : 'success'
                        }
                        size="sm"
                      >
                        {s.paymentMethod === 'open_account'
                          ? 'Açık Hesap (Cari)'
                          : s.paymentMethod === 'credit_card'
                          ? 'Kredi Kartı'
                          : 'Nakit'}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {s.status === 'cancelled' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-950 text-red-400 border border-red-500/40">
                          İPTAL
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
                          ONAYLI
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {s.vatTotal.toLocaleString('tr-TR')} ₺
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-black text-white text-sm">
                      {s.grandTotal.toLocaleString('tr-TR')} ₺
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setViewingSale(s)}
                          icon={<Eye className="w-3.5 h-3.5 text-cyan-400" />}
                          title="Faturayı Görüntüle / Yazdır"
                        >
                          Fatura
                        </Button>

                        {s.status !== 'cancelled' && (
                          <>
                            <button
                              onClick={() => handleOpenReturnFromSale(s)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#102A43] hover:bg-amber-950/60 border border-amber-500/30 text-amber-300 cursor-pointer"
                              title="Bu faturadan ürün iadesi al"
                            >
                              İade
                            </button>
                            <button
                              onClick={() => setCancellingSale(s)}
                              className="px-2 py-1 rounded-lg text-xs font-semibold bg-[#102A43] hover:bg-red-950/60 border border-red-500/30 text-red-400 cursor-pointer"
                              title="Satışı İptal Et (Stok Geri Alınır)"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT RETURNS (Requirement 14) */}
      {activeTab === 'returns' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cyan-500/20 bg-[#102A43]/60 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">İade No</th>
                    <th className="py-3 px-4">Tarih</th>
                    <th className="py-3 px-4">Müşteri</th>
                    <th className="py-3 px-4">İade Edilen Ürün</th>
                    <th className="py-3 px-4 text-center">İade Miktarı</th>
                    <th className="py-3 px-4 text-right">Birim Bedel</th>
                    <th className="py-3 px-4 text-right">Toplam İade Tutarı</th>
                    <th className="py-3 px-4 text-center">Stoğa Alındı</th>
                    <th className="py-3 px-4">İade Nedeni</th>
                    <th className="py-3 px-4 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filteredReturns.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <RotateCcw className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                        <p>Henüz kayıtlı ürün iadesi bulunmamaktadır.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredReturns.map((ret) => (
                      <tr key={ret.id} className="hover:bg-[#102A43]/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-300">
                          {ret.returnNo}
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-400">
                          {new Date(ret.date).toLocaleDateString('tr-TR')}
                        </td>

                        <td className="py-3 px-4 font-bold text-white">
                          {ret.customerName}
                        </td>

                        <td className="py-3 px-4 text-slate-200">
                          {ret.productName}
                        </td>

                        <td className="py-3 px-4 text-center font-bold text-white">
                          {ret.quantity} {ret.unit}
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          {(ret.refundAmount / (ret.quantity || 1)).toLocaleString('tr-TR')} ₺
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-black text-rose-400 text-sm">
                          -{ret.refundAmount.toLocaleString('tr-TR')} ₺
                        </td>

                        <td className="py-3 px-4 text-center">
                          {ret.returnToStock ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                              Stoğa Eklendi
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                              Hurda / İmha
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-400">
                          {ret.reason}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setViewingReturn(ret)}
                            icon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Makbuz
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Sale Cancellation (Requirement 13) */}
      {cancellingSale && (
        <Modal
          isOpen={true}
          onClose={() => setCancellingSale(null)}
          title={`Satış İptali: ${cancellingSale.invoiceNo}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>Bu satış faturasını iptal etmek istediğinize emin misiniz?</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-red-200/90 text-[11px]">
                <li>Satışa dahil olan ürünler depodaki stok miktarlarına otomatik geri eklenecektir.</li>
                <li>Toplam cirodan <span className="font-bold text-white">{cancellingSale.grandTotal.toLocaleString('tr-TR')} ₺</span> düşürülecektir.</li>
                <li>Bu satış açık hesap (cari) ile yapıldıysa, müşterinin borç bakiyesi otomatik azaltılacaktır.</li>
                <li>Kayıt silinmeyecek; denetim için "İPTAL" damgasıyla saklanacaktır.</li>
              </ul>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                İptal Nedeni / Açıklama <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={2}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 resize-none"
                placeholder="İptal gerekçesini yazınız..."
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="secondary" onClick={() => setCancellingSale(null)}>
                Vazgeç
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmCancelSale}
                icon={<Ban className="w-4 h-4" />}
              >
                Satışı İptal Et ve Stokları Düzelt
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Add Product Return (Requirement 14) */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Müşteri Ürün İadesi Al"
        size="md"
      >
        <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
          {returnError && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{returnError}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              İade Yapan Müşteri <span className="text-red-400">*</span>
            </label>
            <select
              value={returnCustomerId}
              onChange={(e) => setReturnCustomerId(e.target.value)}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.contactPerson || 'Yetkili'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              İade Edilen Ürün <span className="text-red-400">*</span>
            </label>
            <select
              value={returnProductId}
              onChange={(e) => handleReturnProductChange(e.target.value)}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Birim Satış: {p.salePrice} ₺ | Mevcut Stok: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                İade Miktarı ({selectedProdForReturn?.unit || 'Adet'}) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={returnQuantity}
                onChange={(e) => setReturnQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Birim İade Tutarı (₺) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={returnUnitPrice}
                onChange={(e) => setReturnUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Toplam İade Bedeli
              </label>
              <div className="w-full bg-rose-950/40 border border-rose-500/40 rounded-xl px-3 py-2 text-rose-300 font-black font-mono">
                {totalRefundPreview.toLocaleString('tr-TR')} ₺
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              İade Sebebi <span className="text-red-400">*</span>
            </label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="Hasarlı / Kusurlu Ambalaj">Hasarlı / Kusurlu Ambalaj</option>
              <option value="Yanlış Ürün Gönderimi">Yanlış Ürün Gönderimi</option>
              <option value="Müşteri Fazla Sipariş İadesi">Müşteri Fazla Sipariş İadesi</option>
              <option value="Son Kullanma Tarihi / Kalite Sorunu">Son Kullanma Tarihi / Kalite Sorunu</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          {/* Restock checkbox */}
          <div className="p-3 rounded-xl bg-[#102A43] border border-cyan-500/30 flex items-center gap-3">
            <input
              type="checkbox"
              id="restockProduct"
              checked={restockProduct}
              onChange={(e) => setRestockProduct(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 cursor-pointer"
            />
            <label htmlFor="restockProduct" className="text-slate-200 cursor-pointer select-none">
              <span className="font-bold block">İade edilen ürün stoğa geri eklensin mi?</span>
              <span className="text-[10px] text-slate-400 block">
                Seçilirse, depodaki stok miktarı otomatik olarak +{returnQuantity} {selectedProdForReturn?.unit} artırılır.
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsReturnModalOpen(false)}>
              Vazgeç
            </Button>
            <Button type="submit" variant="primary" icon={<CheckCircle2 className="w-4 h-4" />}>
              İadeyi Onayla ({totalRefundPreview.toLocaleString('tr-TR')} ₺)
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Sale Invoice Document */}
      <Modal
        isOpen={!!viewingSale}
        onClose={() => setViewingSale(null)}
        title="Fatura Belgesi"
        size="lg"
      >
        {viewingSale && (
          <div className="space-y-4">
            <div id="print-official-invoice" className="p-6 rounded-xl bg-white text-slate-900 font-sans text-xs space-y-4 shadow-lg">
              <div className="flex justify-between items-start border-b pb-4 border-slate-300">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#0B1B2E] border border-cyan-500 flex items-center justify-center text-white font-black text-xs">
                      TK
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-wider">TEORİ KİMYA</h2>
                      <p className="text-[10px] text-slate-600 font-semibold uppercase">{company.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">{company.address}</p>
                  <p className="text-[10px] text-slate-500">
                    Tel: {company.phone} | E-posta: {company.email}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {company.taxOffice} - V.No: {company.taxNumber}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white font-mono font-bold rounded text-xs">
                    SATIŞ BİLGİ FATURASI
                  </span>
                  <p className="font-mono font-black text-sm text-slate-800 mt-1">
                    {viewingSale.invoiceNo}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Tarih: {new Date(viewingSale.date).toLocaleString('tr-TR')}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Ödeme Türü:{' '}
                    {viewingSale.paymentMethod === 'open_account'
                      ? 'Açık Hesap (Cari)'
                      : viewingSale.paymentMethod === 'credit_card'
                      ? 'Kredi Kartı'
                      : 'Nakit'}
                  </p>
                  {viewingSale.status === 'cancelled' && (
                    <span className="inline-block px-2 py-0.5 bg-red-600 text-white font-bold rounded text-[10px]">
                      BU FATURA İPTAL EDİLMİŞTİR
                    </span>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-3 bg-slate-100 rounded-lg flex justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">SAYIN / MÜŞTERİ</p>
                  <p className="font-black text-slate-900 text-sm">{viewingSale.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">Düzenleyen Kasiyer / Danışman:</p>
                  <p className="font-bold text-slate-800">{viewingSale.cashierName || company.contactPerson}</p>
                </div>
              </div>

              {/* Table of items */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-[10px] uppercase font-bold text-slate-600">
                    <th className="py-2">Ürün Adı</th>
                    <th className="py-2 text-center">Birim</th>
                    <th className="py-2 text-center">Miktar</th>
                    <th className="py-2 text-right">Birim Fiyat</th>
                    <th className="py-2 text-right">İskonto</th>
                    <th className="py-2 text-right">KDV</th>
                    <th className="py-2 text-right">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {viewingSale.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-semibold">{it.productName}</td>
                      <td className="py-2 text-center">{it.unit}</td>
                      <td className="py-2 text-center font-bold">{it.quantity}</td>
                      <td className="py-2 text-right">{it.unitPrice.toLocaleString('tr-TR')} ₺</td>
                      <td className="py-2 text-right">{it.discountRate > 0 ? `%${it.discountRate}` : '-'}</td>
                      <td className="py-2 text-right">%{it.vatRate}</td>
                      <td className="py-2 text-right font-black">{it.lineTotal.toLocaleString('tr-TR')} ₺</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-slate-300 pt-2 flex justify-end">
                <div className="w-64 space-y-1 text-right text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Mal Hizmet Toplam Tutarı:</span>
                    <span>{viewingSale.subTotal.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Hesaplanan KDV:</span>
                    <span>{viewingSale.vatTotal.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 border-t pt-1.5">
                    <span>Ödenecek Tutar:</span>
                    <span>{viewingSale.grandTotal.toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => window.print()}
                icon={<Printer className="w-4 h-4" />}
              >
                Yazdır / PDF Olarak Kaydet
              </Button>
              <Button onClick={() => setViewingSale(null)}>Kapat</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: View Return Receipt */}
      {viewingReturn && (
        <Modal
          isOpen={true}
          onClose={() => setViewingReturn(null)}
          title={`İade Makbuzu: ${viewingReturn.returnNo}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#102A43] border border-cyan-500/30 space-y-3">
              <div className="flex justify-between items-start border-b border-slate-700 pb-2">
                <div>
                  <h4 className="text-base font-black text-white">{viewingReturn.productName}</h4>
                  <p className="text-slate-400">Müşteri: {viewingReturn.customerName}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {viewingReturn.returnNo}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-400 block">Tarih:</span>
                  <span className="font-mono">{new Date(viewingReturn.date).toLocaleDateString('tr-TR')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">İade Miktarı:</span>
                  <span className="font-bold text-white">
                    {viewingReturn.quantity} {viewingReturn.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Birim Fiyat:</span>
                  <span>{(viewingReturn.refundAmount / (viewingReturn.quantity || 1)).toLocaleString('tr-TR')} ₺</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Depo Durumu:</span>
                  <span className="text-emerald-400 font-bold">
                    {viewingReturn.returnToStock ? 'Stoğa Alındı' : 'Hurdaya Ayrıldı'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm">
                <span className="text-slate-400">Toplam İade / Mahsup:</span>
                <span className="font-black text-rose-400 text-lg">
                  -{viewingReturn.refundAmount.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <span className="font-bold text-slate-400 block text-[10px] uppercase">İade Gerekçesi:</span>
              <p className="mt-0.5">{viewingReturn.reason}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => window.print()}
                icon={<Printer className="w-4 h-4" />}
              >
                Yazdır
              </Button>
              <Button variant="primary" onClick={() => setViewingReturn(null)}>
                Kapat
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
