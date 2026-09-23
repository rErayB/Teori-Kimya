import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Beaker,
  Scale,
  FileText,
  AlertTriangle,
  Layers,
  Trash2,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Recipe, RawMaterial, ProductUnit } from '../../types';
import { repository } from '../../services/storage';

export const RecipesView: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>(repository.getRecipes());
  const [rawMaterials] = useState<RawMaterial[]>(repository.getRawMaterials());
  const [products] = useState(repository.getProducts());

  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [targetProductId, setTargetProductId] = useState(products[0]?.id || '');
  const [batchYield, setBatchYield] = useState(1000);
  const [unit, setUnit] = useState<ProductUnit>('Litre');
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');

  const [ingredients, setIngredients] = useState<{ rawMaterialId: string; percentage: number }[]>([
    { rawMaterialId: rawMaterials[0]?.id || '', percentage: 70 },
    { rawMaterialId: rawMaterials[1]?.id || '', percentage: 30 },
  ]);

  const [formError, setFormError] = useState<string | null>(null);

  const totalPercentage = ingredients.reduce((sum, it) => sum + (it.percentage || 0), 0);

  const handleAddIngredientRow = () => {
    if (rawMaterials.length > 0) {
      setIngredients([...ingredients, { rawMaterialId: rawMaterials[0].id, percentage: 0 }]);
    }
  };

  const handleRemoveIngredientRow = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleIngredientChange = (index: number, field: 'rawMaterialId' | 'percentage', value: any) => {
    const updated = [...ingredients];
    if (field === 'percentage') {
      updated[index].percentage = parseFloat(value) || 0;
    } else {
      updated[index].rawMaterialId = value;
    }
    setIngredients(updated);
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!recipeName.trim()) {
      setFormError('Reçete adı boş bırakılamaz.');
      return;
    }

    if (Math.abs(totalPercentage - 100) > 0.01) {
      setFormError(`Toplam reçete oranı tam %100 olmalıdır. Şu anki toplam: %${totalPercentage}`);
      return;
    }

    const targetProduct = products.find((p) => p.id === targetProductId);

    const stepsArray = instructions
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    repository.addRecipe({
      name: recipeName,
      targetProductId,
      targetProductName: targetProduct ? targetProduct.name : 'Kimyasal Ürün',
      batchYield,
      unit,
      ingredients: ingredients.map((it) => {
        const raw = rawMaterials.find((r) => r.id === it.rawMaterialId);
        return {
          rawMaterialId: it.rawMaterialId,
          rawMaterialName: raw ? raw.name : 'Hammadde',
          percentage: it.percentage,
        };
      }),
      preparationSteps: stepsArray.length > 0 ? stepsArray : ['Standart karıştırma prosedürü uygulayınız.'],
      notes,
    });

    setRecipes(repository.getRecipes());
    setIsAddRecipeOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-cyan-400" />
            Kimyasal Reçeteler & Formülasyon
          </h2>
          <p className="text-xs text-slate-400">
            Endüstriyel temizlik ürünleri üretim formülleri, yüzdeleri ve reaktör talimatları
          </p>
        </div>

        <Button
          onClick={() => {
            setRecipeName('');
            setInstructions('');
            setNotes('');
            setFormError(null);
            setIsAddRecipeOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Yeni Reçete Tanımla
        </Button>
      </div>

      {/* Recipe Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {recipes.map((rec) => (
          <div
            key={rec.id}
            className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-lg space-y-4"
          >
            <div className="flex items-start justify-between gap-2 border-b border-cyan-500/15 pb-3">
              <div>
                <h3 className="text-base font-bold text-white mt-1">{rec.name}</h3>
                <p className="text-xs text-cyan-300 font-semibold mt-0.5">
                  Hedef Mamül: {rec.targetProductName}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Standart Şarj</span>
                <p className="text-sm font-black text-white font-mono">
                  {rec.batchYield} {rec.unit}
                </p>
              </div>
            </div>

            {/* Ingredients table */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Beaker className="w-3.5 h-3.5 text-cyan-400" />
                Formülasyon Bileşenleri (Toplam: %100)
              </span>

              <div className="space-y-1.5">
                {rec.ingredients.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-[#102A43]/50 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-white">{it.rawMaterialName}</span>
                    <span className="font-mono font-bold text-cyan-300">%{it.percentage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preparation steps */}
            {rec.preparationSteps && rec.preparationSteps.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Reaktör Hazırlama Aşamaları
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed text-[11px]">
                  {rec.preparationSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {rec.notes && (
              <p className="text-[11px] text-amber-300/80 italic bg-amber-950/20 p-2 rounded-lg border border-amber-500/20">
                Güvenlik Notu: {rec.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Add Recipe Modal */}
      <Modal
        isOpen={isAddRecipeOpen}
        onClose={() => setIsAddRecipeOpen(false)}
        title="Yeni Kimyasal Reçete Tanımla"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveRecipe} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Reçete Adı *</label>
              <input
                type="text"
                required
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="Örn: TK-100 Ağır Kir & Yağ Sökücü Formülasyonu"
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Üretilecek Hedef Mamül *</label>
              <select
                value={targetProductId}
                onChange={(e) => setTargetProductId(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Standart Parti Şarjı</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={batchYield}
                  onChange={(e) => setBatchYield(parseInt(e.target.value) || 1000)}
                  className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as ProductUnit)}
                  className="bg-[#102A43] border border-cyan-500/30 rounded-xl px-2 py-2 text-white"
                >
                  <option value="Litre">Litre</option>
                  <option value="Kg">Kg</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dynamic Ingredients */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Formülasyon Yüzdeleri</span>
                <span className="text-[11px] text-slate-400">
                  Toplam oran tam %100 olmalıdır (Şu an: %{totalPercentage})
                </span>
              </div>
              <Button type="button" size="sm" variant="secondary" onClick={handleAddIngredientRow}>
                Bileşen Ekle
              </Button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={ing.rawMaterialId}
                    onChange={(e) => handleIngredientChange(idx, 'rawMaterialId', e.target.value)}
                    className="flex-1 bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    {rawMaterials.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.unit})
                      </option>
                    ))}
                  </select>

                  <div className="w-24 relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={ing.percentage}
                      onChange={(e) => handleIngredientChange(idx, 'percentage', e.target.value)}
                      className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 pr-7 text-right font-mono text-white text-xs"
                    />
                    <span className="absolute right-2.5 top-2 text-slate-400 text-xs">%</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveIngredientRow(idx)}
                    disabled={ingredients.length <= 1}
                    className="p-2 text-slate-400 hover:text-red-400 disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preparation Instructions */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Reaktör Hazırlama Aşamaları (Her satıra bir adım yazınız)
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="1. Reaktöre deiyonize su alınır&#10;2. Sıvı kostik yavaşça eklenir (<40°C)&#10;3. LABSA nötralize edilir"
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Güvenlik ve İSG Notu</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: Asit maskesi ve kimyasal tulum kullanımı zorunludur."
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddRecipeOpen(false)}>
              İptal
            </Button>
            <Button type="submit" variant="primary">
              Reçeteyi Kaydet
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
