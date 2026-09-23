import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  Beaker,
  Scale,
  Calendar,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { ProductionOrder, Recipe, RawMaterial, RecipeIngredient } from '../../types';
import { repository } from '../../services/storage';

export const ProductionView: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>(repository.getProductionOrders());
  const [recipes] = useState<Recipe[]>(repository.getRecipes());
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(repository.getRawMaterials());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || '');
  const [batchQuantity, setBatchQuantity] = useState<number>(1000);
  const [productionNotes, setProductionNotes] = useState('');

  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionSuccess, setExecutionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsub = repository.subscribe(() => {
      setOrders(repository.getProductionOrders());
      setRawMaterials(repository.getRawMaterials());
    });
    return unsub;
  }, []);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  // Check required raw materials for chosen batch quantity
  const requiredMaterials = (selectedRecipe?.ingredients || []).map((item: RecipeIngredient) => {
    const raw = rawMaterials.find((r) => r.id === item.rawMaterialId);
    const needed = (batchQuantity * item.percentage) / 100;
    const available = raw ? raw.quantity : 0;
    const isSufficient = available >= needed;
    return {
      rawMaterialId: item.rawMaterialId,
      name: item.rawMaterialName,
      needed,
      unit: raw?.unit || 'Kg',
      available,
      isSufficient,
      shortage: needed - available,
    };
  });

  const hasShortage = requiredMaterials.some((m) => !m.isSufficient);

  // Start & Execute Production Order
  const handleStartProduction = (e: React.FormEvent) => {
    e.preventDefault();
    setExecutionError(null);
    setExecutionSuccess(null);

    if (!selectedRecipe) return;

    const result = repository.executeProductionOrder(
      selectedRecipe.id,
      batchQuantity,
      'Baş Kimyager'
    );

    if (!result.success || !result.order) {
      setExecutionError(result.error || 'Üretim emri başlatılamadı.');
      return;
    }

    setExecutionSuccess(
      `Parti ${result.order.batchNumber} başarıyla üretildi! Mamül stoğuna ${result.order.plannedQuantity} ${selectedRecipe.unit} eklendi ve reaktör hammadde stokları düşüldü.`
    );
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-cyan-400" />
            Üretim & Reaktör Yönetimi
          </h2>
          <p className="text-xs text-slate-400">
            Reçete bazlı kimyasal sentez, parti (batch) takibi ve hammadde düşümü
          </p>
        </div>

        <Button
          onClick={() => {
            setExecutionError(null);
            setExecutionSuccess(null);
            setIsModalOpen(true);
          }}
          icon={<Play className="w-4 h-4 text-emerald-400" />}
        >
          Yeni Üretim Emri Başlat
        </Button>
      </div>

      {executionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-xs">{executionSuccess}</span>
          </div>
          <button
            onClick={() => setExecutionSuccess(null)}
            className="text-xs text-emerald-400 hover:underline cursor-pointer"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Production Orders Table */}
      <div className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Tamamlanan & Devam Eden Parti (Batch) Üretimleri
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-[#102A43]/40 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Parti No</th>
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Ürün Adı</th>
                <th className="py-3 px-4 text-center">Üretim Miktarı</th>
                <th className="py-3 px-4 text-right">Durum</th>
                <th className="py-3 px-4">Operatör</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Henüz üretim emri bulunmuyor.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#102A43]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                      {ord.batchNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(ord.createdDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{ord.productName}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-400 font-mono">
                      {(ord.actualQuantity || ord.plannedQuantity).toLocaleString('tr-TR')} {ord.unit}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant="success">
                        Tamamlandı
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{ord.operator}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Production Order Modal with Live Stock Availability Checker */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni Kimyasal Üretim Emri"
        subtitle="Seçilen reçetenin hammadde stok kontrolü otomatik yapılır"
      >
        <form onSubmit={handleStartProduction} className="space-y-4 text-xs">
          {executionError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{executionError}</span>
            </div>
          )}

          {/* Recipe Select */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Reçete Seçin *</label>
            <select
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(e.target.value)}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.targetProductName})
                </option>
              ))}
            </select>
          </div>

          {/* Batch Quantity */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Üretilecek Parti Miktarı ({selectedRecipe?.unit || 'Litre'}) *
            </label>
            <input
              type="number"
              min="100"
              step="50"
              required
              value={batchQuantity}
              onChange={(e) => setBatchQuantity(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Raw Materials Check Box */}
          <div className="p-3 rounded-xl bg-[#07111F] border border-cyan-500/20 space-y-2">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
              <Beaker className="w-4 h-4 text-cyan-400" />
              Gerekli Hammadde ve Depo Stok Kontrolü
            </h4>

            <div className="space-y-1.5 divide-y divide-slate-800">
              {requiredMaterials.map((mat, idx: number) => (
                <div key={idx} className="pt-1.5 first:pt-0 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white">{mat.name}</p>
                    <p className="text-[10px] text-slate-400">
                      Gerekli: {mat.needed.toFixed(1)} {mat.unit} | Depoda:{' '}
                      <span className="font-mono">{mat.available} {mat.unit}</span>
                    </p>
                  </div>
                  <div>
                    {mat.isSufficient ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        Yeterli
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                        Eksik: {mat.shortage.toFixed(1)} {mat.unit}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Production Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Üretim / Reaktör Notu</label>
            <input
              type="text"
              value={productionNotes}
              onChange={(e) => setProductionNotes(e.target.value)}
              placeholder="Örn: 2 no'lu reaktör, homojenizatör devrede"
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              İptal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={hasShortage}
              icon={<Play className="w-4 h-4" />}
            >
              {hasShortage ? 'Yetersiz Stok - Başlatılamaz' : 'Sentezi & Üretimi Başlat'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
