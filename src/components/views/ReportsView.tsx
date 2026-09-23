import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  Layers,
  Users,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { Button } from '../common/Button';
import { repository } from '../../services/storage';

export const ReportsView: React.FC = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const metrics = repository.getDashboardMetrics();
  const sales = repository.getSales();
  const products = repository.getProducts();
  const customers = repository.getCustomers();

  // Export Sales to CSV
  const handleExportCSV = () => {
    const headers = ['Fatura No', 'Tarih', 'Musteri', 'Odeme Tipi', 'Ara Toplam', 'KDV', 'Genel Toplam'];
    const rows = sales.map((s) => [
      s.invoiceNo,
      new Date(s.date).toLocaleDateString('tr-TR'),
      `"${s.customerName}"`,
      s.paymentMethod,
      s.subTotal,
      s.vatTotal,
      s.grandTotal,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TeoriKimya_Satis_Raporu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Payment Breakdown
  const payments = {
    cash: 0,
    credit_card: 0,
    open_account: 0,
  };
  sales.forEach((s) => {
    payments[s.paymentMethod] += s.grandTotal;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Finansal Analiz & Satış Raporları
          </h2>
          <p className="text-xs text-slate-400">
            Dönemsel ciro, kâr marjı, nakit akışı ve ürün performans matrisi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => window.print()}
            icon={<Printer className="w-4 h-4" />}
          >
            Yazdır
          </Button>
          <Button
            variant="primary"
            onClick={handleExportCSV}
            icon={<Download className="w-4 h-4" />}
          >
            CSV Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Period Filter Buttons */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0B1B2E] border border-cyan-500/20 w-fit text-xs">
        {[
          { id: 'today', label: 'Bugün' },
          { id: 'week', label: 'Bu Hafta' },
          { id: 'month', label: 'Bu Ay' },
          { id: 'year', label: 'Bu Yıl' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setPeriod(item.id as any)}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              period === item.id ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Toplam Ciro</span>
          <h3 className="text-2xl font-black text-white mt-1">
            {metrics.monthRevenue.toLocaleString('tr-TR')} ₺
          </h3>
          <p className="text-[11px] text-cyan-400 mt-1">KDV dahil brüt satış hacmi</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Tahmini Brüt Kâr</span>
          <h3 className="text-2xl font-black text-emerald-400 mt-1">
            {metrics.grossProfitMonth.toLocaleString('tr-TR')} ₺
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Ortalama Marj: %{metrics.profitMarginMonth}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Cari Açık Hesap Alacak</span>
          <h3 className="text-2xl font-black text-amber-400 mt-1">
            {metrics.totalReceivables.toLocaleString('tr-TR')} ₺
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Müşterilerden tahsil edilecek</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold">Depodaki Mamül Değeri</span>
          <h3 className="text-2xl font-black text-[#8DE7F2] mt-1">
            {metrics.totalStockValue.toLocaleString('tr-TR')} ₺
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Maliyet tabanlı stok varlığı</p>
        </div>
      </div>

      {/* Cash Register Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-emerald-500/30">
          <span className="text-xs font-bold text-emerald-400 uppercase">Nakit Kasa Toplamı</span>
          <h4 className="text-2xl font-black text-white mt-1">
            {payments.cash.toLocaleString('tr-TR')} ₺
          </h4>
          <p className="text-xs text-slate-400 mt-1">Fiziki nakit tahsilat</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/30">
          <span className="text-xs font-bold text-cyan-400 uppercase">POS & Kredi Kartı</span>
          <h4 className="text-2xl font-black text-white mt-1">
            {payments.credit_card.toLocaleString('tr-TR')} ₺
          </h4>
          <p className="text-xs text-slate-400 mt-1">Banka POS hesabı</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-amber-500/30">
          <span className="text-xs font-bold text-amber-400 uppercase">Cari Açık Hesap Satış</span>
          <h4 className="text-2xl font-black text-white mt-1">
            {payments.open_account.toLocaleString('tr-TR')} ₺
          </h4>
          <p className="text-xs text-slate-400 mt-1">Vadeli kurumsal satışlar</p>
        </div>
      </div>

      {/* Product Profitability Matrix */}
      <div className="rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-cyan-500/15 bg-[#102A43]/50">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider">
            Ürün Kârlılık ve Fiyat Analiz Matrisi
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-[#102A43]/30 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Ürün Adı</th>
                <th className="py-3 px-4">Birim</th>
                <th className="py-3 px-4 text-right">Maliyet (₺)</th>
                <th className="py-3 px-4 text-right">Satış (₺)</th>
                <th className="py-3 px-4 text-right">Birim Kâr (₺)</th>
                <th className="py-3 px-4 text-center">Kâr Marjı</th>
                <th className="py-3 px-4 text-center">Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {products.map((p) => {
                const profit = p.salePrice - p.purchasePrice;
                const margin = p.purchasePrice > 0 ? Math.round((profit / p.salePrice) * 100) : 0;

                return (
                  <tr key={p.id} className="hover:bg-[#102A43]/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                    <td className="py-3 px-4 text-slate-400">{p.unit}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {p.purchasePrice.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-white font-bold">
                      {p.salePrice.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      +{profit.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        %{margin}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-200">{p.stock}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
