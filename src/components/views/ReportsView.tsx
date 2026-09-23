import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
  Layers,
  Users,
  Printer,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Package,
  CheckCircle2,
  AlertTriangle,
  Award,
  Flame,
  CreditCard,
  Building,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { repository } from '../../services/storage';

export const ReportsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'finance' | 'profitability' | 'cashflow' | 'payments'>('finance');
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'last_month' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Reactive storage subscription
  const [sales, setSales] = useState(repository.getSales());
  const [products, setProducts] = useState(repository.getProducts());
  const [customers, setCustomers] = useState(repository.getCustomers());
  const [expenses, setExpenses] = useState(repository.getExpenses());
  const [purchases, setPurchases] = useState(repository.getPurchases());

  useEffect(() => {
    const unsub = repository.subscribe(() => {
      setSales(repository.getSales());
      setProducts(repository.getProducts());
      setCustomers(repository.getCustomers());
      setExpenses(repository.getExpenses());
      setPurchases(repository.getPurchases());
    });
    return unsub;
  }, []);

  // Compute date range according to filter
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Filtered sales according to active period
  const filteredSales = sales.filter((s) => {
    if (s.status === 'cancelled') return false;
    const saleDateStr = s.date.split('T')[0];

    if (periodFilter === 'today') return saleDateStr === todayStr;
    if (periodFilter === 'week') {
      const diff = (now.getTime() - new Date(s.date).getTime()) / (1000 * 3600 * 24);
      return diff >= 0 && diff <= 7;
    }
    if (periodFilter === 'month') return saleDateStr.startsWith(currentMonthStr);
    if (periodFilter === 'last_month') {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lmStr = lm.toISOString().substring(0, 7);
      return saleDateStr.startsWith(lmStr);
    }
    if (periodFilter === 'custom') {
      return saleDateStr >= customStartDate && saleDateStr <= customEndDate;
    }
    return true;
  });

  // Filtered expenses
  const filteredExpenses = expenses.filter((e) => {
    const expDateStr = e.date.split('T')[0];
    if (periodFilter === 'today') return expDateStr === todayStr;
    if (periodFilter === 'week') {
      const diff = (now.getTime() - new Date(e.date).getTime()) / (1000 * 3600 * 24);
      return diff >= 0 && diff <= 7;
    }
    if (periodFilter === 'month') return expDateStr.startsWith(currentMonthStr);
    if (periodFilter === 'last_month') {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lmStr = lm.toISOString().substring(0, 7);
      return expDateStr.startsWith(lmStr);
    }
    if (periodFilter === 'custom') {
      return expDateStr >= customStartDate && expDateStr <= customEndDate;
    }
    return true;
  });

  // 10 Core Financial Metrics
  const totalCiro = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);

  // Urun Maliyeti for filtered sales
  let totalUrunMaliyeti = 0;
  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const cost = prod ? prod.purchasePrice : item.unitPrice * 0.6;
      totalUrunMaliyeti += item.quantity * cost;
    });
  });

  const brutKar = totalCiro - totalUrunMaliyeti;
  const toplamGider = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netKar = brutKar - toplamGider;
  const karMarji = totalCiro > 0 ? ((netKar / totalCiro) * 100).toFixed(1) : '0';

  // Tahsilat (nakit + kart)
  const tahsilat = filteredSales
    .filter((s) => s.paymentMethod === 'cash' || s.paymentMethod === 'credit_card')
    .reduce((sum, s) => sum + s.grandTotal, 0);

  // Cari Alacak
  const cariAlacak = customers.reduce((sum, c) => sum + c.balance, 0);

  // Tedarikçi Borcu
  const suppliers = repository.getSuppliers();
  const tedarikciBorcu = suppliers.reduce((sum, s) => sum + s.balance, 0);

  // Detailed Product Profitability (Requirement 11)
  const profitabilityResult = repository.getProductProfitability();
  const productProfitability = profitabilityResult.all.map((item) => ({
    id: item.product.id,
    name: item.product.name,
    unit: item.product.unit,
    purchasePrice: item.product.purchasePrice,
    currentStock: item.product.stock,
    totalQuantitySold: item.soldQuantity,
    totalRevenue: item.revenue,
    totalCost: item.cost,
    grossProfit: item.grossProfit,
    profitMargin: item.profitMargin,
  }));
  const topProfitProducts = [...productProfitability].sort((a, b) => b.grossProfit - a.grossProfit).slice(0, 5);
  const lowestProfitProducts = [...productProfitability].sort((a, b) => a.profitMargin - b.profitMargin).slice(0, 5);
  const topVolumeProducts = [...productProfitability].sort((a, b) => b.totalQuantitySold - a.totalQuantitySold).slice(0, 5);

  // Cash Flow Breakdown (Requirement 12)
  const cashFlowPeriod = periodFilter === 'today' ? 'today' : periodFilter === 'week' ? 'week' : 'month';
  const cashFlow = repository.getCashFlow(cashFlowPeriod);

  // Export Sales to CSV
  const handleExportCSV = () => {
    const headers = ['Fatura No', 'Tarih', 'Musteri', 'Odeme Tipi', 'Ara Toplam', 'KDV', 'Genel Toplam'];
    const rows = filteredSales.map((s) => [
      s.invoiceNo,
      new Date(s.date).toLocaleDateString('tr-TR'),
      `"${s.customerName}"`,
      s.paymentMethod,
      s.subTotal,
      s.vatTotal,
      s.grandTotal,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TeoriKimya_Finans_Raporu_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Finans, Kâr Analizi & Nakit Akışı
          </h2>
          <p className="text-xs text-slate-400">
            Dönemsel ciro, ürün maliyeti, brüt kâr, işletme giderleri, net kâr ve nakit hareketleri
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

      {/* Date Filter Toolbar (Requirement 10) */}
      <div className="p-3 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'today', label: 'Bugün' },
            { id: 'week', label: 'Bu Hafta' },
            { id: 'month', label: 'Bu Ay' },
            { id: 'last_month', label: 'Geçen Ay' },
            { id: 'custom', label: 'Özel Tarih' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriodFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                periodFilter === item.id
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'bg-[#102A43] text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {periodFilter === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-[#102A43] border border-cyan-500/30 rounded-xl px-2.5 py-1 text-white focus:outline-none focus:border-cyan-400"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-[#102A43] border border-cyan-500/30 rounded-xl px-2.5 py-1 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3">
        <button
          onClick={() => setActiveTab('finance')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'finance'
              ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-md'
              : 'bg-[#0B1B2E] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Finans Dashboard (9 Temel Değer)</span>
        </button>

        <button
          onClick={() => setActiveTab('profitability')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'profitability'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'bg-[#0B1B2E] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Ürün Bazlı Kâr Analizi</span>
        </button>

        <button
          onClick={() => setActiveTab('cashflow')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'cashflow'
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
              : 'bg-[#0B1B2E] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Nakit Akışı (Giriş / Çıkış)</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md'
              : 'bg-[#0B1B2E] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Ödeme Yöntemleri Raporu</span>
        </button>
      </div>

      {/* TAB 1: FINANS DASHBOARD (Requirement 10) */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {/* 1. TOPLAM CİRO */}
            <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-cyan-500/25 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                TOPLAM CİRO
              </span>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">
                {totalCiro.toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-[10px] text-cyan-400 mt-0.5 block font-medium">
                {filteredSales.length} Satış İşlemi
              </span>
            </div>

            {/* 2. ÜRÜN MALİYETİ */}
            <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-amber-500/25 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ÜRÜN MALİYETİ
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                {totalUrunMaliyeti.toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                Satılan Malın Maliyeti
              </span>
            </div>

            {/* 3. BRÜT KÂR */}
            <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-cyan-500/25 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                BRÜT KÂR
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#8DE7F2] mt-1">
                {brutKar.toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                Ciro − Ürün Maliyeti
              </span>
            </div>

            {/* 4. TOPLAM GİDER */}
            <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-rose-500/25 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                TOPLAM GİDER
              </span>
              <p className="text-xl sm:text-2xl font-black text-rose-400 mt-1">
                {toplamGider.toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                Kira, Maaş, Fatura vb.
              </span>
            </div>

            {/* 5. NET KÂR */}
            <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-emerald-500/30 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                NET KÂR
              </span>
              <p
                className={`text-xl sm:text-2xl font-black mt-1 ${
                  netKar >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {netKar.toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-[10px] text-emerald-300 mt-0.5 block font-medium">
                Brüt Kâr − İşletme Gideri
              </span>
            </div>

            {/* 6. KÂR MARJI */}
            <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-cyan-500/25 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                KÂR MARJI
              </span>
              <p className="text-xl sm:text-2xl font-black text-cyan-300 mt-1">
                %{karMarji}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                Net Kâr / Ciro Oranı
              </span>
            </div>

            {/* 7. TAHSİLAT */}
            <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-emerald-500/25 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                TAHSİLAT
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                {tahsilat.toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                Nakit & Kart Tahsilatı
              </span>
            </div>

            {/* 8. CARİ ALACAK */}
            <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-amber-500/25 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CARİ ALACAK
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                {cariAlacak.toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                Müşteri Açık Hesapları
              </span>
            </div>

            {/* 9. TEDARİKÇİ BORCU */}
            <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-red-500/25 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                TEDARİKÇİ BORCU
              </span>
              <p className="text-xl sm:text-2xl font-black text-red-400 mt-1">
                {tedarikciBorcu.toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                Ödenecek Mal Alımları
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT PROFITABILITY & BEST/WORST (Requirement 11) */}
      {activeTab === 'profitability' && (
        <div className="space-y-6">
          {/* 3 Featured Columns: En Çok Kâr Getiren, En Az Kâr Getiren, En Çok Satan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. En Çok Kâr Getiren Ürünler */}
            <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-emerald-500/30 shadow-xl space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-sm text-white">En Çok Kâr Getiren Ürünler</h3>
              </div>
              <div className="space-y-2">
                {topProfitProducts.map((p, idx) => (
                  <div key={p.id} className="p-2.5 rounded-xl bg-[#102A43]/50 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{idx + 1}. {p.name}</span>
                      <span className="text-[10px] text-slate-400">{p.totalQuantitySold} {p.unit} Satış</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-400 block font-mono">
                        +{p.grossProfit.toLocaleString('tr-TR')} ₺
                      </span>
                      <span className="text-[10px] text-slate-400">%{p.profitMargin} Marj</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. En Az Kâr Getiren / Düşük Marjlı Ürünler */}
            <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-amber-500/30 shadow-xl space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm text-white">En Düşük Marjlı Ürünler</h3>
              </div>
              <div className="space-y-2">
                {lowestProfitProducts.map((p, idx) => (
                  <div key={p.id} className="p-2.5 rounded-xl bg-[#102A43]/50 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{idx + 1}. {p.name}</span>
                      <span className="text-[10px] text-slate-400">Maliyet: {p.purchasePrice} ₺</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-amber-400 block font-mono">
                        +{p.grossProfit.toLocaleString('tr-TR')} ₺
                      </span>
                      <span className="text-[10px] text-amber-300">%{p.profitMargin} Marj</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. En Çok Satan Ürünler (Hacim) */}
            <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/30 shadow-xl space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Flame className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black text-sm text-white">En Çok Satan Ürünler (Adet)</h3>
              </div>
              <div className="space-y-2">
                {topVolumeProducts.map((p, idx) => (
                  <div key={p.id} className="p-2.5 rounded-xl bg-[#102A43]/50 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{idx + 1}. {p.name}</span>
                      <span className="text-[10px] text-cyan-300 font-bold">{p.totalQuantitySold} {p.unit}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-white block font-mono">
                        {p.totalRevenue.toLocaleString('tr-TR')} ₺
                      </span>
                      <span className="text-[10px] text-slate-400">Toplam Gelir</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full Detailed Profitability Table */}
          <div className="rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-2xl overflow-hidden">
            <div className="p-4 bg-[#07111F] border-b border-cyan-500/20">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Tüm Ürünlerin Detaylı Kâr ve Maliyet Tablosu
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#102A43]/40 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Ürün Adı</th>
                    <th className="py-3 px-4 text-center">Satış Adedi</th>
                    <th className="py-3 px-4 text-right">Satış Geliri</th>
                    <th className="py-3 px-4 text-right">Ürün Maliyeti</th>
                    <th className="py-3 px-4 text-right">Brüt Kâr</th>
                    <th className="py-3 px-4 text-center">Kâr Oranı</th>
                    <th className="py-3 px-4 text-center">Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {productProfitability.map((p) => (
                    <tr key={p.id} className="hover:bg-[#102A43]/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-cyan-300">
                        {p.totalQuantitySold} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {p.totalRevenue.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {p.totalCost.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-400">
                        +{p.grossProfit.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                          %{p.profitMargin}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-300">
                        {p.currentStock} {p.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CASH FLOW (Requirement 12) */}
      {activeTab === 'cashflow' && (
        <div className="space-y-6">
          {/* Top 3 Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-emerald-500/30 shadow-lg">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Toplam Nakit Girişi
              </span>
              <p className="text-3xl font-black text-emerald-400 mt-1">
                +{cashFlow.totalInflow.toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-xs text-slate-400 mt-1 block">
                Satışlar, POS ve tahsilatlar
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-rose-500/30 shadow-lg">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                Toplam Nakit Çıkışı
              </span>
              <p className="text-3xl font-black text-rose-400 mt-1">
                −{cashFlow.totalOutflow.toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-xs text-slate-400 mt-1 block">
                Mal alımı, giderler ve maaşlar
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/30 shadow-lg">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                Net Nakit Hareketi
              </span>
              <p
                className={`text-3xl font-black mt-1 ${
                  cashFlow.netCashFlow >= 0 ? 'text-[#8DE7F2]' : 'text-red-400'
                }`}
              >
                {cashFlow.netCashFlow.toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-xs text-slate-400 mt-1 block">
                Dönemsel Net Kasa / Banka Değişimi
              </span>
            </div>
          </div>

          {/* Breakdown Grid: Gelirler vs Giderler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gelir Kalemleri */}
            <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-emerald-500/20 space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" />
                Nakit Gelir Kalemleri
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-[#102A43]/50">
                  <span className="text-slate-300">Nakit Satışlar</span>
                  <span className="font-bold text-white font-mono">
                    {cashFlow.inflows.cashSales.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[#102A43]/50">
                  <span className="text-slate-300">Kart / POS Satışları</span>
                  <span className="font-bold text-white font-mono">
                    {cashFlow.inflows.cardSales.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[#102A43]/50">
                  <span className="text-slate-300">Cari Tahsilatlar</span>
                  <span className="font-bold text-white font-mono">
                    {cashFlow.inflows.collections.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[#102A43]/50">
                  <span className="text-slate-300">Havale / EFT / Banka Gelirleri</span>
                  <span className="font-bold text-white font-mono">
                    {cashFlow.inflows.bankSales.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>
            </div>

            {/* Gider Kalemleri */}
            <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-rose-500/20 space-y-4">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4" />
                Nakit Gider Kalemleri
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-[#102A43]/50">
                  <span className="text-slate-300">Mal Alımı (Peşin Alış)</span>
                  <span className="font-bold text-white font-mono">
                    {cashFlow.outflows.purchasePayments.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[#102A43]/50">
                  <span className="text-slate-300">Kira Giderleri</span>
                  <span className="font-bold text-white font-mono">
                    {(cashFlow.outflows.categoryBreakdown['Kira'] || 0).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[#102A43]/50">
                  <span className="text-slate-300">Personel Maaşları</span>
                  <span className="font-bold text-white font-mono">
                    {(cashFlow.outflows.categoryBreakdown['Maaş'] || 0).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[#102A43]/50">
                  <span className="text-slate-300">Faturalar (Elektrik, Su, Gaz vb.)</span>
                  <span className="font-bold text-white font-mono">
                    {(
                      (cashFlow.outflows.categoryBreakdown['Elektrik'] || 0) +
                      (cashFlow.outflows.categoryBreakdown['Su'] || 0) +
                      (cashFlow.outflows.categoryBreakdown['Doğalgaz'] || 0) +
                      (cashFlow.outflows.categoryBreakdown['İnternet'] || 0)
                    ).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[#102A43]/50">
                  <span className="text-slate-300">Yakıt & Araç</span>
                  <span className="font-bold text-white font-mono">
                    {(
                      (cashFlow.outflows.categoryBreakdown['Yakıt'] || 0) +
                      (cashFlow.outflows.categoryBreakdown['Araç'] || 0)
                    ).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[#102A43]/50">
                  <span className="text-slate-300">Tüm İşletme Giderleri Toplamı</span>
                  <span className="font-bold text-white font-mono">
                    {cashFlow.outflows.expensePayments.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENT METHODS (Requirement 15) */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Nakit */}
            <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-emerald-500/30">
              <span className="text-xs font-bold text-emerald-400 uppercase">Nakit</span>
              <h4 className="text-2xl font-black text-white mt-1">
                {(repository.getDashboardMetrics().paymentBreakdown.cash || 0).toLocaleString('tr-TR')} ₺
              </h4>
              <p className="text-xs text-slate-400 mt-1">Fiziki kasa nakit tahsilatı</p>
            </div>

            {/* Kredi Kartı */}
            <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/30">
              <span className="text-xs font-bold text-cyan-400 uppercase">Kredi Kartı</span>
              <h4 className="text-2xl font-black text-white mt-1">
                {(repository.getDashboardMetrics().paymentBreakdown.creditCard || 0).toLocaleString('tr-TR')} ₺
              </h4>
              <p className="text-xs text-slate-400 mt-1">Banka POS cihazı tahsilatı</p>
            </div>

            {/* Veresiye / Cari */}
            <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-amber-500/30">
              <span className="text-xs font-bold text-amber-400 uppercase">Veresiye / Açık Hesap</span>
              <h4 className="text-2xl font-black text-white mt-1">
                {(repository.getDashboardMetrics().paymentBreakdown.openAccount || 0).toLocaleString('tr-TR')} ₺
              </h4>
              <p className="text-xs text-slate-400 mt-1">Cari hesaba borç kaydedilen satışlar</p>
            </div>

            {/* Havale / EFT */}
            <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-purple-500/30">
              <span className="text-xs font-bold text-purple-400 uppercase">Havale / EFT</span>
              <h4 className="text-2xl font-black text-white mt-1">
                {(repository.getDashboardMetrics().paymentBreakdown.bankTransfer || 0).toLocaleString('tr-TR')} ₺
              </h4>
              <p className="text-xs text-slate-400 mt-1">Banka hesabına doğrudan transfer</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
