export type UserRole = 'admin' | 'authorized' | 'sales' | 'warehouse' | 'customer';

export interface CompanyInfo {
  name: string;
  subtitle: string;
  contactPerson: string;
  title: string;
  phone: string;
  email: string;
  address: string;
  taxOffice: string;
  taxNumber: string;
  tradeRegistryNo: string;
  mersisNo: string;
  website: string;
  bankAccount: string;
  iban: string;
}

export type ProductCategory = 
  | 'Oto Bakım & Yıkama'
  | 'Endüstriyel Zemin & Yüzey'
  | 'Gıda Hijyeni & Mutfak'
  | 'Çamaşırhane & Tekstil'
  | 'Ağır Sanayi & Yağ Sökücüler'
  | 'Genel Temizlik & Hijyen'
  | 'Dezenfektan & Biyosidal'
  | 'Özel Kimyasallar';

export type ProductUnit = 'Litre' | 'Kg' | 'Bidon (20L)' | 'Bidon (30L)' | 'Koli' | 'Adet' | 'Varil (200L)' | 'IBC Tank (1000L)';

export interface Product {
  id: string;
  name: string;
  code: string;
  barcode: string;
  brand: string;
  category: ProductCategory;
  subCategory?: string;
  description: string;
  image?: string;
  purchasePrice: number; // Alış fiyatı
  salePrice: number;     // Satış fiyatı
  vatRate: number;       // KDV % (örn: 20)
  discountRate: number;  // İskonto %
  stock: number;         // Mevcut stok
  minStock: number;      // Kritik stok eşiği
  unit: ProductUnit;
  profitAmount: number;  // Kâr tutarı
  profitMargin: number;  // Kâr marjı %
  active: boolean;
  unNumber?: string;     // UN Kodu (Örn: UN 1791)
  adrClass?: string;     // ADR Sınıfı (Örn: Sınıf 8 Aşındırıcı)
  packagingGroup?: string; // Ambalaj Grubu (II, III)
  tunnelCode?: string;   // Tünel Kodu (E)
  phValue?: string;      // pH değeri
  density?: string;      // Yoğunluk g/cm3
  shelfLocation?: string; // Raf lokasyonu
  sdsAvailable?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = 
  | 'initial'             // İlk stok
  | 'purchase_entry'      // Satın alma / Stok girişi
  | 'sale'                // Satış
  | 'sale_cancel'         // Satış iptali
  | 'manual_increase'     // Manuel stok artırma
  | 'manual_decrease'     // Manuel stok azaltma
  | 'production_use'      // Üretimde hammadde kullanımı
  | 'production_output'   // Üretimden mamül girişi
  | 'waste'               // Fire / Hasar
  | 'return';             // İade

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  unit: string;
  previousStock: number;
  newStock: number;
  referenceId?: string; // Fatura no, Sipariş no, Üretim batch no
  notes?: string;
  performedBy: string;
  date: string;
}

export type PaymentMethod = 'cash' | 'credit_card' | 'open_account' | 'bank_transfer';

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  vatRate: number;
  lineTotal: number;
  lineCost: number;
  lineProfit: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  customerId?: string;
  customerName: string;
  paymentMethod: PaymentMethod;
  items: {
    productId: string;
    productName: string;
    barcode: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    discountRate: number;
    vatRate: number;
    lineTotal: number;
    lineCost: number;
    lineProfit: number;
  }[];
  subTotal: number;
  vatTotal: number;
  discountTotal: number;
  grandTotal: number;
  totalCost: number;
  totalProfit: number;
  status: 'completed' | 'cancelled';
  notes?: string;
  cashierName: string;
}

export interface Purchase {
  id: string;
  purchaseNo: string;
  date: string;
  productId: string;
  productName: string;
  productBarcode?: string;
  supplierId?: string;
  supplierName: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  invoiceNo?: string;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paymentMethod: 'cash' | 'bank_transfer' | 'term_account';
  notes?: string;
  receivedBy: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Kira'
  | 'Maaş'
  | 'Elektrik'
  | 'Su'
  | 'Doğalgaz'
  | 'İnternet'
  | 'Telefon'
  | 'Araç'
  | 'Yakıt'
  | 'Kargo'
  | 'Nakliye'
  | 'Reklam'
  | 'Vergi'
  | 'Muhasebe'
  | 'Bakım'
  | 'Personel'
  | 'Ofis giderleri'
  | 'Diğer'
  | string;

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer';
  recipientOrCompany?: string;
  documentNo?: string;
  notes?: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  fullName: string;
  role: string;
  phone: string;
  monthlySalary: number;
  paymentDay: number;
  active: boolean;
  notes?: string;
}

export interface SalaryPayment {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  month: string; // '2026-09'
  salaryAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: 'cash' | 'bank_transfer';
  notes?: string;
  createdAt: string;
}

export interface ProductReturn {
  id: string;
  returnNo: string;
  date: string;
  customerId?: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  refundAmount: number;
  reason: string;
  returnToStock: boolean;
  notes?: string;
  createdAt: string;
}

export interface SupplierTransaction {
  id: string;
  date: string;
  type: 'purchase' | 'payment' | 'adjustment';
  amount: number;
  description: string;
  documentNo?: string;
  balanceAfter: number;
}

export type OrderStatus = 'draft' | 'pending' | 'approved' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: ProductUnit;
  unitPrice: number;
  discountRate: number;
  vatRate: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  deliveryDate?: string;
  status: OrderStatus;
  items: OrderItem[];
  subTotal: number;
  vatTotal: number;
  totalAmount: number;
  deliveryAddress: string;
  notes?: string;
  assignedStaff?: string;
}

export interface CustomerTransaction {
  id: string;
  date: string;
  type: 'sale' | 'payment' | 'adjustment' | 'return' | 'invoice' | 'manual_debt';
  amount: number; // Tutar
  description: string;
  documentNo?: string;
  balanceAfter: number;
}

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  taxOffice: string;
  taxNumber: string;
  address: string;
  city: string;
  riskLimit: number;
  creditLimit?: number;
  balance: number; // Müşteri borcu (Pozitif: Alacağımız var)
  notes?: string;
  lastTransactionDate?: string;
  transactions: CustomerTransaction[];
  createdAt: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  category?: string;
  productsSupplied: string[];
  paymentTerms?: string;
  balance: number; // Tedarikçiye borcumuz
  currentBalance?: number;
  active?: boolean;
  notes?: string;
  transactions?: SupplierTransaction[];
}

export interface RawMaterial {
  id: string;
  name: string;
  casNumber: string;
  code: string;
  supplierId?: string;
  supplierName?: string;
  purity: string; // %99.5
  unit: 'Kg' | 'Litre';
  quantity: number;
  minQuantity: number;
  storageConditions: string;
  temperature: string; // "15-25 °C"
  ventilation: string; // "İyi havalandırılan kuru ortam"
  adrClass?: string;
  unNumber?: string;
  packagingGroup?: string;
  costPerUnit: number;
  notes?: string;
}

export interface RecipeIngredient {
  rawMaterialId: string;
  rawMaterialName: string;
  percentage: number; // % oran (toplam 100 olmalı)
}

export interface Recipe {
  id: string;
  name: string;
  targetProductId: string;
  targetProductName: string;
  batchYield: number; // Standart parti miktarı (örn: 1000 L)
  unit: ProductUnit;
  ingredients: RecipeIngredient[];
  preparationSteps: string[];
  notes?: string;
  createdAt: string;
}

export interface ProductionOrder {
  id: string;
  batchNumber: string;
  recipeId: string;
  recipeName: string;
  productId: string;
  productName: string;
  plannedQuantity: number;
  actualQuantity?: number;
  producedQuantity?: number;
  totalCost?: number;
  unit: ProductUnit;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  createdDate: string;
  startDate?: string;
  completedDate?: string;
  operator: string;
  operatorName?: string;
  rawMaterialsConsumed: {
    rawMaterialId: string;
    rawMaterialName: string;
    quantity: number;
    unit: string;
  }[];
  notes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  date: string;
  read: boolean;
  linkTab?: string;
}

export interface DashboardMetrics {
  todayRevenue: number;
  monthRevenue: number;
  todaySalesCount: number;
  monthSalesCount: number;
  totalCostMonth: number;
  grossProfitMonth: number;
  totalExpensesMonth: number;
  netProfitMonth: number;
  profitMarginMonth: number;
  totalStockValue: number;
  criticalStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalReceivables: number;
  totalPayables: number;
  pendingOrdersCount: number;
  paymentBreakdown: {
    cash: number;
    creditCard: number;
    openAccount: number;
    bankTransfer: number;
  };
}
