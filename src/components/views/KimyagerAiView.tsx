import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldAlert,
  Loader2,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Beaker,
} from 'lucide-react';
import { Button } from '../common/Button';
import { askKimyagerAi, ChatMessage } from '../../services/kimyagerAi';

export const KimyagerAiView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Merhaba! Ben **TEORİ KİMYA** Baş Kimyageri ve ERP Danışmanı **"Kimyager AI"**.\n\nStok durumunuz, kritik ürünler, üretim reçeteleri, ciro analizi ve kimyasal güvenlik konularında size yardımcı olabilirim. Ne hakkında bilgi almak istersiniz?`,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'Depoda acil üretilmesi gereken kritik stoklar neler?',
    'Aylık ciro ve kâr marjımız ne durumda?',
    'Asit bazlı ürünlerle klorlu temizleyiciler karıştırılabilir mi?',
    'TK-100 Ağır Kir & Yağ Sökücü reçete bileşenleri nelerdir?',
    'En çok talep gören ve kâr getiren ürünlerimiz hangileri?',
  ];

  const handleSendMessage = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const responseText = await askKimyagerAi(text, messages);
      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'Üzgünüm, şu anda yanıt oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz.',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col rounded-2xl bg-[#0B1B2E] border border-cyan-500/25 shadow-2xl overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#0B1B2E] via-[#102A43] to-[#163A5F] border-b border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
            <Sparkles className="w-5 h-5 animate-pulse text-[#8DE7F2]" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              Kimyager AI Danışmanı
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                v2.4 ERP & Kimya
              </span>
            </h3>
            <p className="text-xs text-cyan-100/70">
              Gerçek zamanlı ERP verileri ve kimyasal formülasyon analiz motoru
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-300">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          <span>SDS & ADR Uyumlu Analiz</span>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  isUser
                    ? 'bg-cyan-600/30 border-cyan-400/50 text-cyan-300'
                    : 'bg-[#102A43] border-cyan-500/30 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-cyan-400" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-tr-none'
                    : 'bg-[#102A43]/80 border border-cyan-500/20 text-slate-100 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                  {msg.text}
                </div>
                <div
                  className={`text-[10px] mt-1 text-right ${
                    isUser ? 'text-cyan-100' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#102A43] border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-[#102A43]/80 border border-cyan-500/20 text-cyan-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">ERP verileri ve kimyasal parametreler inceleniyor...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-[#07111F]/70 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Hızlı Sorular:</span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-xl bg-[#102A43] hover:bg-[#163A5F] border border-cyan-500/20 hover:border-cyan-400 text-[11px] text-cyan-200 whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <div className="p-3 sm:p-4 bg-[#07111F] border-t border-cyan-500/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Kimyager AI'ya soru sorun (örn: Kritik stoklar, aylık ciro veya klor güvenlik uyarısı)..."
            disabled={isLoading}
            className="flex-1 bg-[#102A43] border border-cyan-500/30 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 shadow-inner"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputQuery.trim() || isLoading}
            icon={<Send className="w-4 h-4" />}
          >
            Gönder
          </Button>
        </form>
      </div>
    </div>
  );
};
