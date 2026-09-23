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
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Sale } from '../../types';
import { repository } from '../../services/storage';

export const InvoicesView: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>(repository.getSales());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  const company = repository.getCompany();

  useEffect(() => {
    const unsub = repository.subscribe(() => {
      setSales(repository.getSales());
    });
    return unsub;
  }, []);

  const filteredSales = sales.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      s.invoiceNo.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            Satış Faturaları & Belgeler
          </h2>
          <p className="text-xs text-slate-400">
            Resmi e-Fatura taslakları, satış bilgi fişleri ve tahsilat belgeleri
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-md">
        <div className="relative">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Fatura numarası veya müşteri ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#102A43] border border-cyan-500/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-[#102A43]/60 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Fatura No</th>
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Müşteri</th>
                <th className="py-3 px-4">Ödeme Türü</th>
                <th className="py-3 px-4 text-right">KDV</th>
                <th className="py-3 px-4 text-right">Genel Toplam</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredSales.map((s) => (
                <tr key={s.id} className="hover:bg-[#102A43]/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-300">{s.invoiceNo}</td>
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
                      >
                        Görüntüle / Yazdır
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Document Modal */}
      <Modal
        isOpen={!!viewingSale}
        onClose={() => setViewingSale(null)}
        title="Fatura Belgesi"
        subtitle={viewingSale ? `${viewingSale.invoiceNo}` : ''}
        maxWidth="2xl"
      >
        {viewingSale && (
          <div className="space-y-4">
            {/* The Print Layout */}
            <div id="print-official-invoice" className="p-6 rounded-xl bg-white text-slate-900 font-sans text-xs space-y-4 shadow-lg">
              {/* Header with Atom Logo Representation */}
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
                    Ödeme Türü: {viewingSale.paymentMethod === 'open_account' ? 'Açık Hesap (Cari)' : viewingSale.paymentMethod === 'credit_card' ? 'Kredi Kartı' : 'Nakit'}
                  </p>
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

              {/* Totals Breakdown */}
              <div className="border-t border-slate-300 pt-2 flex justify-end">
                <div className="w-64 space-y-1 text-right text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Mal Hizmet Toplam Tutarı:</span>
                    <span>{viewingSale.subTotal.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Hesaplanan KDV (%20):</span>
                    <span>{viewingSale.vatTotal.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 border-t pt-1.5">
                    <span>Ödenecek Tutar:</span>
                    <span>{viewingSale.grandTotal.toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>
              </div>

              {/* Signatures & Legal */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500 border-t border-slate-200">
                <div>
                  <p className="font-bold text-slate-700">Teslim Eden / Firma Kaşesi</p>
                  <p className="mt-8 text-slate-400">TEORİ KİMYA San. Tic.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-700">Teslim Alan / Müşteri İmzası</p>
                  <p className="mt-8 text-slate-400">İsim / İmza</p>
                </div>
              </div>
            </div>

            {/* Actions */}
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
    </div>
  );
};
