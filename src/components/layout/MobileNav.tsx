import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  QrCode,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  criticalStockCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  criticalStockCount,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'pos', label: 'Kasa / POS', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'barcode', label: 'Barkod', icon: <QrCode className="w-5 h-5" /> },
    { id: 'products', label: 'Ürünler', icon: <Package className="w-5 h-5" /> },
    {
      id: 'stock',
      label: 'Stok',
      icon: <Layers className="w-5 h-5" />,
      badge: criticalStockCount > 0 ? criticalStockCount : undefined,
    },
    { id: 'kimyager', label: 'AI Asistan', icon: <Sparkles className="w-5 h-5 text-cyan-400" /> },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#07111F]/95 backdrop-blur-lg border-t border-cyan-500/20 px-2 pt-1.5 flex items-center justify-around select-none"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
              isActive ? 'text-[#8DE7F2] font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge !== undefined && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-black bg-red-500 text-white">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-[#55BBD9] mt-0.5 animate-pulse" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
