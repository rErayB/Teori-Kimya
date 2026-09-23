import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  Droplets,
  Layers,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Product, UserRole } from '../../types';
import { repository } from '../../services/storage';

interface CatalogViewProps {
  userRole: UserRole;
  onAddToCart?: (product: Product) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ userRole, onAddToCart }) => {
  const [products] = useState<Product[]>(repository.getProducts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Hepsi');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const company = repository.getCompany();

  const categories = ['Hepsi', ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    if (!p.active) return false;
    const matchCat = selectedCategory === 'Hepsi' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0B1B2E] via-[#102A43] to-[#163A5F] border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-[#8DE7F2] text-[11px] font-semibold border border-cyan-400/30">
            <BookOpen className="w-3.5 h-3.5" />
            B2B Endüstriyel Ürün Portföyü
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            TEORİ KİMYA ÜRÜN KATALOĞU
          </h2>
          <p className="text-xs text-cyan-100/70">
            Ağır sanayi, madencilik, filo yıkama, hastane ve gıda hijyeni için onaylı formülasyonlar.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#07111F]/80 border border-cyan-500/20 text-xs text-right space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Doğrudan Sipariş & Teklif</span>
          <p className="font-bold text-white flex items-center gap-1.5 justify-end">
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            {company.phone}
          </p>
          <p className="text-[11px] text-cyan-300">{company.contactPerson}</p>
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="space-y-3">
        <div className="p-3 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-md">
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Katalogda ürün adı, kategori veya kod ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#102A43] border border-cyan-500/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all cursor-pointer ${
                selectedCategory === c
                  ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white font-bold shadow-md'
                  : 'bg-[#0B1B2E] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 hover:border-cyan-400/50 transition-all flex flex-col justify-between shadow-lg space-y-4 group"
          >
            <div>
              {/* Product Visual Icon Placeholder */}
              <div className="w-full h-32 rounded-xl bg-gradient-to-br from-[#102A43] to-[#07111F] border border-cyan-500/15 flex flex-col items-center justify-center p-3 relative overflow-hidden group-hover:border-cyan-400/40 transition-colors">
                <Droplets className="w-10 h-10 text-cyan-400/60 mb-1" />
                <span className="font-mono text-xs font-black text-cyan-300 bg-black/40 px-2 py-0.5 rounded border border-cyan-500/30">
                  {p.code}
                </span>

                {p.phValue && (
                  <span className="absolute top-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                    pH {p.phValue}
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-1">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  {p.category}
                </span>
                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {p.description || 'Endüstriyel kullanıma uygun yüksek konsantrasyonlu formül.'}
                </p>
              </div>

              {/* Packaging info */}
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Ambalaj:</span>
                <span className="font-bold text-slate-200">{p.unit}</span>
              </div>
            </div>

            {/* Price & Action */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Tavsiye Edilen Fiyat</span>
                <span className="text-base font-black text-[#8DE7F2]">
                  {p.salePrice.toLocaleString('tr-TR')} ₺
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedProduct(p)}
                icon={<Eye className="w-3.5 h-3.5" />}
              >
                Teknik İncele
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Kimyasal Teknik Ürün Bülteni"
        subtitle={selectedProduct ? selectedProduct.name : ''}
        maxWidth="lg"
      >
        {selectedProduct && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#102A43] to-[#0B1B2E] border border-cyan-500/25 flex justify-between items-start">
              <div>
                <span className="font-mono text-cyan-300 font-bold">{selectedProduct.code}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedProduct.name}</h3>
                <p className="text-xs text-slate-300">{selectedProduct.category}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400">Liste Fiyatı</span>
                <p className="text-xl font-black text-cyan-300">
                  {selectedProduct.salePrice.toLocaleString('tr-TR')} ₺
                </p>
                <span className="text-[10px] text-slate-500">+%20 KDV</span>
              </div>
            </div>

            {/* Technical Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-lg bg-[#07111F] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">pH Değeri:</span>
                <span className="font-black text-cyan-300 text-sm">{selectedProduct.phValue || '7.0'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#07111F] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Ambalaj Türü:</span>
                <span className="font-bold text-white text-xs">{selectedProduct.unit}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#07111F] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Barkod / EAN:</span>
                <span className="font-mono font-bold text-slate-200 text-xs">{selectedProduct.barcode}</span>
              </div>
            </div>

            {/* Usage and Description */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white">Uygulama Alanı & Seyreltme Talimatı</h4>
              <p className="text-slate-300 leading-relaxed">
                {selectedProduct.description ||
                  'Endüstriyel zeminler, madencilik tesisleri, iş makineleri ve ağır sanayi ekipmanlarında güvenle kullanılır. Yoğun kirlilikte 1/5, hafif kirlilikte 1/20 oranında su ile seyreltilerek basınçlı püskürtme veya mop ile uygulanır.'}
              </p>
            </div>

            {/* Safety Warning */}
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5 text-amber-200">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-snug">
                <p className="font-bold text-white">Güvenlik ve KKD Uyarısı:</p>
                <p>
                  Göz ve cilt ile temasından kaçınınız. Uygulama esnasında koruyucu eldiven ve gözlük kullanınız. Güvenlik Bilgi Formu (SDS) talep ediniz.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-slate-400 text-[11px]">
                Danışman: <span className="text-white font-bold">{company.contactPerson}</span>
              </div>
              <Button onClick={() => setSelectedProduct(null)}>Kapat</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
