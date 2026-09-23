import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Beaker,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Supplier } from '../../types';
import { repository } from '../../services/storage';

export const SuppliersView: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(repository.getSuppliers());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: 'Kocaeli / Gebze Kimya OSB',
    suppliedProducts: 'Kostik, LABSA, Sodyum Hipoklorit',
  });

  useEffect(() => {
    const unsub = repository.subscribe(() => {
      setSuppliers(repository.getSuppliers());
    });
    return unsub;
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName.trim()) return;

    repository.addSupplier({
      companyName: form.companyName,
      contactPerson: form.contactPerson,
      phone: form.phone,
      email: form.email,
      address: form.address,
      city: form.city,
      category: 'Hammadde Kimyasalları',
      productsSupplied: form.suppliedProducts.split(',').map((s) => s.trim()),
      paymentTerms: '30 Gün Vade',
      balance: 0,
      currentBalance: 0,
      active: true,
    });

    setIsAddOpen(false);
  };

  const filtered = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      s.companyName.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      (s.city && s.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Building2 className="w-6 h-6 text-cyan-400" />
            Tedarikçi Yönetimi
          </h2>
          <p className="text-xs text-slate-400">
            Hammadde, kimyasal ambalaj ve lojistik tedarikçileri
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Yeni Tedarikçi Ekle
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-md">
        <div className="relative">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Tedarikçi firma adı veya şehir ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#102A43] border border-cyan-500/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-lg space-y-3 flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] text-cyan-400 font-bold uppercase">{s.city || 'Gebze OSB'}</span>
              <h3 className="text-base font-bold text-white mt-0.5">{s.companyName}</h3>
              <p className="text-xs text-slate-300">{s.contactPerson}</p>

              <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                <p className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{s.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{s.email}</span>
                </p>
                <p className="flex items-center gap-2 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{s.address}</span>
                </p>
              </div>

              {s.productsSupplied && s.productsSupplied.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                    Tedarik Edilen Hammaddeler:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {s.productsSupplied.map((p, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-cyan-950/40 border border-cyan-500/30 text-[10px] text-cyan-300"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Bakiye:</span>
              <span className="font-mono font-bold text-white">
                {s.balance.toLocaleString('tr-TR')} ₺
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Yeni Tedarikçi Kartı"
        subtitle="Hammadde veya ambalaj firması"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Firma Adı *</label>
              <input
                type="text"
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Yetkili Kişi</label>
              <input
                type="text"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Telefon *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">E-Posta</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Şehir</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Tedarik Ettiği Kimyasallar (Virgülle ayırın)
              </label>
              <input
                type="text"
                value={form.suppliedProducts}
                onChange={(e) => setForm({ ...form, suppliedProducts: e.target.value })}
                placeholder="Örn: Sodyum Hipoklorit, Kostik, Bidon"
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
              İptal
            </Button>
            <Button type="submit" variant="primary">
              Kaydet
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
