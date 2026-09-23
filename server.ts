import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // Kimyager AI Endpoint
  app.post('/api/kimyager', async (req, res) => {
    const { prompt, context } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY ortam değişkeni tanımlı değil. Lütfen Secrets panelinden ekleyiniz.',
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `Sen TEORİ KİMYA (Kütahya merkezli Endüstriyel & Kurumsal Temizlik Ürünleri üreticisi) firmasının Kıdemli Kimyageri ve ERP Analisti "Kimyager AI" asistanısın.

Firma Bilgisi:
- İsim: TEORİ KİMYA - Endüstriyel & Kurumsal Temizlik Ürünleri
- Satış Danışmanı: Mehmet Bozkurt (+90 544 214 5940)
- Lokasyon: Alipaşa Mh. Cumhuriyet Cd. Avcılar İşhanı No: 32/143 KÜTAHYA
- Ürün Gamı: TK-100 Ağır Kir Yağ Sökücü, TK-200 Cilalı Fırçasız Oto Şampuanı, TK-300 Zemin Otomat Deterjanı, TK-400 Kireç Pas Çözücü, TK-500 Klorlu Hijyenik Temizleyici, TK-600 Motor Temizleyici, TK-700/800 Endüstriyel Bulaşık Kimyasalları, TK-900 Sıvı Sabun, TK-ALC 70° Dezenfektan.

Görevlerin:
1. Ürün formülleri, pH dengesi, seyreltme oranları, yüzey uyumlulukları hakkında teknik ve pratik bilgiler vermek.
2. Stok, maliyet, satış ciro ve kâr marjı analizleri sunmak. Düşük stoklu ürünler için uyarı ve üretim planlama tavsiyesinde bulunmak.
3. KİMYASAL GÜVENLİK KURALI: Asit-klor reaksiyonu (klor gazı tehlikesi) ve kuvvetli baz-asit karışımları gibi hayati tehlike arz eden durumlarda kullanıcıyı uyar. Kesin tehlikeli karışım talimatları vermek yerine Güvenlik Bilgi Formu (SDS/MSDS), KKD (Kişisel Koruyucu Donanım) ve uzman kimyager değerlendirmesine yönlendir.
4. Yanıtlarını Türkçe, kurumsal, profesyonel, anlaşılır ve madde imli olarak düzenle.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Kullanıcı Sorusu: ${prompt}\n\nMevcut ERP Durumu ve Veriler:\n${JSON.stringify(context || {})}`,
        config: {
          systemInstruction,
        },
      });

      return res.json({ text: response.text });
    } catch (err: any) {
      console.error('Kimyager AI API Error:', err);
      return res.status(500).json({ error: err?.message || 'Kimyager AI yanıt üretirken bir hata oluştu.' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Teori Kimya ERP Server' });
  });

  // Vite integration
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`TEORİ KİMYA ERP Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
