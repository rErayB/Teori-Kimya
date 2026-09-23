import React, { useState, useEffect } from 'react';
import {
  Wallet,
  DollarSign,
  Plus,
  Search,
  Users,
  Calendar,
  CreditCard,
  Building,
  TrendingDown,
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sparkles,
  PieChart,
  Tag,
  ArrowRight,
  Receipt,
  UserCheck,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Expense, ExpenseCategory, Staff, PaymentMethod, SalaryPayment } from '../../types';
import { repository } from '../../services/storage';

interface ExpensesViewProps {
  onNavigate?: (tab: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'staff' | 'pnl'>('expenses');
  const [expenses, setExpenses] = useState<Expense[]>(repository.getExpenses());
  const [staffList, setStaffList] = useState<Staff[]>(repository.getStaff());
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>(repository.getSalaryPayments());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'today'>('month');

  // New Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<string>('Kira');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [expenseRecipient, setExpenseRecipient] = useState('');
  const [expenseReceiptNo, setExpenseReceiptNo] = useState('');
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expenseNotes, setExpenseNotes] = useState('');
  const [expenseError, setExpenseError] = useState<string | null>(null);

  // Staff Modals
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffFullName, setStaffFullName] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffSalary, setStaffSalary] = useState<number>(30000);
  const [staffNotes, setStaffNotes] = useState('');

  // Pay Salary Modal
  const [payingStaff, setPayingStaff] = useState<Staff | null>(null);
  const [paySalaryAmount, setPaySalaryAmount] = useState<number>(0);
  const [paySalaryMethod, setPaySalaryMethod] = useState<PaymentMethod>('bank_transfer');
  const [paySalaryNotes, setPaySalaryNotes] = useState('');

  // Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = repository.subscribe(() => {
      setExpenses(repository.getExpenses());
      setStaffList(repository.getStaff());
      setSalaryPayments(repository.getSalaryPayments());
    });
    return unsub;
  }, []);

  const defaultCategories = [
    'Kira',
    'Maaş',
    'Elektrik',
    'Su',
    'Doğalgaz',
    'İnternet',
    'Telefon',
    'Araç',
    'Yakıt',
    'Kargo',
    'Nakliye',
    'Reklam',
    'Vergi',
    'Muhasebe',
    'Bakım',
    'Personel',
    'Ofis giderleri',
    'Diğer',
  ];

  // Distinct list of all categories including custom ones recorded
  const allCategories = Array.from(
    new Set([...defaultCategories, ...expenses.map((e) => e.category)])
  );

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError(null);

    if (!expenseTitle.trim()) {
      setExpenseError('Lütfen gider başlığını yazınız.');
      return;
    }

    if (expenseAmount <= 0) {
      setExpenseError('Gider tutarı sıfırdan büyük olmalıdır.');
      return;
    }

    const finalCategory =
      expenseCategory === '__custom__' ? customCategoryInput.trim() : expenseCategory;

    if (!finalCategory) {
      setExpenseError('Lütfen geçerli bir gider kategorisi belirtiniz.');
      return;
    }

    const paymentMethodClean: 'cash' | 'credit_card' | 'bank_transfer' =
      expensePaymentMethod === 'open_account' ? 'bank_transfer' : expensePaymentMethod;

    const result = repository.addExpense({
      title: expenseTitle.trim(),
      category: finalCategory as ExpenseCategory,
      amount: Number(expenseAmount),
      paymentMethod: paymentMethodClean,
      recipientOrCompany: expenseRecipient.trim() || undefined,
      documentNo: expenseReceiptNo.trim() || undefined,
      date: expenseDate ? `${expenseDate}T12:00:00.000Z` : new Date().toISOString(),
      notes: expenseNotes.trim() || undefined,
    });

    if (!result.success) {
      setExpenseError('Gider kaydedilemedi.');
      return;
    }

    setToastMessage(`"${expenseTitle}" tutarı (${expenseAmount.toLocaleString('tr-TR')} ₺) giderlere eklendi.`);
    setIsExpenseModalOpen(false);
    // Reset
    setExpenseTitle('');
    setExpenseAmount(0);
    setExpenseRecipient('');
    setExpenseReceiptNo('');
    setExpenseNotes('');
  };

  const handleDeleteExpense = (id: string, title: string) => {
    if (confirm(`"${title}" gider kaydını silmek istediğinize emin misiniz?`)) {
      repository.deleteExpense(id);
      setToastMessage('Gider kaydı silindi.');
    }
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFullName.trim()) return;

    repository.addStaff({
      fullName: staffFullName.trim(),
      role: staffRole.trim() || 'Personel',
      phone: staffPhone.trim() || '-',
      monthlySalary: Number(staffSalary),
      paymentDay: 1,
      active: true,
      notes: staffNotes.trim() || undefined,
    });

    setToastMessage(`Personel "${staffFullName}" başarıyla kaydedildi.`);
    setIsStaffModalOpen(false);
    setStaffFullName('');
    setStaffRole('');
    setStaffPhone('');
    setStaffSalary(30000);
    setStaffNotes('');
  };

  const handlePaySalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingStaff || paySalaryAmount <= 0) return;

    const result = repository.paySalary({
      staffId: payingStaff.id,
      amount: Number(paySalaryAmount),
      paymentMethod: (paySalaryMethod === 'open_account' ? 'bank_transfer' : paySalaryMethod) as 'cash' | 'bank_transfer',
      notes: paySalaryNotes,
    });

    if (result.success) {
      setToastMessage(
        `${payingStaff.fullName} için ${paySalaryAmount.toLocaleString('tr-TR')} ₺ maaş ödemesi yapıldı ve giderlere yansıtıldı.`
      );
      setPayingStaff(null);
      setPaySalaryAmount(0);
      setPaySalaryNotes('');
    }
  };

  // Date Filtering
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const filteredExpenses = expenses.filter((exp) => {
    if (selectedCategoryFilter !== 'all' && exp.category !== selectedCategoryFilter) {
      return false;
    }
    if (selectedPeriod === 'today' && !exp.date.startsWith(todayStr)) return false;
    if (selectedPeriod === 'month' && !exp.date.startsWith(currentMonthStr)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = exp.title.toLowerCase().includes(q);
      const matchRec = exp.recipientOrCompany?.toLowerCase().includes(q);
      const matchReceipt = exp.documentNo?.toLowerCase().includes(q);
      const matchCat = exp.category.toLowerCase().includes(q);
      if (!matchTitle && !matchRec && !matchReceipt && !matchCat) return false;
    }

    return true;
  });

  // Calculate Metrics for P&L (Requirement 8)
  const dashboardMetrics = repository.getDashboardMetrics();
  const totalSalesRevenue = dashboardMetrics.monthRevenue;
  const totalProductCost = dashboardMetrics.totalCostMonth;
  const grossProfit = dashboardMetrics.grossProfitMonth;
  const totalExpenses = dashboardMetrics.totalExpensesMonth;
  const netProfit = dashboardMetrics.netProfitMonth;
  const netProfitMargin = dashboardMetrics.profitMarginMonth;

  // Monthly Expenses Total
  const thisMonthExpenses = expenses
    .filter((e) => e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Giderler & Maaş Yönetimi
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-400/30">
              Net Kâr Bağlantılı
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            İşletme giderleri, personel maaş bordrosu ve Brüt Kâr - Giderler = Net Kâr hesaplaması.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'staff' ? (
            <Button
              variant="primary"
              onClick={() => setIsStaffModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Yeni Personel Ekle
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                setExpenseError(null);
                setExpenseTitle('');
                setExpenseAmount(0);
                setExpenseCategory('Kira');
                setExpenseRecipient('');
                setExpenseReceiptNo('');
                setExpenseNotes('');
                setIsExpenseModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Yeni Gider Kaydı
            </Button>
          )}
        </div>
      </div>

      {/* Toast alert */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white font-bold"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'expenses'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg'
              : 'bg-[#0B1B2E] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>İşletme Giderleri ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'staff'
              ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-lg'
              : 'bg-[#0B1B2E] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Personel & Maaş Takibi ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pnl')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'pnl'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'bg-[#0B1B2E] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Gelir - Maliyet - Net Kâr Raporu</span>
        </button>
      </div>

      {/* TAB 1: EXPENSES LIST */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-rose-500/25 shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Bu Ay Toplam Gider</span>
              <p className="text-xl sm:text-2xl font-black text-rose-400 mt-1">
                {thisMonthExpenses.toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-[10px] text-slate-400">Tüm kategoriler dahil</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Genel Toplam Gider</span>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">
                {totalExpenses.toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-[10px] text-cyan-400">{expenses.length} gider faturası</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-emerald-500/20 shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Toplam Satış Cirosu</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                {totalSalesRevenue.toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-[10px] text-emerald-300">Brüt Gelir</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Net İşletme Kârı</span>
              <p
                className={`text-xl sm:text-2xl font-black mt-1 ${
                  netProfit >= 0 ? 'text-[#8DE7F2]' : 'text-red-400'
                }`}
              >
                {netProfit.toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-[10px] text-slate-400">Brüt Kâr - Giderler</span>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Gider adı, kategori, kişi/firma veya fiş no ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/25 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#102A43] border border-cyan-500/20 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
                <Tag className="w-3.5 h-3.5 text-rose-400" />
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="all">Tüm Kategoriler</option>
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center bg-[#102A43] border border-cyan-500/20 rounded-xl p-0.5 text-xs">
                <button
                  onClick={() => setSelectedPeriod('month')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedPeriod === 'month'
                      ? 'bg-rose-500 text-white font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Bu Ay
                </button>
                <button
                  onClick={() => setSelectedPeriod('today')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedPeriod === 'today'
                      ? 'bg-rose-500 text-white font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Bugün
                </button>
                <button
                  onClick={() => setSelectedPeriod('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedPeriod === 'all'
                      ? 'bg-rose-500 text-white font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Tümü
                </button>
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#07111F] text-slate-400 font-bold border-b border-cyan-500/20 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Gider Adı</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Tarih</th>
                    <th className="py-3.5 px-4">Kişi / Firma</th>
                    <th className="py-3.5 px-4">Ödeme Yöntemi</th>
                    <th className="py-3.5 px-4 text-right">Tutar (₺)</th>
                    <th className="py-3.5 px-4 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Wallet className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                        <p>Kriterlere uygun gider kaydı bulunamadı.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-[#102A43]/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{exp.title}</span>
                          {exp.documentNo && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Fiş/Fat: {exp.documentNo}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-950/60 text-rose-300 border border-rose-500/30">
                            {exp.category}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300">
                          {new Date(exp.date).toLocaleDateString('tr-TR')}
                        </td>

                        <td className="py-3 px-4 text-slate-200">
                          {exp.recipientOrCompany || '—'}
                        </td>

                        <td className="py-3 px-4 text-slate-400 capitalize">
                          {exp.paymentMethod === 'bank_transfer'
                            ? 'Banka / Havale'
                            : exp.paymentMethod === 'cash'
                            ? 'Nakit'
                            : 'Kredi Kartı'}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-black text-rose-400 text-sm">
                          -{exp.amount.toLocaleString('tr-TR')} ₺
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteExpense(exp.id, exp.title)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Gideri Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF & PAYROLL */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Kayıtlı Personel</span>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">
                {staffList.length} Kişi
              </p>
              <span className="text-[10px] text-cyan-400">Üretim, Satış & Sevkiyat Ekibi</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-rose-500/20 shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Aylık Toplam Maaş Yükü</span>
              <p className="text-xl sm:text-2xl font-black text-rose-400 mt-1">
                {staffList.reduce((sum, s) => sum + s.monthlySalary, 0).toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-[10px] text-slate-400">Aylık tahakkuk eden bordro</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B1B2E] border border-emerald-500/20 shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Toplam Ödenen Maaş</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                {salaryPayments.reduce((sum, p) => sum + p.paidAmount, 0).toLocaleString('tr-TR')} ₺
              </p>
              <span className="text-[10px] text-emerald-300">Giderlere işlenen ödemeler</span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#07111F] text-slate-400 font-bold border-b border-cyan-500/20 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Ad Soyad</th>
                    <th className="py-3.5 px-4">Görev / Departman</th>
                    <th className="py-3.5 px-4">Telefon</th>
                    <th className="py-3.5 px-4 text-right">Aylık Maaş</th>
                    <th className="py-3.5 px-4 text-right">Toplam Ödenen</th>
                    <th className="py-3.5 px-4">Son Ödeme Tarihi</th>
                    <th className="py-3.5 px-4 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {staffList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                        <p>Henüz personel kaydı eklenmedi.</p>
                      </td>
                    </tr>
                  ) : (
                    staffList.map((staff) => {
                      const staffPayments = salaryPayments.filter((p) => p.staffId === staff.id);
                      const staffTotalPaid = staffPayments.reduce((sum, p) => sum + p.paidAmount, 0);
                      const lastPayment = [...staffPayments].sort(
                        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                      )[0];
                      const lastPaidDate = lastPayment?.date;

                      return (
                        <tr key={staff.id} className="hover:bg-[#102A43]/40 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-white block">{staff.fullName}</span>
                            {staff.notes && (
                              <span className="text-[10px] text-slate-400 truncate block max-w-xs">
                                {staff.notes}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                              {staff.role}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-300">
                            {staff.phone || '—'}
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                            {staff.monthlySalary.toLocaleString('tr-TR')} ₺
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-black text-emerald-400">
                            {staffTotalPaid.toLocaleString('tr-TR')} ₺
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-400">
                            {lastPaidDate
                              ? new Date(lastPaidDate).toLocaleDateString('tr-TR')
                              : 'Henüz ödeme yok'}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                setPayingStaff(staff);
                                setPaySalaryAmount(staff.monthlySalary);
                                setPaySalaryNotes(`${staff.fullName} Maaş Ödemesi`);
                              }}
                              icon={<DollarSign className="w-3.5 h-3.5" />}
                            >
                              Maaş Öde
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: P&L REVENUE, COST, EXPENSE, NET PROFIT REPORT (Requirement 8) */}
      {activeTab === 'pnl' && (
        <div className="space-y-6">
          {/* Main Profit & Loss Formula Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0B1B2E] via-[#102A43] to-[#07111F] border-2 border-cyan-500/40 shadow-2xl space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Resmi Muhasebe & İşletme Kâr-Zarar Tablosu (P&L)
              </span>
              <h3 className="text-2xl font-black text-white">
                Satış Geliri − Ürün Maliyeti = Brüt Kâr → Brüt Kâr − İşletme Giderleri = Net Kâr
              </h3>
            </div>

            {/* Visual Profit Formula Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
              {/* 1. Revenue */}
              <div className="p-4 rounded-xl bg-[#07111F] border border-cyan-500/30 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">1. Toplam Ciro</span>
                <p className="text-xl font-black text-emerald-400 mt-1">
                  +{totalSalesRevenue.toLocaleString('tr-TR')} ₺
                </p>
                <span className="text-[10px] text-slate-400">Satış Geliri</span>
              </div>

              <div className="text-center font-black text-xl text-slate-500 hidden md:block">−</div>

              {/* 2. Product Cost */}
              <div className="p-4 rounded-xl bg-[#07111F] border border-amber-500/30 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">2. Ürün Maliyeti</span>
                <p className="text-xl font-black text-amber-400 mt-1">
                  −{totalProductCost.toLocaleString('tr-TR')} ₺
                </p>
                <span className="text-[10px] text-slate-400">Satılan Malın Maliyeti</span>
              </div>

              <div className="text-center font-black text-xl text-slate-500 hidden md:block">=</div>

              {/* 3. Gross Profit */}
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-400/50 text-center">
                <span className="text-[10px] font-bold text-cyan-300 uppercase">Brüt Kâr</span>
                <p className="text-2xl font-black text-[#8DE7F2] mt-1">
                  {grossProfit.toLocaleString('tr-TR')} ₺
                </p>
                <span className="text-[10px] text-slate-300">Maliyet Sonrası Kâr</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-cyan-500/20">
              <div className="p-4 rounded-xl bg-[#07111F] border border-cyan-500/30">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Brüt Kâr</span>
                <p className="text-2xl font-black text-cyan-300 mt-1">
                  {grossProfit.toLocaleString('tr-TR')} ₺
                </p>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40">
                <span className="text-[10px] font-bold text-rose-300 uppercase">İşletme Giderleri (−)</span>
                <p className="text-2xl font-black text-rose-400 mt-1">
                  −{totalExpenses.toLocaleString('tr-TR')} ₺
                </p>
                <span className="text-[10px] text-slate-400">Kira, Maaş, Elektrik, Yakıt vs.</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/60 border-2 border-emerald-400/60 shadow-lg">
                <span className="text-[10px] font-bold text-emerald-300 uppercase">NET İŞLETME KÂRI</span>
                <p className="text-3xl font-black text-emerald-300 mt-1">
                  {netProfit.toLocaleString('tr-TR')} ₺
                </p>
                <span className="text-[11px] font-bold text-emerald-200">
                  Net Kâr Marjı: %{netProfitMargin.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Expense Category Breakdown */}
          <div className="p-6 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              Giderlerin Kategori Bazlı Dağılımı
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allCategories.map((cat) => {
                const catExpenses = expenses.filter((e) => e.category === cat);
                const catTotal = catExpenses.reduce((sum, e) => sum + e.amount, 0);
                if (catTotal <= 0) return null;
                const percent = totalExpenses > 0 ? (catTotal / totalExpenses) * 100 : 0;

                return (
                  <div
                    key={cat}
                    className="p-3 rounded-xl bg-[#102A43] border border-slate-700 space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{cat}</span>
                      <span className="font-mono font-bold text-rose-300">
                        {catTotal.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{catExpenses.length} Kayıt</span>
                      <span>%{percent.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Expense */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Yeni İşletme Gideri Kaydet"
        size="md"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
          {expenseError && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{expenseError}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Gider Adı / Başlığı <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Örn: Fabrika Kira Bedeli, Elektrik Faturası, Forklift Mazot..."
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Kategori <span className="text-red-400">*</span>
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {defaultCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__custom__">+ Yeni Özel Kategori...</option>
              </select>
            </div>

            {expenseCategory === '__custom__' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Özel Kategori Adı <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Kategori adı yazın..."
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Gider Tutarı (₺) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Ödeme Yöntemi
              </label>
              <select
                value={expensePaymentMethod}
                onChange={(e) => setExpensePaymentMethod(e.target.value as any)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="bank_transfer">Banka / Havale / EFT</option>
                <option value="cash">Nakit Kasa</option>
                <option value="credit_card">Kredi Kartı</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Tarih
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                İlgili Kişi / Kurum / Firma
              </label>
              <input
                type="text"
                placeholder="Örn: Toros Elektrik A.Ş., Mülk Sahibi..."
                value={expenseRecipient}
                onChange={(e) => setExpenseRecipient(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Fiş / Fatura No
              </label>
              <input
                type="text"
                placeholder="Örn: FŞ-2026-99"
                value={expenseReceiptNo}
                onChange={(e) => setExpenseReceiptNo(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Açıklama / Not
            </label>
            <textarea
              rows={2}
              placeholder="Detaylı gider açıklaması..."
              value={expenseNotes}
              onChange={(e) => setExpenseNotes(e.target.value)}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsExpenseModalOpen(false)}
            >
              Vazgeç
            </Button>
            <Button type="submit" variant="primary" icon={<CheckCircle2 className="w-4 h-4" />}>
              Gideri Kaydet
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Staff */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title="Yeni Personel Ekle"
        size="md"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Personel Adı Soyadı <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Örn: Ahmet Yılmaz"
              value={staffFullName}
              onChange={(e) => setStaffFullName(e.target.value)}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Görevi / Pozisyonu
              </label>
              <input
                type="text"
                placeholder="Örn: Kimya Teknisyeni, Sevkiyat Şoförü..."
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Telefon Numarası
              </label>
              <input
                type="text"
                placeholder="0532 000 00 00"
                value={staffPhone}
                onChange={(e) => setStaffPhone(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Aylık Net Maaş (₺) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={staffSalary}
              onChange={(e) => setStaffSalary(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Not / Açıklama
            </label>
            <textarea
              rows={2}
              placeholder="İşe başlama tarihi veya personel notları..."
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsStaffModalOpen(false)}
            >
              Vazgeç
            </Button>
            <Button type="submit" variant="primary" icon={<UserCheck className="w-4 h-4" />}>
              Personeli Kaydet
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Pay Salary */}
      {payingStaff && (
        <Modal
          isOpen={true}
          onClose={() => setPayingStaff(null)}
          title={`Maaş Ödemesi: ${payingStaff.fullName}`}
          size="md"
        >
          <form onSubmit={handlePaySalary} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>Görevi:</span>
                <span className="font-bold text-white">{payingStaff.role}</span>
              </div>
              <div className="flex justify-between">
                <span>Kayıtlı Maaş Tutarı:</span>
                <span className="font-mono font-bold text-cyan-300">
                  {payingStaff.monthlySalary.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="flex justify-between">
                <span>Şimdiye Kadar Ödenen:</span>
                <span className="font-mono text-emerald-400">
                  {salaryPayments
                    .filter((p) => p.staffId === payingStaff.id)
                    .reduce((sum, p) => sum + p.paidAmount, 0)
                    .toLocaleString('tr-TR')}{' '}
                  ₺
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Ödenecek Tutar (₺) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={paySalaryAmount}
                onChange={(e) => setPaySalaryAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Ödeme Yöntemi
              </label>
              <select
                value={paySalaryMethod}
                onChange={(e) => setPaySalaryMethod(e.target.value as any)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="bank_transfer">Banka Havalesi / EFT</option>
                <option value="cash">Nakit</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Açıklama / Not
              </label>
              <input
                type="text"
                value={paySalaryNotes}
                onChange={(e) => setPaySalaryNotes(e.target.value)}
                className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <p className="text-[11px] text-cyan-400 font-medium">
              * Bu ödeme onaylandığında "Maaş" kategorisinde otomatik işletme gider kaydı oluşturulur ve net kâr hesabına anında yansır.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPayingStaff(null)}
              >
                Vazgeç
              </Button>
              <Button type="submit" variant="primary" icon={<CheckCircle2 className="w-4 h-4" />}>
                Maaş Ödemesini Onayla ({paySalaryAmount.toLocaleString('tr-TR')} ₺)
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
