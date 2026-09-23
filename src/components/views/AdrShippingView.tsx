import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Printer,
  ShieldAlert,
  AlertTriangle,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { repository } from '../../services/storage';

export const AdrShippingView: React.FC = () => {
  const company = repository.getCompany();
  const customers = repository.getCustomers();

  const [documents, setDocuments] = useState([
    {
      id: 'adr_1',
      docNo: 'ADR-2026-0089',
      date: new Date().toISOString(),
      sender: 'TEORİ KİMYA San. Tic.',
      receiver: 'Kütahya Madencilik A.Ş.',
      driverName: 'Ahmet Karaca',
      driverId: '34489201928',
      plate: '43 TK 101 / 43 TK 102 (Dorse)',
      items: [
        {
          unNumber: 'UN 1824',
          shippingName: 'SODYUM HİDROKSİT ÇÖZELTİSİ (Kostik Sıvı %48)',
          hazardClass: '8 (Aşındırıcı)',
          packingGroup: 'PG II',
          tunnelCode: '(E)',
          quantity: '3000 Litre (6 IBC Tank)',
        },
        {
          unNumber: 'UN 1791',
          shippingName: 'HİPOKLORİT ÇÖZELTİSİ (Sıvı Klor)',
          hazardClass: '8 (Aşındırıcı)',
          packingGroup: 'PG II',
          tunnelCode: '(E)',
          quantity: '1000 Litre (2 IBC Tank)',
        },
      ],
      safetyNotes: 'Turuncu levhalar takılıdır. 2 adet 6 kg yangın söndürücü mevcuttur. Kişisel Koruyucu Donanım (KKD) araçta bulunmaktadır.',
    },
  ]);

  const [viewingDoc, setViewingDoc] = useState<any | null>(documents[0]);
  const [isNewDocOpen, setIsNewDocOpen] = useState(false);

  const [form, setForm] = useState({
    receiver: customers[0]?.companyName || 'Kurumsal Alıcı',
    driverName: 'Mehmet Yılmaz',
    plate: '43 TK 999',
    unNumber: 'UN 1824',
    shippingName: 'SODYUM HİDROKSİT ÇÖZELTİSİ',
    hazardClass: '8',
    packingGroup: 'PG II',
    tunnelCode: '(E)',
    quantity: '2000 Litre',
  });

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc = {
      id: `adr_${Date.now()}`,
      docNo: `ADR-2026-0${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString(),
      sender: 'TEORİ KİMYA - Kütahya',
      receiver: form.receiver,
      driverName: form.driverName,
      driverId: 'TC 10928374652',
      plate: form.plate,
      items: [
        {
          unNumber: form.unNumber,
          shippingName: form.shippingName,
          hazardClass: form.hazardClass,
          packingGroup: form.packingGroup,
          tunnelCode: form.tunnelCode,
          quantity: form.quantity,
        },
      ],
      safetyNotes: 'ADR Bölüm 5.4 Taşıma Evrakı gereğince hazırlanmıştır.',
    };

    setDocuments([newDoc, ...documents]);
    setViewingDoc(newDoc);
    setIsNewDocOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Truck className="w-6 h-6 text-cyan-400" />
            Kimyasal Sevkiyat & ADR Taşıma Evrakı
          </h2>
          <p className="text-xs text-slate-400">
            Tehlikeli madde karayolu taşımacılığı (ADR 5.4) resmi taşıma evrakları
          </p>
        </div>

        <Button
          onClick={() => setIsNewDocOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Yeni ADR Evrakı Düzenle
        </Button>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-lg space-y-4"
          >
            <div className="flex justify-between items-start border-b border-cyan-500/15 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  {doc.docNo}
                </span>
                <h3 className="text-sm font-bold text-white mt-1">Alıcı: {doc.receiver}</h3>
                <p className="text-[11px] text-slate-400">
                  Sürücü: {doc.driverName} | Plaka: {doc.plate}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400">Tarih</span>
                <p className="font-mono text-xs text-white">
                  {new Date(doc.date).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>

            {/* Chemical items in this transport */}
            <div className="space-y-1.5 text-xs">
              {doc.items.map((it, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#102A43]/50 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-amber-300">{it.unNumber}</span>
                    <span className="font-mono text-[11px] text-cyan-300 font-bold">{it.quantity}</span>
                  </div>
                  <p className="font-semibold text-white text-[11px]">{it.shippingName}</p>
                  <p className="text-[10px] text-slate-400">
                    Sınıf: {it.hazardClass} | Paket Grubu: {it.packingGroup} | Tünel: {it.tunnelCode}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setViewingDoc(doc)}
                icon={<Printer className="w-3.5 h-3.5 text-cyan-400" />}
              >
                Resmi ADR Formunu Yazdır
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Official ADR Printable Sheet Modal */}
      <Modal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        title="ADR Tehlikeli Madde Taşıma Evrakı"
        subtitle={viewingDoc?.docNo}
        maxWidth="2xl"
      >
        {viewingDoc && (
          <div className="space-y-4">
            <div id="print-adr-document" className="p-6 rounded-xl bg-white text-slate-900 font-sans text-xs space-y-4 shadow-lg border">
              {/* Header */}
              <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-black tracking-wide">TEHLİKELİ MADDE TAŞIMA EVRAKI</h2>
                  <p className="text-[10px] text-slate-600 font-bold uppercase">
                    (ADR BÖLÜM 5.4 VE KARAYOLUYLA TEHLİKELİ MADDE TAŞINMASI HAKKINDA YÖNETMELİK)
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-sm bg-black text-white px-2 py-0.5 rounded">
                    {viewingDoc.docNo}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Düzenleme: {new Date(viewingDoc.date).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>

              {/* Sender & Receiver Info */}
              <div className="grid grid-cols-2 gap-4 border p-3 rounded bg-slate-50">
                <div>
                  <p className="font-bold text-[10px] text-slate-500 uppercase">GÖNDEREN (YÜKLEYEN)</p>
                  <p className="font-black text-slate-900">TEORİ KİMYA</p>
                  <p className="text-[10px] text-slate-600">{company.address}</p>
                  <p className="text-[10px] text-slate-600">Tel: {company.phone}</p>
                </div>
                <div>
                  <p className="font-bold text-[10px] text-slate-500 uppercase">ALICI (TESLİM ALAN)</p>
                  <p className="font-black text-slate-900">{viewingDoc.receiver}</p>
                  <p className="text-[10px] text-slate-600">Araç Plakası: {viewingDoc.plate}</p>
                  <p className="text-[10px] text-slate-600">Sürücü: {viewingDoc.driverName}</p>
                </div>
              </div>

              {/* Table of Dangerous Goods */}
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-200 text-[10px] font-bold uppercase border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300">UN No</th>
                    <th className="p-2 border-r border-slate-300">Uygun Sevkiyat Adı (PSN)</th>
                    <th className="p-2 border-r border-slate-300 text-center">Sınıf</th>
                    <th className="p-2 border-r border-slate-300 text-center">PG</th>
                    <th className="p-2 border-r border-slate-300 text-center">Tünel</th>
                    <th className="p-2 text-right">Toplam Miktar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-[11px]">
                  {viewingDoc.items.map((it: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2 font-mono font-bold border-r border-slate-300">{it.unNumber}</td>
                      <td className="p-2 font-semibold border-r border-slate-300">{it.shippingName}</td>
                      <td className="p-2 text-center border-r border-slate-300">{it.hazardClass}</td>
                      <td className="p-2 text-center border-r border-slate-300">{it.packingGroup}</td>
                      <td className="p-2 text-center border-r border-slate-300">{it.tunnelCode}</td>
                      <td className="p-2 text-right font-black">{it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Safety Instructions */}
              <div className="p-2.5 border border-slate-300 rounded bg-slate-50 text-[10px] space-y-1">
                <p className="font-bold text-slate-800 uppercase">GÜVENLİK BİLGİSİ VE BEYAN:</p>
                <p className="text-slate-600">
                  Yukarıda adı geçen maddeler ADR hükümlerine uygun olarak tam olarak adlandırılmış, ambalajlanmış, etiketlenmiş ve işaretlenmiştir. Taşıma karayolu ile tehlikeli madde taşımacılığına uygundur.
                </p>
                <p className="text-slate-700 font-semibold">{viewingDoc.safetyNotes}</p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t text-center text-[10px] text-slate-600">
                <div>
                  <p className="font-bold text-slate-800">Gönderen Yetkilisi</p>
                  <p className="mt-8 text-slate-400">Mehmet Bozkurt / İmza</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Taşıyıcı / Sürücü</p>
                  <p className="mt-8 text-slate-400">{viewingDoc.driverName} / İmza</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Alıcı Yetkilisi</p>
                  <p className="mt-8 text-slate-400">Kaşe / İmza</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
                Yazdır / PDF Olarak Kaydet
              </Button>
              <Button onClick={() => setViewingDoc(null)}>Kapat</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* New Doc Modal */}
      <Modal
        isOpen={isNewDocOpen}
        onClose={() => setIsNewDocOpen(false)}
        title="Yeni ADR Taşıma Evrakı Oluştur"
        subtitle="Kimyasal sevkiyat beyan formu"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateDoc} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Alıcı Firma *</label>
              <select
                value={form.receiver}
                onChange={(e) => setForm({ ...form, receiver: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.companyName}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Sürücü Adı Soyadı *</label>
              <input
                type="text"
                required
                value={form.driverName}
                onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Araç & Dorse Plakası *</label>
              <input
                type="text"
                required
                value={form.plate}
                onChange={(e) => setForm({ ...form, plate: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">UN Numarası *</label>
              <input
                type="text"
                required
                value={form.unNumber}
                onChange={(e) => setForm({ ...form, unNumber: e.target.value })}
                placeholder="Örn: UN 1824"
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Uygun Sevkiyat Adı *</label>
              <input
                type="text"
                required
                value={form.shippingName}
                onChange={(e) => setForm({ ...form, shippingName: e.target.value })}
                placeholder="Örn: SODYUM HİDROKSİT ÇÖZELTİSİ"
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Paketleme Grubu (PG)</label>
              <select
                value={form.packingGroup}
                onChange={(e) => setForm({ ...form, packingGroup: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
              >
                <option value="PG I">PG I (Çok Tehlikeli)</option>
                <option value="PG II">PG II (Orta Tehlikeli)</option>
                <option value="PG III">PG III (Az Tehlikeli)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Sevkiyat Miktarı</label>
              <input
                type="text"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="Örn: 2000 Litre (2 IBC Tank)"
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsNewDocOpen(false)}>
              İptal
            </Button>
            <Button type="submit" variant="primary">
              Evrakı Oluştur
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
