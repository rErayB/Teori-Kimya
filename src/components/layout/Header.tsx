import React from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  ShoppingCart,
  QrCode,
  PlusCircle,
  UserCheck,
  Phone,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { UserRole } from '../../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onNavigate: (tab: string) => void;
  onQuickAction: (action: string) => void;
  contactPerson: string;
  phone: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenSearch,
  onOpenNotifications,
  unreadNotificationsCount,
  userRole,
  onChangeRole,
  onNavigate,
  onQuickAction,
  contactPerson,
  phone,
}) => {
  const roleNames: Record<UserRole, string> = {
    admin: 'Yönetici (Admin)',
    authorized: 'Yetkili Müdür',
    sales: 'Satış Personeli',
    warehouse: 'Depo Sorumlusu',
    customer: 'Müşteri / Katalog',
  };

  return (
    <header className="h-18 px-4 sm:px-6 bg-[#0B1B2E]/95 backdrop-blur-md border-b border-cyan-500/15 flex items-center justify-between gap-3 text-slate-100 sticky top-0 z-20">
      {/* Mobile brand & menu trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden">
          <Logo size="sm" showSubtitle={false} />
        </div>

        {/* Global Search trigger for desktop */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#102A43]/60 hover:bg-[#163A5F]/80 border border-cyan-500/20 text-slate-400 hover:text-slate-200 transition-all text-xs w-64 lg:w-80 cursor-pointer shadow-inner"
        >
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate">Ürün, müşteri, barkod ara...</span>
          <kbd className="ml-auto px-1.5 py-0.5 rounded bg-slate-900/80 text-[10px] text-cyan-300 border border-slate-700/80 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right control cluster */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Icon Button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Arama"
        >
          <Search className="w-5 h-5 text-cyan-400" />
        </button>

        {/* Quick Action: POS */}
        {userRole !== 'customer' && (
          <button
            onClick={() => onNavigate('pos')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-400/30 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Kasa / POS</span>
          </button>
        )}

        {/* Quick Action: Barcode */}
        {userRole !== 'customer' && (
          <button
            onClick={() => onNavigate('barcode')}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Barkod</span>
          </button>
        )}

        {/* Kimyager AI Quick Launch */}
        <button
          onClick={() => onNavigate('kimyager')}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-900/40 to-sky-900/30 border border-cyan-400/30 text-cyan-300 hover:border-cyan-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
          title="Kimyager AI Danışmanı"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          <span className="hidden sm:inline">Kimyager AI</span>
        </button>

        {/* Role Switcher Dropdown */}
        <div className="relative flex items-center">
          <select
            value={userRole}
            onChange={(e) => onChangeRole(e.target.value as UserRole)}
            className="text-[11px] sm:text-xs font-semibold px-2 sm:px-3 py-1.5 rounded-xl bg-[#102A43] border border-cyan-500/25 text-cyan-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
            title="Aktif Kullanıcı Rolü"
          >
            <option value="admin">Admin</option>
            <option value="authorized">Yetkili</option>
            <option value="sales">Satış</option>
            <option value="warehouse">Depo</option>
            <option value="customer">Ziyaretçi / B2B</option>
          </select>
        </div>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          title="Bildirimler"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-black text-white flex items-center justify-center animate-bounce">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Sales Consultant Badge (From Card) */}
        <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-700/60">
          <div className="w-8 h-8 rounded-full bg-[#163A5F] border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
            MB
          </div>
          <div className="text-left leading-tight">
            <p className="text-xs font-bold text-white">{contactPerson}</p>
            <p className="text-[10px] text-cyan-300 flex items-center gap-1">
              <Phone className="w-2.5 h-2.5" /> {phone}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
