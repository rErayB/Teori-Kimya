import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Banknote,
  FileText,
  Printer,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Building,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Customer, CustomerTransaction } from '../../types';
import { repository } from '../../services/storage';

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(repository.getCustomers());
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Payment/Debt Form
  const [txType, setTxType] = useState<'payment' | 'debt'>('payment');
  const [txAmount, setTxAmount] = useState<number>(1000);
  const [txDescription, setTxDescription] = useState('');

  // New Customer Form
  const [customerForm, setCustomerForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    taxOffice: 'Kütahya',
    taxNumber: '',
    address: '',
    city: 'Kütahya',
    creditLimit: 50000,
  });

  useEffect(() => {
    const unsub = repository.subscribe(() => {
      setCustomers(repository.getCustomers());
    });
    return unsub;
  }, []);

  const totalReceivables = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);

  const handleOpenTransaction = (c: Customer, type: 'payment' | 'debt') => {
    setSelectedCustomer(c);
    setTxType(type);
    setTxAmount(type === 'payment' ? Math.min(c.balance, 5000) || 1000 : 2500);
    setTxDescription(type === 'payment' ? 'Nakit / Havale Tahsilatı' : 'Hizmet / İlave Mal Sevkiyat Borcu');
    setIsPaymentModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    if (txType === 'payment') {
      repository.addCustomerPayment(selectedCustomer.id, txAmount, txDescription);
    } else {
      repository.addCustomerDebt(selectedCustomer.id, txAmount, txDescription);
    }

    setIsPaymentModalOpen(false);
  };

  const handleOpenStatement = (c: Customer) => {
    setSelectedCustomer(c);
    setIsStatementModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.companyName.trim()) return;

    repository.addCustomer({
      ...customerForm,
      riskLimit: customerForm.creditLimit || 50000,
    });

    setIsAddCustomerOpen(false);
    setCustomerForm({
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      taxOffice: 'Kütahya',
      taxNumber: '',
      address: '',
      city: 'Kütahya',
      creditLimit: 50000,
    });
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      c.companyName.toLowerCase().includes(q) ||
      c.contactPerson.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Müşteriler & Cari Hesaplar
          </h2>
          <p className="text-xs text-slate-400">
            Toplam Alacak: <span className="font-bold text-amber-400">{totalReceivables.toLocaleString('tr-TR')} ₺</span> | {customers.length} Kurumsal Müşteri
          </p>
        </div>

        <Button
          onClick={() => setIsAddCustomerOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Yeni Cari Hesap Aç
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-3 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-md">
        <div className="relative">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Firma adı, yetkili, telefon veya şehir ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#102A43] border border-cyan-500/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const limit = cust.creditLimit || cust.riskLimit || 0;
          const isOverLimit = limit > 0 && cust.balance >= limit;
          return (
            <div
              key={cust.id}
              className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 hover:border-cyan-400/50 transition-all flex flex-col justify-between shadow-lg space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                      {cust.city}
                    </span>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {cust.companyName}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium">{cust.contactPerson}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Bakiye</span>
                    <div
                      className={`text-lg font-black ${
                        cust.balance > 0 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {cust.balance.toLocaleString('tr-TR')} ₺
                    </div>
                    <span className="text-[9px] text-slate-500">
                      {cust.balance > 0 ? 'Borçlu' : 'Bakiyesi Yok'}
                    </span>
                  </div>
                </div>

                {isOverLimit && (
                  <div className="mt-2 p-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-[10px] text-red-300 flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Kredi limiti ({limit.toLocaleString('tr-TR')} ₺) aşıldı!</span>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                  <p className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{cust.phone}</span>
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{cust.email || '-'}</span>
                  </p>
                  <p className="flex items-center gap-2 text-[11px] truncate">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{cust.address}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleOpenTransaction(cust, 'payment')}
                  icon={<Banknote className="w-3.5 h-3.5" />}
                  className="flex-1"
                >
                  Tahsilat
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleOpenTransaction(cust, 'debt')}
                  icon={<TrendingDown className="w-3.5 h-3.5 text-amber-400" />}
                >
                  Borç
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenStatement(cust)}
                  icon={<FileText className="w-3.5 h-3.5" />}
                >
                  Ekstre
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Statement (Cari Ekstre) Modal */}
      <Modal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        title="Cari Hesap Ekstresi"
        subtitle={selectedCustomer ? selectedCustomer.companyName : ''}
        maxWidth="2xl"
      >
        {selectedCustomer && (
          <div className="space-y-4">
            <div id="printable-statement" className="p-4 rounded-xl bg-white text-slate-900 text-xs font-sans space-y-3">
              <div className="flex justify-between items-start border-b pb-2">
                <div>
                  <h3 className="font-black text-base">TEORİ KİMYA</h3>
                  <p className="text-[10px] text-slate-600">Endüstriyel & Kurumsal Temizlik Ürünleri</p>
                  <p className="text-[10px] text-slate-500">Kütahya | +90 544 214 5940</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded text-[10px]">
                    CARİ HESAP EKSTRESİ
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Tarih: {new Date().toLocaleDateString('tr-TR')}
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    Bakiye: {selectedCustomer.balance.toLocaleString('tr-TR')} ₺
                  </p>
                </div>
              </div>

              <div className="p-2 bg-slate-100 rounded">
                <p className="font-bold text-slate-900">{selectedCustomer.companyName}</p>
                <p className="text-[11px] text-slate-600">
                  Yetkili: {selectedCustomer.contactPerson} | Tel: {selectedCustomer.phone}
                </p>
                <p className="text-[10px] text-slate-500">
                  Vergi D.: {selectedCustomer.taxOffice} - V.No: {selectedCustomer.taxNumber}
                </p>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-[10px] uppercase font-bold text-slate-600">
                    <th className="py-1">Tarih</th>
                    <th className="py-1">İşlem / Açıklama</th>
                    <th className="py-1 text-right">Borç (₺)</th>
                    <th className="py-1 text-right">Alacak (₺)</th>
                    <th className="py-1 text-right">Bakiye (₺)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {selectedCustomer.transactions.map((t) => {
                    const isDebit = t.type === 'invoice' || t.type === 'manual_debt';
                    return (
                      <tr key={t.id}>
                        <td className="py-1 font-mono text-slate-600">
                          {new Date(t.date).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-1">{t.description}</td>
                        <td className="py-1 text-right font-mono">
                          {isDebit ? t.amount.toLocaleString('tr-TR') : '-'}
                        </td>
                        <td className="py-1 text-right font-mono text-emerald-700">
                          {!isDebit ? t.amount.toLocaleString('tr-TR') : '-'}
                        </td>
                        <td className="py-1 text-right font-mono font-bold">
                          {t.balanceAfter.toLocaleString('tr-TR')} ₺
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="border-t pt-2 flex justify-end font-bold text-sm">
                <span>Güncel Bakiye: {selectedCustomer.balance.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
                Ekstre Yazdır / PDF
              </Button>
              <Button onClick={() => setIsStatementModalOpen(false)}>Kapat</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Payment / Debt Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={txType === 'payment' ? 'Tahsilat Al (Ödeme Girişi)' : 'Cariye Borç Ekle'}
        subtitle={selectedCustomer ? selectedCustomer.companyName : ''}
        maxWidth="md"
      >
        {selectedCustomer && (
          <form onSubmit={handleSaveTransaction} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-[#102A43] border border-cyan-500/25 flex justify-between">
              <span className="text-slate-400">Güncel Cari Bakiye:</span>
              <span className="font-bold text-amber-400 text-sm">
                {selectedCustomer.balance.toLocaleString('tr-TR')} ₺
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                İşlem Tutarı (₺) *
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={txAmount}
                onChange={(e) => setTxAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Açıklama / Makbuz No *</label>
              <input
                type="text"
                required
                value={txDescription}
                onChange={(e) => setTxDescription(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)}>
                Vazgeç
              </Button>
              <Button type="submit" variant={txType === 'payment' ? 'success' : 'primary'}>
                {txType === 'payment' ? 'Tahsilatı Onayla' : 'Borcu İşle'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* New Customer Modal */}
      <Modal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        title="Yeni Cari Kart Oluştur"
        subtitle="Müşteri veya kurumsal firma bilgileri"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Firma / Kurum Adı *</label>
              <input
                type="text"
                required
                value={customerForm.companyName}
                onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                placeholder="Örn: Kütahya Madencilik A.Ş."
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Yetkili Kişi</label>
              <input
                type="text"
                value={customerForm.contactPerson}
                onChange={(e) => setCustomerForm({ ...customerForm, contactPerson: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Telefon Numarası *</label>
              <input
                type="text"
                required
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                placeholder="+90 5XX XXX XX XX"
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">E-Posta</label>
              <input
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Şehir</label>
              <input
                type="text"
                value={customerForm.city}
                onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vergi Dairesi & No</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Vergi Dairesi"
                  value={customerForm.taxOffice}
                  onChange={(e) => setCustomerForm({ ...customerForm, taxOffice: e.target.value })}
                  className="w-1/2 bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Vergi No"
                  value={customerForm.taxNumber}
                  onChange={(e) => setCustomerForm({ ...customerForm, taxNumber: e.target.value })}
                  className="w-1/2 bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Açık Hesap Kredi Limiti (₺)</label>
              <input
                type="number"
                value={customerForm.creditLimit}
                onChange={(e) => setCustomerForm({ ...customerForm, creditLimit: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Fatura & Sevkiyat Adresi</label>
            <textarea
              rows={2}
              value={customerForm.address}
              onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl p-2.5 text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsAddCustomerOpen(false)}>
              İptal
            </Button>
            <Button type="submit" variant="primary">
              Cariyi Kaydet
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
