import React, { useState, useEffect } from 'react';
import {
  Beaker,
  Plus,
  Search,
  AlertTriangle,
  Layers,
  Building2,
  ShieldAlert,
  ArrowDownLeft,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { RawMaterial, Supplier } from '../../types';
import { repository } from '../../services/storage';

export const RawMaterialsView: React.FC = () => {
  const [materials, setMaterials] = useState<RawMaterial[]>(repository.getRawMaterials());
  const [suppliers] = useState<Supplier[]>(repository.getSuppliers());
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [addQty, setAddQty] = useState(500);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    casNumber: '',
    unNumber: '',
    adrClass: '8 (Aşındırıcı)',
    quantity: 1000,
    unit: 'Kg' as 'Kg' | 'Litre',
    minQuantity: 300,
    costPerUnit: 45,
    supplierId: suppliers[0]?.id || '',
    storageConditions: 'Kuru ve havalandırmalı ortamda saklayınız.',
    purity: '%99.0',
    temperature: '15-25 °C',
    ventilation: 'Havalandırmalı kuru depo',
  });

  useEffect(() => {
    const unsub = repository.subscribe(() => {
      setMaterials(repository.getRawMaterials());
    });
    return unsub;
  }, []);

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    repository.adjustRawMaterialStock(
      selectedMaterial.id,
      addQty,
      `Tedarikçi alımı: ${addQty} ${selectedMaterial.unit}`
    );
    setIsStockModalOpen(false);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const sup = suppliers.find((s) => s.id === formData.supplierId);

    repository.addRawMaterial({
      ...formData,
      code: formData.code.toUpperCase() || `HM-${Date.now().toString().slice(-4)}`,
      supplierName: sup ? sup.companyName : 'Tedarikçi',
    });

    setIsAddModalOpen(false);
  };

  const filteredMaterials = materials.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      (m.casNumber && m.casNumber.includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Beaker className="w-6 h-6 text-cyan-400" />
            Hammadde & Kimyasal Stokları
          </h2>
          <p className="text-xs text-slate-400">
            Reaktör girdileri, CAS & UN kodları, ADR sınıfları ve stok durumları
          </p>
        </div>

        <Button
          onClick={() => {
            setFormData({
              name: '',
              code: `HM-${Date.now().toString().slice(-4)}`,
              casNumber: '',
              unNumber: '',
              adrClass: '8 (Aşındırıcı)',
              quantity: 1000,
              unit: 'Kg',
              minQuantity: 300,
              costPerUnit: 45,
              supplierId: suppliers[0]?.id || '',
              storageConditions: 'Kuru ve havalandırmalı ortamda saklayınız.',
              purity: '%99.0',
              temperature: '15-25 °C',
              ventilation: 'Havalandırmalı kuru depo',
            });
            setIsAddModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Yeni Hammadde Ekle
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-md">
        <div className="relative">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Hammadde adı, CAS no veya kod ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#102A43] border border-cyan-500/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Raw Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMaterials.map((m) => {
          const isCritical = m.quantity <= m.minQuantity;
          return (
            <div
              key={m.id}
              className={`p-5 rounded-2xl bg-[#0B1B2E] border transition-all flex flex-col justify-between shadow-lg space-y-4 ${
                isCritical ? 'border-amber-500/50 bg-amber-950/10' : 'border-cyan-500/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      {m.code}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{m.name}</h3>
                    <p className="text-xs text-slate-400">Tedarikçi: {m.supplierName}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Stok</span>
                    <p
                      className={`text-lg font-black font-mono ${
                        isCritical ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {m.quantity.toLocaleString('tr-TR')} {m.unit}
                    </p>
                    <span className="text-[10px] text-slate-500">Min: {m.minQuantity} {m.unit}</span>
                  </div>
                </div>

                {/* Chemical Identification */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-[#102A43]/50">
                    <span className="text-[10px] text-slate-400 block">CAS No:</span>
                    <span className="font-mono font-bold text-cyan-200">{m.casNumber || '-'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#102A43]/50">
                    <span className="text-[10px] text-slate-400 block">UN No / ADR:</span>
                    <span className="font-mono font-bold text-cyan-200">{m.unNumber || m.adrClass || '-'}</span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-400">
                  <span>Birim Alış: </span>
                  <span className="font-bold text-white">{m.costPerUnit} ₺/{m.unit}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setSelectedMaterial(m);
                    setAddQty(500);
                    setIsStockModalOpen(true);
                  }}
                  icon={<ArrowDownLeft className="w-3.5 h-3.5" />}
                  className="w-full"
                >
                  Stok Girişi Yap
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Stock Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title="Hammadde Stok Girişi"
        subtitle={selectedMaterial ? `${selectedMaterial.name} için mal kabul` : ''}
        maxWidth="md"
      >
        {selectedMaterial && (
          <form onSubmit={handleAddStock} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-[#102A43] border border-cyan-500/25 flex justify-between">
              <span className="text-slate-400">Mevcut Stok:</span>
              <span className="font-bold text-white font-mono">
                {selectedMaterial.quantity} {selectedMaterial.unit}
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Giriş Yapılacak Miktar ({selectedMaterial.unit}) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={addQty}
                onChange={(e) => setAddQty(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setIsStockModalOpen(false)}>
                Vazgeç
              </Button>
              <Button type="submit" variant="primary">
                Stoka Ekle
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add Raw Material Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Yeni Hammadde Kartı Tanımla"
        subtitle="Kimyasal güvenlik ve stok eşikleri"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Hammadde Adı *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Kostik Sıvı (%48 NaOH)"
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hammadde Kodu *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">CAS Numarası</label>
              <input
                type="text"
                value={formData.casNumber}
                onChange={(e) => setFormData({ ...formData, casNumber: e.target.value })}
                placeholder="Örn: 1310-73-2"
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">UN Numarası</label>
              <input
                type="text"
                value={formData.unNumber}
                onChange={(e) => setFormData({ ...formData, unNumber: e.target.value })}
                placeholder="Örn: UN 1824"
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ADR Sınıfı</label>
              <input
                type="text"
                value={formData.adrClass}
                onChange={(e) => setFormData({ ...formData, adrClass: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Birim</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as 'Kg' | 'Litre' })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
              >
                <option value="Kg">Kg</option>
                <option value="Litre">Litre</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Başlangıç Stoğu</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kritik Eşik</label>
              <input
                type="number"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Birim Alış Fiyatı (₺)</label>
              <input
                type="number"
                step="0.01"
                value={formData.costPerUnit}
                onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
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
