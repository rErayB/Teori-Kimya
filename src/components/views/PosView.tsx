import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingCart,
  Barcode,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Users,
  Search,
  CheckCircle2,
  Printer,
  X,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Product, PaymentMethod, Customer, Sale } from '../../types';
import { repository } from '../../services/storage';

export interface PosViewProps {
  onOpenScanner?: () => void;
}

export const PosView: React.FC<PosViewProps> = ({ onOpenScanner }) => {
  const [products, setProducts] = useState<Product[]>(repository.getProducts());
  const [customers, setCustomers] = useState<Customer[]>(repository.getCustomers());
  const company = repository.getCompany();

  // Cart state
  const [cart, setCart] = useState<
    {
      product: Product;
      quantity: number;
      unitPrice: number;
      discountRate: number;
    }[]
  >([]);

  const [barcodeInput, setBarcodeInput] = useState('');
  const [inputQuantity, setInputQuantity] = useState<number>(1);
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Hepsi');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [saleNotes, setSaleNotes] = useState('');

  // Execution states
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Sync products on repository updates
  useEffect(() => {
    const unsub = repository.subscribe(() => {
      setProducts(repository.getProducts());
      setCustomers(repository.getCustomers());
    });
    return unsub;
  }, []);

  // Handle barcode scanning or manual barcode submission
  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    const matchedProduct = repository.getProductByBarcode(code);
    if (matchedProduct) {
      addToCart(matchedProduct, inputQuantity);
      setBarcodeInput('');
      setInputQuantity(1);
      setErrorMessage(null);
    } else {
      setErrorMessage(`"${code}" barkoduna sahip ürün sistemde bulunamadı.`);
    }
  };

  // Add product to cart with custom quantity support
  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    setErrorMessage(null);
    const qty = Math.max(1, quantityToAdd);

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const item = prev[existingIndex];
        const nextQty = item.quantity + qty;
        if (nextQty > product.stock) {
          setErrorMessage(`Yetersiz stok! "${product.name}" için mevcut stok: ${product.stock} ${product.unit}`);
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = { ...item, quantity: nextQty };
        return updated;
      } else {
        if (product.stock < 1) {
          setErrorMessage(`"${product.name}" tükenmiş! Stokta bulunmuyor.`);
          return prev;
        }
        if (qty > product.stock) {
          setErrorMessage(`Yetersiz stok! "${product.name}" için mevcut stok: ${product.stock} ${product.unit}`);
          return prev;
        }
        return [
          ...prev,
          {
            product,
            quantity: qty,
            unitPrice: product.salePrice,
            discountRate: product.discountRate || 0,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setErrorMessage(null);
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.product.stock) {
              setErrorMessage(`Yetersiz stok! "${item.product.name}" için mevcut stok: ${item.product.stock}`);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const setExactQuantity = (productId: string, qty: number) => {
    setErrorMessage(null);
    setCart((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId) {
          const clamped = Math.max(1, qty);
          if (clamped > item.product.stock) {
            setErrorMessage(`Yetersiz stok! "${item.product.name}" için mevcut stok: ${item.product.stock} ${item.product.unit}`);
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity: clamped };
        }
        return item;
      });
    });
  };

  const updateDiscount = (productId: string, discount: number) => {
    const validDiscount = Math.max(0, Math.min(100, discount));
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, discountRate: validDiscount } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setErrorMessage(null);
  };

  // Calculations
  let subTotal = 0;
  let vatTotal = 0;
  let discountTotal = 0;

  cart.forEach((item) => {
    const base = item.unitPrice * item.quantity;
    const disc = base * (item.discountRate / 100);
    const discounted = base - disc;
    const vat = discounted * (item.product.vatRate / 100);

    subTotal += discounted;
    vatTotal += vat;
    discountTotal += disc;
  });

  const grandTotal = subTotal + vatTotal;

  // Selected customer info
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerName = selectedCustomer ? selectedCustomer.companyName : 'Perakende Müşteri';

  // Complete Sale Execution (with anti-double click protection)
  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      setErrorMessage('Sepette ürün bulunmuyor.');
      return;
    }

    if (paymentMethod === 'open_account' && !selectedCustomerId) {
      setErrorMessage('Açık Hesap (Cari) satışı için kayıtlı bir müşteri seçmelisiniz.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = repository.createSale({
        customerId: selectedCustomerId || undefined,
        customerName,
        paymentMethod,
        items: cart.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discountRate: i.discountRate,
        })),
        notes: saleNotes,
        cashierName: company.contactPerson,
      });

      if (!result.success || !result.sale) {
        setErrorMessage(result.error || 'Satış kaydedilemedi!');
        return;
      }

      setCompletedSale(result.sale);
      setShowInvoiceModal(true);
      clearCart();
      setSelectedCustomerId('');
      setSaleNotes('');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Beklenmedik bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered product catalog for POS
  const categories = ['Hepsi', ...new Set(products.map((p) => p.category))];
  const filteredProducts = products.filter((p) => {
    if (!p.active) return false;
    const matchCat = selectedCategory === 'Hepsi' || p.category === selectedCategory;
    const q = searchProductQuery.toLowerCase();
    const matchQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.barcode.includes(q);
    return matchCat && matchQuery;
  });

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-4 animate-in fade-in duration-200">
      {/* Left side: Product catalog & quick selection */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Search & Barcode & Quick Quantity Bar */}
        <div className="p-3 rounded-2xl bg-[#0B1B2E] border border-cyan-500/20 shadow-md flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Barcode scanner input */}
          <form onSubmit={handleBarcodeSubmit} className="flex-1 relative flex items-center min-w-[200px]">
            <Barcode className="w-5 h-5 text-cyan-400 absolute left-3 pointer-events-none" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Barkod okutun veya yazıp Enter'a basın..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full bg-[#102A43] border border-cyan-500/30 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </form>

          {/* Quick Quantity Input Multiplier */}
          <div className="flex items-center gap-1 bg-[#102A43] border border-cyan-500/30 rounded-xl px-2 py-1 shrink-0">
            <span className="text-[11px] text-cyan-300 font-bold">Miktar:</span>
            <button
              type="button"
              onClick={() => setInputQuantity((q) => Math.max(1, q - 1))}
              className="w-6 h-6 rounded bg-slate-800 text-slate-200 hover:text-white flex items-center justify-center font-black text-xs cursor-pointer"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={inputQuantity}
              onChange={(e) => setInputQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 bg-transparent text-center text-white font-black text-xs focus:outline-none"
              title="Eklemek istediğiniz miktarı klavyeden yazın"
            />
            <button
              type="button"
              onClick={() => setInputQuantity((q) => q + 1)}
              className="w-6 h-6 rounded bg-slate-800 text-slate-200 hover:text-white flex items-center justify-center font-black text-xs cursor-pointer"
            >
              +
            </button>

            {/* Quick preset buttons */}
            <div className="hidden sm:flex items-center gap-1 border-l border-slate-700 pl-1.5 ml-0.5">
              {[5, 10, 25].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setInputQuantity(preset)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    inputQuantity === preset
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Product text search filter */}
          <div className="w-full sm:w-44 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="İsimle filtrele..."
              value={searchProductQuery}
              onChange={(e) => setSearchProductQuery(e.target.value)}
              className="w-full bg-[#102A43]/60 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white font-semibold shadow-sm'
                  : 'bg-[#0B1B2E] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 p-1">
          {filteredProducts.map((prod) => {
            const isOutOfStock = prod.stock <= 0;
            return (
              <div
                key={prod.id}
                onClick={() => {
                  if (!isOutOfStock) {
                    addToCart(prod, inputQuantity);
                    setInputQuantity(1);
                  }
                }}
                className={`p-3 rounded-2xl bg-[#0B1B2E] border transition-all flex flex-col justify-between select-none ${
                  isOutOfStock
                    ? 'opacity-40 border-slate-800 cursor-not-allowed'
                    : 'border-cyan-500/20 hover:border-cyan-400/60 hover:-translate-y-0.5 cursor-pointer shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono text-cyan-300 font-bold">{prod.code}</span>
                    <Badge
                      variant={
                        prod.stock <= 0
                          ? 'danger'
                          : prod.stock <= prod.minStock
                          ? 'warning'
                          : 'success'
                      }
                      size="sm"
                    >
                      {prod.stock} {prod.unit}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                    {prod.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">{prod.category}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-cyan-300">
                      {prod.salePrice.toLocaleString('tr-TR')} ₺
                    </span>
                    <span className="text-[9px] text-slate-400 block">+%{prod.vatRate} KDV</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                    {inputQuantity > 1 ? `+${inputQuantity} Ekle` : 'Ekle'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side: Shopping Cart & Checkout Terminal */}
      <div className="w-full lg:w-96 flex flex-col rounded-2xl bg-[#0B1B2E] border border-cyan-500/25 shadow-2xl overflow-hidden shrink-0">
        {/* Cart Header */}
        <div className="p-3.5 bg-gradient-to-r from-[#0B1B2E] via-[#102A43] to-[#0B1B2E] border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-sm text-white">Satış Terminali</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} Ürün
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Temizle</span>
            </button>
          )}
        </div>

        {/* Customer Select dropdown */}
        <div className="p-3 border-b border-slate-800/80 bg-[#07111F]/50">
          <div className="flex items-center gap-2 text-xs">
            <Users className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-[#102A43] border border-cyan-500/25 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="">Perakende Müşteri (Açık Hesap Dışı)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} (Borç: {c.balance.toLocaleString('tr-TR')} ₺)
                </option>
              ))}
            </select>
          </div>
          {selectedCustomer && (
            <div className="mt-2 p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px] flex justify-between">
              <span className="text-slate-300">Mevcut Bakiye:</span>
              <span className="font-bold text-amber-400">{selectedCustomer.balance.toLocaleString('tr-TR')} ₺</span>
            </div>
          )}
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="m-3 p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="flex-1">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-800/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400 space-y-2">
              <ShoppingCart className="w-10 h-10 text-slate-600 stroke-[1.5]" />
              <p className="text-xs">Sepet boş. Barkod okutun veya sol menüden ürün seçin.</p>
            </div>
          ) : (
            cart.map((item) => {
              const lineBase = item.unitPrice * item.quantity;
              const lineDisc = lineBase * (item.discountRate / 100);
              const lineDiscounted = lineBase - lineDisc;
              const lineVat = lineDiscounted * (item.product.vatRate / 100);
              const lineTotal = lineDiscounted + lineVat;
              const unitProfit = item.unitPrice - item.product.purchasePrice;

              return (
                <div key={item.product.id} className="pt-2.5 pb-1 first:pt-0 space-y-1.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Birim Fiyat: {item.unitPrice.toLocaleString('tr-TR')} ₺ / {item.product.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-cyan-300 text-sm">
                        {lineTotal.toLocaleString('tr-TR')} ₺
                      </span>
                      <p className="text-[9px] text-emerald-400 font-medium">
                        Kâr: +{(item.quantity * unitProfit).toLocaleString('tr-TR')} ₺
                      </p>
                    </div>
                  </div>

                  {/* Quantity manual input & buttons & Discount row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-0.5 bg-[#102A43] border border-cyan-500/30 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700 font-black cursor-pointer"
                          title="1 Azalt"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.product.stock}
                          value={item.quantity}
                          onChange={(e) => setExactQuantity(item.product.id, parseInt(e.target.value) || 1)}
                          className="w-12 bg-transparent text-center font-black text-white text-xs py-0.5 focus:outline-none"
                          title="Klavyeden miktar yazabilirsiniz"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700 font-black cursor-pointer"
                          title="1 Artır"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Quick preset increments */}
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, 5)}
                        className="px-1.5 py-1 rounded bg-[#102A43] hover:bg-cyan-900/50 border border-slate-700 text-cyan-300 font-mono text-[10px] cursor-pointer"
                        title="+5 Adet Ekle"
                      >
                        +5
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, 10)}
                        className="px-1.5 py-1 rounded bg-[#102A43] hover:bg-cyan-900/50 border border-slate-700 text-cyan-300 font-mono text-[10px] cursor-pointer"
                        title="+10 Adet Ekle"
                      >
                        +10
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <span>İsk%:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountRate}
                          onChange={(e) => updateDiscount(item.product.id, parseFloat(e.target.value) || 0)}
                          className="w-10 bg-[#102A43] border border-slate-700 rounded px-1 py-0.5 text-white text-center text-xs"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Sepetten Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Line total summary calculation text */}
                  <div className="text-[10px] text-slate-400 font-mono bg-slate-900/60 px-2 py-0.5 rounded flex items-center justify-between">
                    <span>
                      {item.quantity} {item.product.unit} × {item.unitPrice.toLocaleString('tr-TR')} ₺
                    </span>
                    <span className="font-bold text-slate-300">
                      Toplam: {lineTotal.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Totals & Payment Selection Footer */}
        <div className="p-3.5 border-t border-cyan-500/20 bg-[#07111F] space-y-3">
          {/* Subtotal, Tax & Total */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Ara Toplam:</span>
              <span>{subTotal.toLocaleString('tr-TR')} ₺</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Toplam İskonto:</span>
                <span>-{discountTotal.toLocaleString('tr-TR')} ₺</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>KDV (%20):</span>
              <span>{vatTotal.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between items-center text-base font-black text-white pt-1.5 border-t border-slate-800">
              <span className="text-cyan-300">GENEL TOPLAM:</span>
              <span className="text-xl font-black text-[#8DE7F2]">
                {grandTotal.toLocaleString('tr-TR')} ₺
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                paymentMethod === 'cash'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                  : 'bg-[#102A43]/50 border-slate-700 text-slate-300 hover:bg-[#102A43]'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Nakit</span>
            </button>
            <button
              onClick={() => setPaymentMethod('credit_card')}
              className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                paymentMethod === 'credit_card'
                  ? 'bg-cyan-600/20 border-cyan-400 text-cyan-300 shadow-sm'
                  : 'bg-[#102A43]/50 border-slate-700 text-slate-300 hover:bg-[#102A43]'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Kredi Kartı</span>
            </button>
            <button
              onClick={() => setPaymentMethod('open_account')}
              className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                paymentMethod === 'open_account'
                  ? 'bg-amber-600/20 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-[#102A43]/50 border-slate-700 text-slate-300 hover:bg-[#102A43]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Açık Hesap</span>
            </button>
          </div>

          {/* Checkout Button */}
          <Button
            size="lg"
            variant="primary"
            className="w-full font-black text-sm"
            onClick={handleCompleteSale}
            isLoading={isProcessing}
            disabled={cart.length === 0 || isProcessing}
            icon={<CheckCircle2 className="w-5 h-5" />}
          >
            SATIŞI TAMAMLA & BELGE OLUŞTUR
          </Button>
        </div>
      </div>

      {/* Sale Complete Modal & Printable Invoice Draft */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Satış Tamamlandı"
        subtitle={completedSale ? `${completedSale.invoiceNo} nolu satış faturası başarıyla oluşturuldu` : ''}
        maxWidth="2xl"
      >
        {completedSale && (
          <div className="space-y-4">
            {/* Invoice Print Template Preview */}
            <div id="printable-invoice" className="p-5 rounded-xl bg-white text-slate-900 shadow-md space-y-4 font-sans text-xs">
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-3 border-slate-300">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-wide">TEORİ KİMYA</h2>
                  <p className="text-[11px] text-slate-600 font-semibold">{company.subtitle}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{company.address}</p>
                  <p className="text-[10px] text-slate-500">
                    Tel: {company.phone} | E-posta: {company.email}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {company.taxOffice} - V.No: {company.taxNumber}
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-mono font-bold rounded">
                    SATIŞ BİLGİ FİŞİ
                  </span>
                  <p className="font-mono font-bold text-sm text-slate-800 mt-2">
                    {completedSale.invoiceNo}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Tarih: {new Date(completedSale.date).toLocaleString('tr-TR')}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Ödeme: {completedSale.paymentMethod === 'open_account' ? 'Açık Hesap (Cari)' : completedSale.paymentMethod === 'credit_card' ? 'Kredi Kartı' : 'Nakit'}
                  </p>
                </div>
              </div>

              {/* Customer */}
              <div className="p-2.5 bg-slate-100 rounded-lg">
                <p className="text-[10px] font-bold text-slate-500 uppercase">MÜŞTERİ BİLGİSİ</p>
                <p className="font-bold text-slate-900 text-sm">{completedSale.customerName}</p>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-[10px] uppercase font-bold text-slate-600">
                    <th className="py-1.5">Ürün</th>
                    <th className="py-1.5 text-center">Birim</th>
                    <th className="py-1.5 text-center">Miktar</th>
                    <th className="py-1.5 text-right">Fiyat</th>
                    <th className="py-1.5 text-right">KDV</th>
                    <th className="py-1.5 text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {completedSale.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 font-medium">{it.productName}</td>
                      <td className="py-1.5 text-center">{it.unit}</td>
                      <td className="py-1.5 text-center font-bold">{it.quantity}</td>
                      <td className="py-1.5 text-right">{it.unitPrice.toLocaleString('tr-TR')} ₺</td>
                      <td className="py-1.5 text-right">%{it.vatRate}</td>
                      <td className="py-1.5 text-right font-bold">{it.lineTotal.toLocaleString('tr-TR')} ₺</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-slate-300 pt-2 flex justify-end">
                <div className="w-48 space-y-1 text-right text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Ara Toplam:</span>
                    <span>{completedSale.subTotal.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>KDV Tutarı:</span>
                    <span>{completedSale.vatTotal.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 border-t pt-1">
                    <span>Genel Toplam:</span>
                    <span>{completedSale.grandTotal.toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="pt-2 text-[9px] text-slate-400 text-center border-t border-slate-200">
                * Bu belge işletme içi bilgi fişidir. Resmi e-Fatura / e-Arşiv faturanız GİB entegrasyonu üzerinden ayrıca iletilecektir.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => window.print()}
                icon={<Printer className="w-4 h-4" />}
              >
                Yazdır / PDF
              </Button>
              <Button onClick={() => setShowInvoiceModal(false)}>
                Tamam
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
