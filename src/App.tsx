import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SearchCommandDialog } from './components/common/SearchCommandDialog';
import { NotificationCenter } from './components/common/NotificationCenter';

// Views
import { DashboardView } from './components/views/DashboardView';
import { PosView } from './components/views/PosView';
import { ProductsView } from './components/views/ProductsView';
import { BarcodeScannerView } from './components/views/BarcodeScannerView';
import { StockView } from './components/views/StockView';
import { OrdersView } from './components/views/OrdersView';
import { CustomersView } from './components/views/CustomersView';
import { InvoicesView } from './components/views/InvoicesView';
import { CatalogView } from './components/views/CatalogView';
import { PurchasesView } from './components/views/PurchasesView';
import { ExpensesView } from './components/views/ExpensesView';
import { RawMaterialsView } from './components/views/RawMaterialsView';
import { ProductionView } from './components/views/ProductionView';
import { RecipesView } from './components/views/RecipesView';
import { SuppliersView } from './components/views/SuppliersView';
import { AdrShippingView } from './components/views/AdrShippingView';
import { ReportsView } from './components/views/ReportsView';
import { KimyagerAiView } from './components/views/KimyagerAiView';
import { SettingsView } from './components/views/SettingsView';

import { UserRole, AppNotification } from './types';
import { repository } from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search dialog & Notification Center
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // App reactive state
  const [userRole, setUserRole] = useState<UserRole>(repository.getRole());
  const [notifications, setNotifications] = useState<AppNotification[]>(repository.getNotifications());
  const [company, setCompany] = useState(repository.getCompany());
  const [products, setProducts] = useState(repository.getProducts());
  const [orders, setOrders] = useState(repository.getOrders());

  useEffect(() => {
    const unsub = repository.subscribe(() => {
      setNotifications(repository.getNotifications());
      setCompany(repository.getCompany());
      setProducts(repository.getProducts());
      setOrders(repository.getOrders());
    });
    return unsub;
  }, []);

  const handleRoleChange = (role: UserRole) => {
    repository.setRole(role);
    setUserRole(role);
    // If role has restricted view, navigate back to catalog or dashboard
    if (role === 'customer' && activeTab !== 'catalog' && activeTab !== 'kimyager') {
      setActiveTab('catalog');
    }
  };

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const criticalStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <ErrorBoundary>
      <div className="min-h-screen min-h-[100dvh] bg-[#07111F] text-slate-100 flex flex-col font-sans">
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Collapsible Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            userRole={userRole}
            criticalStockCount={criticalStockCount}
            pendingOrdersCount={pendingOrdersCount}
          />

          {/* Mobile Drawer Overlay */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 w-72 bg-[#0B1B2E] shadow-2xl flex flex-col z-10 border-r border-cyan-500/20">
                <Sidebar
                  activeTab={activeTab}
                  onSelectTab={handleSelectTab}
                  collapsed={false}
                  onToggleCollapse={() => setMobileMenuOpen(false)}
                  userRole={userRole}
                  criticalStockCount={criticalStockCount}
                  pendingOrdersCount={pendingOrdersCount}
                  isMobile={true}
                  onCloseMobile={() => setMobileMenuOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <Header
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              unreadNotificationsCount={unreadNotificationsCount}
              userRole={userRole}
              onChangeRole={handleRoleChange}
              onNavigate={handleSelectTab}
              onQuickAction={(action) => handleSelectTab(action)}
              contactPerson={company.contactPerson}
              phone={company.phone}
            />

            {/* Dynamic View Body */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-8">
              {activeTab === 'dashboard' && (
                <DashboardView
                  onNavigate={handleSelectTab}
                  onQuickAction={handleSelectTab}
                />
              )}
              {activeTab === 'pos' && <PosView onOpenScanner={() => handleSelectTab('barcode')} />}
              {activeTab === 'products' && (
                <ProductsView onOpenScanner={() => handleSelectTab('barcode')} />
              )}
              {activeTab === 'barcode' && <BarcodeScannerView onNavigate={handleSelectTab} />}
              {activeTab === 'stock' && <StockView />}
              {activeTab === 'orders' && <OrdersView />}
              {activeTab === 'customers' && <CustomersView />}
              {activeTab === 'invoices' && <InvoicesView />}
              {activeTab === 'purchases' && <PurchasesView onNavigate={handleSelectTab} />}
              {activeTab === 'expenses' && <ExpensesView onNavigate={handleSelectTab} />}
              {activeTab === 'catalog' && (
                <CatalogView
                  userRole={userRole}
                  onAddToCart={() => handleSelectTab('pos')}
                />
              )}
              {activeTab === 'raw_materials' && <RawMaterialsView />}
              {activeTab === 'production' && <ProductionView />}
              {activeTab === 'recipes' && <RecipesView />}
              {activeTab === 'suppliers' && <SuppliersView />}
              {activeTab === 'adr' && <AdrShippingView />}
              {activeTab === 'reports' && <ReportsView />}
              {activeTab === 'kimyager' && <KimyagerAiView />}
              {activeTab === 'settings' && <SettingsView />}
            </main>
          </div>
        </div>

        {/* Mobile Sticky Navigation */}
        <MobileNav
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          criticalStockCount={criticalStockCount}
        />

        {/* Global Command Search Palette (Cmd+K) */}
        <SearchCommandDialog
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={handleSelectTab}
        />

        {/* Notification Center Modal */}
        <NotificationCenter
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onNavigate={handleSelectTab}
        />
      </div>
    </ErrorBoundary>
  );
}
