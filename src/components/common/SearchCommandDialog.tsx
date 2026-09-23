import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Users,
  ShoppingCart,
  FileText,
  FlaskConical,
  Sparkles,
  ArrowRight,
  X,
  PlusCircle,
  QrCode,
} from 'lucide-react';
import { repository } from '../../services/storage';

interface SearchCommandDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onQuickAction?: (action: string) => void;
}

export const SearchCommandDialog: React.FC<SearchCommandDialogProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onQuickAction,
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or toggle
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const products = repository.getProducts();
  const customers = repository.getCustomers();
  const orders = repository.getOrders();
  const sales = repository.getSales();

  const q = query.trim().toLowerCase();

  // Filtered results
  const filteredProducts = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    : [];

  const filteredCustomers = q
    ? customers.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.contactPerson.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.city.toLowerCase().includes(q)
      )
    : [];

  const filteredOrders = q
    ? orders.filter(
        (o) =>
          o.orderNo.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q)
      )
    : [];

  const filteredSales = q
    ? sales.filter(
        (s) =>
          s.invoiceNo.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q)
      )
    : [];

  const quickPages = [
    { id: 'dashboard', name: 'Ana Dashboard', icon: <ArrowRight className="w-4 h-4" /> },
    { id: 'pos', name: 'Satış & Hızlı Kasa (POS)', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'barcode', name: 'Barkod Okutucu / Tara', icon: <QrCode className="w-4 h-4" /> },
    { id: 'products', name: 'Ürün Yönetimi', icon: <Package className="w-4 h-4" /> },
    { id: 'purchases', name: 'Mal Alımı / Stok Girişi', icon: <Package className="w-4 h-4 text-emerald-400" /> },
    { id: 'expenses', name: 'Giderler & Personel Maaş', icon: <FileText className="w-4 h-4 text-amber-400" /> },
    { id: 'reports', name: 'Finans, Kâr Analizi & Nakit Akışı', icon: <FileText className="w-4 h-4 text-cyan-400" /> },
    { id: 'stock', name: 'Stok Hareketleri & Envanter', icon: <Package className="w-4 h-4" /> },
    { id: 'production', name: 'Üretim & Reçete', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'customers', name: 'Müşteriler (Cari Hesap)', icon: <Users className="w-4 h-4" /> },
    { id: 'invoices', name: 'Faturalar', icon: <FileText className="w-4 h-4" /> },
    { id: 'kimyager', name: 'Kimyager AI Asistanı', icon: <Sparkles className="w-4 h-4" /> },
  ].filter((p) => !q || p.name.toLowerCase().includes(q));

  const handleSelectPage = (tabId: string) => {
    onNavigate(tabId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#0B1B2E] border border-cyan-500/30 shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[80vh] text-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-cyan-500/20 bg-[#102A43]/50 gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            placeholder="Ürün adı, barkod, cari firma, fatura veya sayfa ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="p-3 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Quick Actions if no query */}
          {!q && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Hızlı İşlemler
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    onNavigate('pos');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/20 text-cyan-300 transition-colors text-left"
                >
                  <ShoppingCart className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold">Satış Yap (POS)</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('barcode');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/20 text-cyan-300 transition-colors text-left"
                >
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold">Barkod Okut</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('products');
                    if (onQuickAction) onQuickAction('add-product');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/20 text-cyan-300 transition-colors text-left"
                >
                  <PlusCircle className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold">Yeni Ürün Ekle</span>
                </button>
              </div>
            </div>
          )}

          {/* Products match */}
          {filteredProducts.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider px-2">
                Ürünler ({filteredProducts.length})
              </span>
              {filteredProducts.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectPage('products')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#163A5F] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">{p.name}</p>
                      <p className="text-[11px] text-slate-400">
                        Kod: {p.code} | Barkod: {p.barcode} | Stok: {p.stock} {p.unit}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-cyan-300 text-sm">{p.salePrice} ₺</span>
                </div>
              ))}
            </div>
          )}

          {/* Customers match */}
          {filteredCustomers.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider px-2">
                Müşteriler / Cariler ({filteredCustomers.length})
              </span>
              {filteredCustomers.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectPage('customers')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#163A5F] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">{c.companyName}</p>
                      <p className="text-[11px] text-slate-400">{c.contactPerson} - {c.city}</p>
                    </div>
                  </div>
                  <span className="text-amber-300 font-semibold">{c.balance.toLocaleString('tr-TR')} ₺ Borç</span>
                </div>
              ))}
            </div>
          )}

          {/* Orders match */}
          {filteredOrders.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider px-2">
                Siparişler ({filteredOrders.length})
              </span>
              {filteredOrders.slice(0, 3).map((o) => (
                <div
                  key={o.id}
                  onClick={() => handleSelectPage('orders')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#163A5F] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingCart className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">{o.orderNo} - {o.customerName}</p>
                      <p className="text-[11px] text-slate-400">Durum: {o.status}</p>
                    </div>
                  </div>
                  <span className="font-bold text-white">{o.totalAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
              ))}
            </div>
          )}

          {/* Invoices match */}
          {filteredSales.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider px-2">
                Satış Faturaları ({filteredSales.length})
              </span>
              {filteredSales.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSelectPage('invoices')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#163A5F] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">{s.invoiceNo} - {s.customerName}</p>
                      <p className="text-[11px] text-slate-400">{new Date(s.date).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-400">{s.grandTotal.toLocaleString('tr-TR')} ₺</span>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Pages */}
          <div className="space-y-1 pt-1 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Modüller & Sayfalar
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {quickPages.slice(0, 8).map((page) => (
                <button
                  key={page.id}
                  onClick={() => handleSelectPage(page.id)}
                  className="flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#102A43] text-left transition-colors"
                >
                  <span className="text-cyan-400">{page.icon}</span>
                  <span className="font-medium">{page.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#07111F] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Aramak için yazın</span>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">ESC</kbd>
            <span>Kapat</span>
          </div>
        </div>
      </div>
    </div>
  );
};
