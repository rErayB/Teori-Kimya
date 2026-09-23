import React, { useState, useRef } from 'react';
import {
  Settings,
  Building2,
  Save,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../common/Button';
import { repository } from '../../services/storage';

export const SettingsView: React.FC = () => {
  const company = repository.getCompany();

  const [companyForm, setCompanyForm] = useState({
    name: company.name,
    subtitle: company.subtitle,
    contactPerson: company.contactPerson,
    title: company.title,
    phone: company.phone,
    email: company.email,
    address: company.address,
    taxOffice: company.taxOffice,
    taxNumber: company.taxNumber,
    tradeRegistryNo: company.tradeRegistryNo || '',
    mersisNo: company.mersisNo || '',
    website: company.website || '',
    bankAccount: company.bankAccount || '',
    iban: company.iban || '',
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    repository.updateCompany(companyForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const jsonString = repository.exportDatabaseJson();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TeoriKimya_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = repository.importDatabaseJson(content);
        if (success) {
          alert('Yedek başarıyla yüklendi! Sistem verileri güncellendi.');
          window.location.reload();
        } else {
          alert('Hata: Geçersiz yedek dosyası formatı!');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    repository.resetAllData();
    alert('Sistem fabrika varsayılanlarına sıfırlandı.');
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            Sistem & Firma Ayarları
          </h2>
          <p className="text-xs text-slate-400">
            Kartvizit kurumsal bilgileri, yedekleme ve genel parametreler
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Firma bilgileri başarıyla kaydedildi!</span>
        </div>
      )}

      {/* Company Profile Card */}
      <div className="p-6 rounded-2xl bg-[#0B1B2E] border border-cyan-500/25 shadow-xl space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-cyan-500/15">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Kartvizit & Kurumsal Kimlik</h3>
            <p className="text-xs text-slate-400">
              Faturalarda, irsaliyelerde ve müşteri belgelerinde yazdırılacak resmi bilgiler
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Firma Ticari Unvanı</label>
              <input
                type="text"
                required
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kurumsal Slogan</label>
              <input
                type="text"
                value={companyForm.subtitle}
                onChange={(e) => setCompanyForm({ ...companyForm, subtitle: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Satış Danışmanı / Yetkili
              </label>
              <input
                type="text"
                value={companyForm.contactPerson}
                onChange={(e) => setCompanyForm({ ...companyForm, contactPerson: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Unvan</label>
              <input
                type="text"
                value={companyForm.title}
                onChange={(e) => setCompanyForm({ ...companyForm, title: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">İletişim Telefonu</label>
              <input
                type="text"
                value={companyForm.phone}
                onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">E-Posta Adresi</label>
              <input
                type="email"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Resmi Adres</label>
              <input
                type="text"
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vergi Dairesi</label>
              <input
                type="text"
                value={companyForm.taxOffice}
                onChange={(e) => setCompanyForm({ ...companyForm, taxOffice: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vergi Kimlik Numarası</label>
              <input
                type="text"
                value={companyForm.taxNumber}
                onChange={(e) => setCompanyForm({ ...companyForm, taxNumber: e.target.value })}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
              Firma Bilgilerini Kaydet
            </Button>
          </div>
        </form>
      </div>

      {/* Backup & Data Safety Card */}
      <div className="p-6 rounded-2xl bg-[#0B1B2E] border border-cyan-500/25 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-cyan-500/15">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Veri Güvenliği & Yedekleme</h3>
            <p className="text-xs text-slate-400">
              Veritabanını JSON formatında indirip saklayabilir veya geri yükleyebilirsiniz
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[#102A43]/50 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-xs">Yedek İndir (JSON)</h4>
            <p className="text-xs text-slate-400">
              Tüm ürün, cari, stok, reçete ve satış faturalarınızı tek tıklamayla bilgisayarınıza indirin.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportBackup}
              icon={<Download className="w-4 h-4 text-cyan-400" />}
            >
              Tam Yedek İndir
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-[#102A43]/50 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-xs">Yedekten Geri Yükle</h4>
            <p className="text-xs text-slate-400">
              Daha önce aldığınız JSON yedek dosyasını seçerek sistemi geri yükleyin.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              icon={<Upload className="w-4 h-4" />}
            >
              Yedek Dosyası Seç
            </Button>
          </div>
        </div>

        {/* Factory Reset */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-red-400 text-xs">Fabrika Ayarlarına Sıfırla</h4>
            <p className="text-xs text-slate-500">
              Tüm özel verileri silerek başlangıç demo verilerini tekrar yükler.
            </p>
          </div>

          {resetConfirmOpen ? (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="danger" onClick={handleResetDefaults}>
                Evet, Sıfırla
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setResetConfirmOpen(false)}>
                Vazgeç
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="danger"
              onClick={() => setResetConfirmOpen(true)}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Verileri Sıfırla
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
