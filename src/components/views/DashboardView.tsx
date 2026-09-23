import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  ShoppingBag,
  ShoppingCart,
  PlusCircle,
  QrCode,
  FlaskConical,
  ArrowUpRight,
  Clock,
  Layers,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { PaymentMethod } from '../../types';
import { repository } from '../../services/storage';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onQuickAction: (action: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onQuickAction }) => {
  const metrics = repository.getDashboardMetrics();
  const sales = repository.getSales();
  const products = repository.getProducts();
  const orders = repository.getOrders();
  const customers = repository.getCustomers();

  // Top critical stock products
  const criticalProducts = products.filter((p) => p.stock <= p.minStock).slice(0, 5);

  // Recent 5 sales
  const recentSales = sales.slice(0, 5);

  // Top selling products by sales occurrences
  const productSalesCount: Record<string, { name: string; count: number; revenue: number; unit: string }> = {};
  sales.forEach((s) => {
    if (s.status !== 'cancelled') {
      s.items.forEach((item) => {
        if (!productSalesCount[item.productId]) {
          productSalesCount[item.productId] = {
            name: item.productName,
            count: 0,
            revenue: 0,
            unit: item.unit,
          };
        }
        productSalesCount[item.productId].count += item.quantity;
        productSalesCount[item.productId].revenue += item.lineTotal;
      });
    }
  });

  const topProducts = Object.values(productSalesCount)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  // Payment type breakdown
  const paymentTotals: Record<PaymentMethod, number> = {
    cash: 0,
    credit_card: 0,
    open_account: 0,
    bank_transfer: 0,
  };
  sales.forEach((s) => {
    if (s.status !== 'cancelled') {
      paymentTotals[s.paymentMethod] = (paymentTotals[s.paymentMethod] || 0) + s.grandTotal;
    }
  });

  const totalPayments =
    paymentTotals.cash +
      paymentTotals.credit_card +
      paymentTotals.open_account +
      paymentTotals.bank_transfer || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner with subtle chemical ambient glow */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#0B1B2E] via-[#102A43] to-[#163A5F] border border-cyan-500/25 shadow-xl shadow-cyan-950/20">
        {/* Subtle decorative bubble rings in background like the card */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none hidden sm:block">
          <svg width="220" height="220" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="#8DE7F2" strokeWidth="6" />
            <circle cx="150" cy="60" r="35" stroke="#55BBD9" strokeWidth="4" />
            <circle cx="45" cy="140" r="28" stroke="#8DE7F2" strokeWidth="3" />
            <circle cx="160" cy="150" r="20" stroke="#55BBD9" strokeWidth="2.5" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            İşletme Yönetim Merkezi
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            TEORİ KİMYA ERP PORTALI
          </h2>
          <p className="text-xs sm:text-sm text-cyan-100/80 leading-relaxed">
            Endüstriyel & Kurumsal Temizlik Ürünleri üretim, stok, açık hesap cari ve B2B satış operasyonlarınızı tek ekrandan anlık yönetin.
          </p>

          {/* Quick Action Ribbon */}
          <div className="pt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              icon={<ShoppingCart className="w-4 h-4" />}
              onClick={() => onNavigate('pos')}
            >
              Hızlı Satış Yap
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<QrCode className="w-4 h-4 text-cyan-400" />}
              onClick={() => onNavigate('barcode')}
            >
              Barkod Tara
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={() => {
                onNavigate('products');
                onQuickAction('add-product');
              }}
            >
              Yeni Ürün Ekle
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<FlaskConical className="w-4 h-4 text-emerald-400" />}
              onClick={() => onNavigate('production')}
            >
              Üretim Emri
            </Button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards (10 Core Metrics calculated from real data) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Bugünkü Ciro"
          value={`${metrics.todayRevenue.toLocaleString('tr-TR')} ₺`}
          subtitle={`${metrics.todaySalesCount} Satış Faturası`}
          icon={<DollarSign className="w-5 h-5" />}
          highlightColor="cyan"
          trend={{ value: '%12', isPositive: true }}
          onClick={() => onNavigate('invoices')}
        />
        <StatCard
          title="Bu Ayki Ciro"
          value={`${metrics.monthRevenue.toLocaleString('tr-TR')} ₺`}
          subtitle={`${metrics.monthSalesCount} Toplam Satış`}
          icon={<TrendingUp className="w-5 h-5" />}
          highlightColor="blue"
          trend={{ value: '%18.4', isPositive: true }}
          onClick={() => onNavigate('invoices')}
        />
        <StatCard
          title="Brüt Kâr (Ay)"
          value={`${metrics.grossProfitMonth.toLocaleString('tr-TR')} ₺`}
          subtitle={`Kâr Marjı: %${metrics.profitMarginMonth}`}
          icon={<TrendingUp className="w-5 h-5" />}
          highlightColor="emerald"
          onClick={() => onNavigate('reports')}
        />
        <StatCard
          title="Toplam Stok Değeri"
          value={`${metrics.totalStockValue.toLocaleString('tr-TR')} ₺`}
          subtitle="Maliyet Esaslı Değer"
          icon={<Package className="w-5 h-5" />}
          highlightColor="amber"
          onClick={() => onNavigate('stock')}
        />
        <StatCard
          title="Kritik Stok"
          value={`${metrics.criticalStockCount} Ürün`}
          subtitle="Eşik Altında Kalanlar"
          icon={<AlertTriangle className="w-5 h-5" />}
          highlightColor={metrics.criticalStockCount > 0 ? 'rose' : 'cyan'}
          onClick={() => onNavigate('stock')}
        />
        <StatCard
          title="Cari Alacak"
          value={`${metrics.totalReceivables.toLocaleString('tr-TR')} ₺`}
          subtitle="Müşteri Açık Hesapları"
          icon={<Users className="w-5 h-5" />}
          highlightColor="blue"
          onClick={() => onNavigate('customers')}
        />
        <StatCard
          title="Bekleyen Sipariş"
          value={`${metrics.pendingOrdersCount} Sipariş`}
          subtitle="Hazırlanacak B2B"
          icon={<ShoppingBag className="w-5 h-5" />}
          highlightColor="cyan"
          onClick={() => onNavigate('orders')}
        />
        <StatCard
          title="Kayıtlı Mamül"
          value={`${products.length} Ürün`}
          subtitle="Aktif Portföy"
          icon={<Layers className="w-5 h-5" />}
          highlightColor="cyan"
          onClick={() => onNavigate('products')}
        />
        <StatCard
          title="Kayıtlı Müşteri"
          value={`${customers.length} Firma`}
          subtitle="Kurumsal Cari"
          icon={<Users className="w-5 h-5" />}
          highlightColor="emerald"
          onClick={() => onNavigate('customers')}
        />
        <StatCard
          title="Bugünkü Satış"
          value={`${metrics.todaySalesCount} Adet`}
          subtitle="Tamamlanan Fiş"
          icon={<ShoppingCart className="w-5 h-5" />}
          highlightColor="amber"
          onClick={() => onNavigate('pos')}
        />
      </div>

      {/* Middle Grid: Charts & Operational Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Breakdown & Revenue Mix */}
        <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              Ödeme Türü Dağılımı
            </h3>
            <span className="text-[11px] text-slate-400">Genel Ciro İçinde</span>
          </div>

          <div className="space-y-3">
            {/* Cash */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Nakit Tahsilat</span>
                <span className="font-bold text-emerald-400">
                  {paymentTotals.cash.toLocaleString('tr-TR')} ₺ (%
                  {Math.round((paymentTotals.cash / totalPayments) * 100)}
                  )
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(paymentTotals.cash / totalPayments) * 100}%` }}
                />
              </div>
            </div>

            {/* Credit Card */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Kredi Kartı / POS</span>
                <span className="font-bold text-cyan-400">
                  {paymentTotals.credit_card.toLocaleString('tr-TR')} ₺ (%
                  {Math.round((paymentTotals.credit_card / totalPayments) * 100)}
                  )
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${(paymentTotals.credit_card / totalPayments) * 100}%` }}
                />
              </div>
            </div>

            {/* Open Account (Cari) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Açık Hesap / Cari Satış</span>
                <span className="font-bold text-amber-400">
                  {paymentTotals.open_account.toLocaleString('tr-TR')} ₺ (%
                  {Math.round((paymentTotals.open_account / totalPayments) * 100)}
                  )
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(paymentTotals.open_account / totalPayments) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
            <span>Toplam Tahsil Edilebilir Bakiye:</span>
            <span className="font-black text-white text-sm">
              {metrics.totalReceivables.toLocaleString('tr-TR')} ₺
            </span>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              En Çok Satan Ürünler
            </h3>
            <button
              onClick={() => onNavigate('reports')}
              className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
            >
              Tüm Rapor
            </button>
          </div>

          <div className="space-y-2.5">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Henüz satış verisi bulunmuyor.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#102A43]/40 border border-slate-800/80"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white truncate max-w-[180px]">{p.name}</p>
                    <p className="text-[10px] text-slate-400">
                      Toplam: {p.count} {p.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-cyan-300">
                      {p.revenue.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Critical Stock Alert Box */}
        <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-red-500/25 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Kritik Stok Uyarısı
            </h3>
            <button
              onClick={() => onNavigate('stock')}
              className="text-[11px] text-red-400 hover:underline cursor-pointer"
            >
              Stok Yönetimi
            </button>
          </div>

          <div className="space-y-2.5">
            {criticalProducts.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span>Harika! Tüm ürün stokları güvenli seviyede.</span>
              </div>
            ) : (
              criticalProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-red-950/20 border border-red-500/30 text-xs"
                >
                  <div className="space-y-0.5 truncate max-w-[170px]">
                    <p className="font-semibold text-white truncate">{prod.name}</p>
                    <p className="text-[10px] text-slate-400">Min. Eşik: {prod.minStock} {prod.unit}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md font-black text-xs bg-red-500/30 text-red-300 border border-red-500/40">
                      {prod.stock} {prod.unit}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Sales & Pending Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Table */}
        <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Son Satış Faturaları
            </h3>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              Tümünü Gör <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                  <th className="pb-2">Fatura No</th>
                  <th className="pb-2">Müşteri</th>
                  <th className="pb-2">Ödeme</th>
                  <th className="pb-2 text-right">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-mono text-cyan-300 font-semibold">{sale.invoiceNo}</td>
                    <td className="py-2.5 font-medium text-slate-200 truncate max-w-[140px]">{sale.customerName}</td>
                    <td className="py-2.5">
                      <Badge
                        variant={
                          sale.paymentMethod === 'open_account'
                            ? 'warning'
                            : sale.paymentMethod === 'credit_card'
                            ? 'cyan'
                            : 'success'
                        }
                        size="sm"
                      >
                        {sale.paymentMethod === 'open_account'
                          ? 'Açık Hesap'
                          : sale.paymentMethod === 'credit_card'
                          ? 'Kart'
                          : 'Nakit'}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right font-bold text-white">
                      {sale.grandTotal.toLocaleString('tr-TR')} ₺
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending B2B Orders */}
        <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              Bekleyen B2B Siparişler
            </h3>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              Sipariş Listesi <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {orders.slice(0, 4).map((ord) => (
              <div
                key={ord.id}
                onClick={() => onNavigate('orders')}
                className="p-3 rounded-xl bg-[#102A43]/40 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex items-center justify-between text-xs cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-300 font-bold">{ord.orderNo}</span>
                    <Badge
                      variant={
                        ord.status === 'delivered'
                          ? 'success'
                          : ord.status === 'shipped'
                          ? 'info'
                          : ord.status === 'preparing'
                          ? 'cyan'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {ord.status === 'pending'
                        ? 'Bekliyor'
                        : ord.status === 'preparing'
                        ? 'Hazırlanıyor'
                        : ord.status === 'shipped'
                        ? 'Sevk Edildi'
                        : ord.status === 'delivered'
                        ? 'Teslim Edildi'
                        : 'Taslak'}
                    </Badge>
                  </div>
                  <p className="font-semibold text-slate-200">{ord.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-white text-sm">
                    {ord.totalAmount.toLocaleString('tr-TR')} ₺
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                    <Calendar className="w-3 h-3" />
                    {new Date(ord.orderDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
