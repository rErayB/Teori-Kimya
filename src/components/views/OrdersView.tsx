import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  FileText,
  Building2,
  Calendar,
  AlertCircle,
  Printer,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Order, OrderStatus, Customer, Product } from '../../types';
import { repository } from '../../services/storage';

export const OrdersView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(repository.getOrders());
  const [customers] = useState<Customer[]>(repository.getCustomers());
  const [products] = useState<Product[]>(repository.getProducts());

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New order modal
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: products[0]?.id || '', quantity: 5 },
  ]);
  const [deliveryAddress, setDeliveryAddress] = useState(customers[0]?.address || '');
  const [orderNotes, setOrderNotes] = useState('');

  // Selected Order detail modal
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  useEffect(() => {
    const unsub = repository.subscribe(() => {
      setOrders(repository.getOrders());
    });
    return unsub;
  }, []);

  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    repository.updateOrderStatus(orderId, nextStatus);
    if (viewingOrder && viewingOrder.id === orderId) {
      setViewingOrder(repository.getOrders().find((o) => o.id === orderId) || null);
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const items = orderItems
      .filter((i) => i.productId && i.quantity > 0)
      .map((i) => {
        const prod = products.find((p) => p.id === i.productId)!;
        const lineTotal = prod.salePrice * i.quantity;
        return {
          productId: prod.id,
          productName: prod.name,
          unit: prod.unit,
          unitPrice: prod.salePrice,
          quantity: i.quantity,
          discountRate: 0,
          vatRate: prod.vatRate,
          lineTotal,
        };
      });

    if (items.length === 0) return;

    const totalAmount = items.reduce((acc, it) => acc + it.lineTotal, 0);

    repository.addOrder({
      orderNo: repository.generateOrderNo(),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.companyName,
      status: 'pending',
      orderDate: new Date().toISOString(),
      items,
      totalAmount,
      deliveryAddress: deliveryAddress || selectedCustomer.address,
      notes: orderNotes,
    });

    setIsNewOrderModalOpen(false);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="neutral">Taslak</Badge>;
      case 'pending':
        return <Badge variant="warning">Bekliyor</Badge>;
      case 'approved':
        return <Badge variant="cyan">Onaylandı</Badge>;
      case 'preparing':
        return <Badge variant="info">Hazırlanıyor</Badge>;
      case 'shipped':
        return <Badge variant="cyan">Sevk Edildi</Badge>;
      case 'delivered':
        return <Badge variant="success">Teslim Edildi</Badge>;
      case 'cancelled':
        return <Badge variant="danger">İptal Edildi</Badge>;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q || o.orderNo.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-cyan-400" />
            Sipariş Yönetimi (B2B)
          </h2>
          <p className="text-xs text-slate-400">
            Kurumsal sipariş takibi, hazırlık ve lojistik sevkiyat durumları
          </p>
        </div>

        <Button
          onClick={() => {
            setDeliveryAddress(customers[0]?.address || '');
            setIsNewOrderModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Yeni Sipariş Aç
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Sipariş no veya cari firma ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#102A43] border border-cyan-500/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1">
          {['all', 'pending', 'approved', 'preparing', 'shipped', 'delivered', 'cancelled'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-[#102A43] text-slate-300 hover:text-white'
                }`}
              >
                {st === 'all'
                  ? 'Tümü'
                  : st === 'pending'
                  ? 'Bekleyenler'
                  : st === 'approved'
                  ? 'Onaylananlar'
                  : st === 'preparing'
                  ? 'Hazırlananlar'
                  : st === 'shipped'
                  ? 'Sevk Edilenler'
                  : st === 'delivered'
                  ? 'Teslim Edilenler'
                  : 'İptaller'}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-[#102A43]/60 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Sipariş No</th>
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Müşteri / Cari</th>
                <th className="py-3 px-4">Ürün Kalemleri</th>
                <th className="py-3 px-4 text-center">Durum</th>
                <th className="py-3 px-4 text-right">Tutar</th>
                <th className="py-3 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Sipariş bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#102A43]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">{ord.orderNo}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(ord.orderDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{ord.customerName}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(ord.status)}</td>
                    <td className="py-3 px-4 text-right font-mono font-black text-white text-sm">
                      {ord.totalAmount.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setViewingOrder(ord)}
                      >
                        Detay & Yönet
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!viewingOrder}
        onClose={() => setViewingOrder(null)}
        title="Sipariş Detayı & Sevkiyat Yönetimi"
        subtitle={viewingOrder ? `${viewingOrder.orderNo} nolu sipariş süreci` : ''}
        maxWidth="xl"
      >
        {viewingOrder && (
          <div className="space-y-4 text-xs">
            {/* Order status step bar */}
            <div className="p-3 rounded-xl bg-[#102A43] border border-cyan-500/25 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Mevcut Durum</span>
                <div className="mt-1">{getStatusBadge(viewingOrder.status)}</div>
              </div>

              {/* Status progression buttons */}
              <div className="flex flex-wrap gap-1.5">
                {viewingOrder.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleStatusChange(viewingOrder.id, 'approved')}
                  >
                    Siparişi Onayla
                  </Button>
                )}
                {viewingOrder.status === 'approved' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleStatusChange(viewingOrder.id, 'preparing')}
                  >
                    Hazırlanıyor Yap
                  </Button>
                )}
                {viewingOrder.status === 'preparing' && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleStatusChange(viewingOrder.id, 'shipped')}
                  >
                    Sevkiyata Ver (Sevk Edildi)
                  </Button>
                )}
                {viewingOrder.status === 'shipped' && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleStatusChange(viewingOrder.id, 'delivered')}
                  >
                    Teslim Edildi
                  </Button>
                )}
                {viewingOrder.status !== 'cancelled' && viewingOrder.status !== 'delivered' && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleStatusChange(viewingOrder.id, 'cancelled')}
                  >
                    İptal Et
                  </Button>
                )}
              </div>
            </div>

            {/* Customer & Delivery address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Cari Müşteri</p>
                <p className="font-bold text-white text-sm">{viewingOrder.customerName}</p>
                <p className="text-[11px] text-slate-300 mt-1">
                  Sipariş Tarihi: {new Date(viewingOrder.orderDate).toLocaleString('tr-TR')}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Teslimat Adresi</p>
                <p className="text-slate-300">{viewingOrder.deliveryAddress || 'Belirtilmedi'}</p>
                {viewingOrder.notes && (
                  <p className="text-[11px] text-amber-300 mt-1">Not: {viewingOrder.notes}</p>
                )}
              </div>
            </div>

            {/* Order Items Table */}
            <div className="border border-cyan-500/20 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#102A43] text-slate-300 font-semibold border-b border-cyan-500/20">
                    <th className="p-2.5">Ürün</th>
                    <th className="p-2.5 text-center">Birim</th>
                    <th className="p-2.5 text-center">Miktar</th>
                    <th className="p-2.5 text-right">Birim Fiyat</th>
                    <th className="p-2.5 text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {viewingOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold text-white">{it.productName}</td>
                      <td className="p-2.5 text-center text-slate-400">{it.unit}</td>
                      <td className="p-2.5 text-center font-bold text-cyan-300">{it.quantity}</td>
                      <td className="p-2.5 text-right">{it.unitPrice.toLocaleString('tr-TR')} ₺</td>
                      <td className="p-2.5 text-right font-bold text-white">
                        {it.lineTotal.toLocaleString('tr-TR')} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.print()}
                icon={<Printer className="w-4 h-4" />}
              >
                Yazdır / İrsaliye
              </Button>
              <div className="text-right">
                <span className="text-xs text-slate-400">Genel Toplam:</span>
                <span className="text-xl font-black text-cyan-300 ml-2">
                  {viewingOrder.totalAmount.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* New Order Modal */}
      <Modal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        title="Yeni B2B Sipariş Oluştur"
        subtitle="Müşteri sipariş kaydını sisteme işleyin"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
          {/* Customer */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Müşteri Seçin *</label>
            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const cust = customers.find((c) => c.id === e.target.value) || null;
                setSelectedCustomer(cust);
                if (cust) setDeliveryAddress(cust.address);
              }}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.contactPerson} - {c.city})
                </option>
              ))}
            </select>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-semibold">Sipariş Kalemleri *</label>
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={item.productId}
                  onChange={(e) => {
                    const updated = [...orderItems];
                    updated[index].productId = e.target.value;
                    setOrderItems(updated);
                  }}
                  className="flex-1 bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.salePrice} ₺ - Stok: {p.stock})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const updated = [...orderItems];
                    updated[index].quantity = parseInt(e.target.value) || 1;
                    setOrderItems(updated);
                  }}
                  className="w-20 bg-[#102A43] border border-cyan-500/30 rounded-xl px-2 py-2 text-center text-white font-mono font-bold"
                />

                {orderItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setOrderItems(orderItems.filter((_, i) => i !== index))}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg cursor-pointer"
                  >
                    Sil
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setOrderItems([...orderItems, { productId: products[0]?.id || '', quantity: 1 }])
              }
              className="text-xs text-cyan-400 hover:underline font-semibold cursor-pointer pt-1"
            >
              + Yeni Kalem Ekle
            </button>
          </div>

          {/* Address */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Teslimat Adresi</label>
            <textarea
              rows={2}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Sipariş Notu</label>
            <input
              type="text"
              placeholder="Örn: Fabrika teslimi, sabah 09:00 - 12:00 arası kabul"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsNewOrderModalOpen(false)}>
              İptal
            </Button>
            <Button type="submit" variant="primary">
              Siparişi Kaydet
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
