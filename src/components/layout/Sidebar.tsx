import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Package,
  PackagePlus,
  Receipt,
  QrCode,
  Layers,
  FlaskConical,
  Beaker,
  Users,
  Building2,
  FileText,
  BookOpen,
  BarChart3,
  Truck,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  X,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { UserRole } from '../../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole: UserRole;
  criticalStockCount: number;
  pendingOrdersCount: number;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
  badge?: number;
  badgeColor?: string;
}

interface MenuSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  userRole,
  criticalStockCount,
  pendingOrdersCount,
  isMobile = false,
  onCloseMobile,
}) => {
  // Navigation structure
  const menuSections: MenuSection[] = [
    {
      title: 'YÖNETİM & SATIŞ',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['admin', 'authorized', 'sales', 'warehouse'] },
        { id: 'pos', label: 'Satış / POS', icon: <ShoppingCart className="w-5 h-5" />, roles: ['admin', 'authorized', 'sales'] },
        { id: 'orders', label: 'Siparişler (B2B)', icon: <ShoppingBag className="w-5 h-5" />, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, roles: ['admin', 'authorized', 'sales'] },
        { id: 'invoices', label: 'Faturalar & İadeler', icon: <FileText className="w-5 h-5" />, roles: ['admin', 'authorized', 'sales'] },
        { id: 'customers', label: 'Müşteriler / Cari', icon: <Users className="w-5 h-5" />, roles: ['admin', 'authorized', 'sales'] },
      ],
    },
    {
      title: 'ÜRÜN & STOK GİRİŞİ',
      items: [
        { id: 'purchases', label: 'Mal Alımı / Stok Girişi', icon: <PackagePlus className="w-5 h-5 text-emerald-400" />, roles: ['admin', 'authorized', 'warehouse'] },
        { id: 'products', label: 'Ürün Yönetimi', icon: <Package className="w-5 h-5" />, roles: ['admin', 'authorized', 'sales', 'warehouse'] },
        { id: 'barcode', label: 'Barkod / Kamera', icon: <QrCode className="w-5 h-5 text-cyan-400" />, roles: ['admin', 'authorized', 'sales', 'warehouse'] },
        { id: 'stock', label: 'Stok Durumu', icon: <Layers className="w-5 h-5" />, badge: criticalStockCount > 0 ? criticalStockCount : undefined, badgeColor: 'bg-red-500', roles: ['admin', 'authorized', 'warehouse'] },
        { id: 'catalog', label: 'Ürün Kataloğu', icon: <BookOpen className="w-5 h-5" />, roles: ['admin', 'authorized', 'sales', 'warehouse', 'customer'] },
      ],
    },
    {
      title: 'KİMYA & ÜRETİM',
      items: [
        { id: 'raw_materials', label: 'Hammaddeler', icon: <Beaker className="w-5 h-5" />, roles: ['admin', 'authorized', 'warehouse'] },
        { id: 'production', label: 'Üretim & Parti', icon: <FlaskConical className="w-5 h-5" />, roles: ['admin', 'authorized', 'warehouse'] },
        { id: 'recipes', label: 'Reçeteler', icon: <FlaskConical className="w-5 h-5" />, roles: ['admin', 'authorized', 'warehouse'] },
        { id: 'suppliers', label: 'Tedarikçiler / Cari', icon: <Building2 className="w-5 h-5" />, roles: ['admin', 'authorized', 'warehouse'] },
        { id: 'adr', label: 'ADR Sevkiyat', icon: <Truck className="w-5 h-5" />, roles: ['admin', 'authorized', 'warehouse'] },
      ],
    },
    {
      title: 'FİNANS & GİDERLER',
      items: [
        { id: 'expenses', label: 'Giderler & Maaş', icon: <Receipt className="w-5 h-5 text-amber-400" />, roles: ['admin', 'authorized'] },
        { id: 'reports', label: 'Kâr & Nakit Raporu', icon: <BarChart3 className="w-5 h-5 text-cyan-400" />, roles: ['admin', 'authorized'] },
        { id: 'kimyager', label: 'Kimyager AI', icon: <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />, roles: ['admin', 'authorized', 'sales', 'warehouse', 'customer'] },
        { id: 'settings', label: 'Ayarlar', icon: <Settings className="w-5 h-5" />, roles: ['admin'] },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-cyan-500/15 bg-gradient-to-b from-[#07111F] via-[#0B1B2E] to-[#07111F] text-slate-100 transition-all duration-300 z-30 select-none ${
        isMobile ? 'w-full h-full' : collapsed ? 'hidden lg:flex w-20' : 'hidden lg:flex w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-18 flex items-center justify-between px-4 border-b border-cyan-500/15 shrink-0">
        {!collapsed || isMobile ? (
          <Logo size="sm" showSubtitle={true} />
        ) : (
          <div className="mx-auto">
            <Logo size="sm" showSubtitle={false} />
          </div>
        )}

        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Menüyü Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Collapse Toggle Button (Desktop Only) */}
      {!isMobile && (
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3.5 top-20 w-7 h-7 rounded-full bg-[#102A43] border border-cyan-500/30 text-cyan-300 flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-all shadow-md cursor-pointer z-40"
          title={collapsed ? 'Genişlet' : 'Daralt'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {menuSections.map((section, sIdx) => {
          // Filter items based on user role
          const visibleItems = section.items.filter((item) => item.roles.includes(userRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              {(!collapsed || isMobile) && (
                <p className="px-3 text-[10px] font-extrabold tracking-wider text-cyan-400/60 uppercase">
                  {section.title}
                </p>
              )}
              {visibleItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer relative group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/25 to-sky-500/10 text-white font-semibold shadow-inner border-l-4 border-[#55BBD9]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <span className={`${isActive ? 'text-[#8DE7F2]' : 'text-slate-400 group-hover:text-cyan-300'} transition-colors shrink-0`}>
                      {item.icon}
                    </span>

                    {!collapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}

                    {!collapsed && item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-black text-white ${
                          item.badgeColor || 'bg-cyan-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {collapsed && item.badge !== undefined && (
                      <span
                        className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                          item.badgeColor || 'bg-cyan-500'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Chemical Theme Watermark Footer */}
      <div className="p-3 border-t border-cyan-500/15 bg-[#07111F]/80">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-cyan-950/20 border border-cyan-500/15 text-[11px] text-cyan-200/70">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="truncate">
              <p className="font-semibold text-white">ISO & ADR Uyumlu</p>
              <p className="text-[10px] text-slate-400">Kimyasal ERP Portalı</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="ISO & ADR Uyumlu">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
