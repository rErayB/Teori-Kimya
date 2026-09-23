import { repository } from './storage';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isFallback?: boolean;
}

export async function askKimyagerAi(prompt: string, chatHistory: ChatMessage[] = []): Promise<string> {
  const metrics = repository.getDashboardMetrics();
  const products = repository.getProducts();
  const criticalProducts = products.filter((p) => p.stock <= p.minStock);
  const rawMaterials = repository.getRawMaterials();
  const recipes = repository.getRecipes();
  const sales = repository.getSales();

  const contextData = {
    metrics,
    criticalProductsCount: criticalProducts.length,
    criticalProducts: criticalProducts.map((p) => ({
      name: p.name,
      stock: p.stock,
      minStock: p.minStock,
      unit: p.unit,
    })),
    totalProductsCount: products.length,
    rawMaterialsCount: rawMaterials.length,
    lowRawMaterials: rawMaterials
      .filter((r) => r.quantity <= r.minQuantity)
      .map((r) => ({ name: r.name, qty: r.quantity, min: r.minQuantity, unit: r.unit })),
    recentSalesCount: sales.length,
    lastSale: sales[0]
      ? {
          invoice: sales[0].invoiceNo,
          customer: sales[0].customerName,
          total: sales[0].grandTotal,
        }
      : null,
  };

  try {
    const res = await fetch('/api/kimyager', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        context: contextData,
        chatHistory: chatHistory.slice(-4),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text) {
        return data.text;
      }
    }
  } catch (e) {
    console.warn('Backend Kimyager AI call unreachable, utilizing offline chemistry logic:', e);
  }

  // Graceful rule-based intelligent offline expert system
  return generateOfflineKimyagerAnalysis(prompt, products, criticalProducts, rawMaterials, recipes, metrics, sales);
}

function generateOfflineKimyagerAnalysis(
  query: string,
  products: any[],
  criticalProducts: any[],
  rawMaterials: any[],
  recipes: any[],
  metrics: any,
  sales: any[]
): string {
  const q = query.toLowerCase();

  // Safety & Chemistry danger check
  if (q.includes('asit') && (q.includes('klor') || q.includes('çamaşır suyu') || q.includes('karışır'))) {
    return `⚠️ **HAYATİ KİMYASAL GÜVENLİK UYARISI:**
Asit içerikli ürünler (TK-400, Fosforik Asit, Hidroklorik Asit vb.) ile Klor içerikli ürünler (TK-500 Klor, Sodyum Hipoklorit, Çamaşır Suyu) KESİNLİKLE BİRBİRİYLE KARIŞTIRILMAMALIDIR!

- **Kimyasal Tepkime:** Asit ve klorür bileşikleri temas ettiğinde ölümcül **Klor Gazı (Cl₂)** açığa çıkar.
- **Solunum Riski:** Klor gazı akciğerlerde su ile tepkimeye girerek hidroklorik asit oluşturur ve ani kimyasal boğulmaya yol açar.
- **Prosedür:** Bu ürünler ayrı depolanmalı, taşınırken ADR mevzuatına uygun paketlenmeli ve personele tam yüz gaz maskesi temin edilmelidir. Detaylar için ilgili ürünün Güvenlik Bilgi Formu'nu (SDS) inceleyiniz.`;
  }

  // Critical stock query
  if (q.includes('kritik') || q.includes('azalan') || q.includes('stok') || q.includes('biten')) {
    if (criticalProducts.length === 0) {
      return `✅ **Stok Durumu Mükemmel:**
Şu anda minimum stok seviyesinin altına düşen hiçbir mamül ürün bulunmuyor. Depo stokları üretim ve sevkiyat taleplerini karşılamak için yeterli seviyededir.`;
    }

    const list = criticalProducts
      .map((p) => `• **${p.name}**: Mevcut Stok: **${p.stock} ${p.unit}** (Kritik Eşik: ${p.minStock} ${p.unit})`)
      .join('\n');

    return `⚠️ **Kritik Stok Uyarısı ve Analizi:**
Sistemde acil üretim veya tedarik gerektiren **${criticalProducts.length} adet** ürün tespit edildi:

${list}

**Kimyager AI Önerisi:**
1. Özellikle **TK-500** ve **TK-ALC** için üretim emri açılması veya ilgili reçeteler üzerinden hammadde rezervasyonu yapılması önerilir.
2. Hammadde depolarında Kostik ve Sodyum Hipoklorit stoklarının yeterliliği kontrol edilmelidir.`;
  }

  // Revenue & Profit query
  if (q.includes('ciro') || q.includes('kâr') || q.includes('kar') || q.includes('kazanç') || q.includes('finans')) {
    return `📊 **Finansal Performans & Kâr Analizi:**
- **Bugünkü Ciro:** ${metrics.todayRevenue.toLocaleString('tr-TR')} ₺ (${metrics.todaySalesCount} işlem)
- **Bu Ayki Toplam Ciro:** ${metrics.monthRevenue.toLocaleString('tr-TR')} ₺
- **Aylık Brüt Kâr:** ${metrics.grossProfitMonth.toLocaleString('tr-TR')} ₺
- **Kâr Marjı Ortalaması:** %${metrics.profitMarginMonth}
- **Toplam Stok Varlık Değeri (Maliyet):** ${metrics.totalStockValue.toLocaleString('tr-TR')} ₺
- **Cari Alacaklar Toplamı:** ${metrics.totalReceivables.toLocaleString('tr-TR')} ₺

**Analiz:** İşletmenizin ortalama brüt kâr marjı endüstriyel kimya sektörü ortalaması olan %40-45 bandında oldukça sağlıklıdır. Açık hesap alacak tahsilatlarının vadesi geldiğinde takibi nakit akışını güçlendirecektir.`;
  }

  // Recipe or production query
  if (q.includes('reçete') || q.includes('üretim') || q.includes('formül') || q.includes('imalat')) {
    return `🧪 **Reçete & Üretim Merkezi İncelemesi:**
Sistemde kayıtlı **${recipes.length} ana kimyasal reçete** bulunmaktadır:
1. **TK-100 Ağır Kir & Yağ Sökücü:** Bazik reaktör formülasyonu (Kostik + LABSA + SLES + İnhibitör)
2. **TK-200 Cilalı Fırçasız Oto Yıkama Köpüğü:** Polimerik ve köpük stabilizatörlü (SLES + Betain + LABSA + Cila)
3. **TK-400 Ağır Kireç ve Pas Sökücü:** Asidik korozyon inhibitörlü (Fosforik Asit %85)

*Üretim başlatıldığında hammadde depolarından otomatik stok düşülür ve bitmiş mamül partisi (Batch) kayıt altına alınır.*`;
  }

  // Best selling products
  if (q.includes('en çok satan') || q.includes('satış') || q.includes('trend')) {
    return `⭐ **En Yüksek Talep Gören Ürün Grupları:**
1. **TK-100 Ağır Kir & Yağ Sökücü:** Fabrikalar ve mermer/maden işletmeleri tarafından aylık yüksek hacimde sipariş ediliyor.
2. **TK-200 Cilalı Oto Şampuanı:** Lojistik filoları ve oto yıkama tesislerinin en çok tükettiği ürün.
3. **TK-700/800 Bulaşık Hijyeni:** Toplu yemek fabrikaları ve oteller için düzenli sarf kimyasalı.`;
  }

  // Default professional chemistry ERP guidance
  return `👨‍🔬 **Teori Kimya Danışmanı "Kimyager AI":**
Sorunuzu inceledim. Teori Kimya üretim, stok ve formülasyon yönetimi ile ilgili size yardımcı olabilirim.

**Hızlı İpuçları:**
- *"Kritik stok durumu nedir?"* yazarak acil üretim ihtiyacı olan mamülleri listeleyebilirsiniz.
- *"Bugünkü ciro ve kâr durumu"* yazarak anlık finansal özeti alabilirsiniz.
- *"TK-100 formülü ve seyreltme oranı"* yazarak teknik detayları sorgulayabilirsiniz.
- *"Asit ve klor karışımı"* gibi güvenlik sorgularında anında kimyasal risk analizi alabilirsiniz.`;
}
