import {
  CompanyInfo,
  Product,
  StockMovement,
  Sale,
  Order,
  Customer,
  Supplier,
  RawMaterial,
  Recipe,
  ProductionOrder,
  AppNotification,
  UserRole,
  PaymentMethod,
  OrderStatus,
} from '../types';

export const INITIAL_COMPANY: CompanyInfo = {
  name: 'TEORİ KİMYA',
  subtitle: 'Endüstriyel & Kurumsal Temizlik Ürünleri',
  contactPerson: 'MEHMET BOZKURT',
  title: 'Satış Danışmanı',
  phone: '+90 544 214 5940',
  email: 'mehmetbozkurt43100@gmail.com',
  address: 'Alipaşa Mh. Cumhuriyet Cd. Avcılar İşhanı No: 32/143 KÜTAHYA',
  taxOffice: '30 Ağustos V.D.',
  taxNumber: '8390124810',
  tradeRegistryNo: '12849 / Kütahya',
  mersisNo: '0839012481000001',
  website: 'www.teorikimya.com.tr',
  bankAccount: 'Halkbank Kütahya Şubesi',
  iban: 'TR42 0001 2009 8430 0006 5001 22',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'TK-100 Ağır Kir & Yağ Sökücü Endüstriyel',
    code: 'TK-100',
    barcode: '8680001201015',
    brand: 'TEORİ KİMYA',
    category: 'Ağır Sanayi & Yağ Sökücüler',
    subCategory: 'Konsantre Alkali Yağ Çözücü',
    description: 'Fabrika, motor, zemin ve ağır sanayi yüzeylerindeki karbonlaşmış yağları zahmetsizce çözen süper konsantre kimyasal formül.',
    purchasePrice: 420.00,
    salePrice: 750.00,
    vatRate: 20,
    discountRate: 5,
    stock: 48,
    minStock: 15,
    unit: 'Bidon (20L)',
    profitAmount: 330.00,
    profitMargin: 44.0,
    active: true,
    unNumber: 'UN 1824',
    adrClass: 'Sınıf 8 Aşındırıcı Sıvı',
    packagingGroup: 'II',
    tunnelCode: 'E',
    phValue: '13.5 (Bazik)',
    density: '1.18 g/cm³',
    sdsAvailable: true,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-09-18T14:30:00.000Z',
  },
  {
    id: 'prod-2',
    name: 'TK-200 Cilalı Fırçasız Oto Yıkama Köpüğü',
    code: 'TK-200',
    barcode: '8680001201022',
    brand: 'TEORİ KİMYA',
    category: 'Oto Bakım & Yıkama',
    subCategory: 'Aktif Köpüklü Şampuan',
    description: 'Fırça ve sünger kullanmadan araç boyasına parlaklık kazandıran, çamur ve yol filmini söken yüksek polimer katkılı oto yıkama kimyasalı.',
    purchasePrice: 380.00,
    salePrice: 690.00,
    vatRate: 20,
    discountRate: 0,
    stock: 34,
    minStock: 12,
    unit: 'Bidon (20L)',
    profitAmount: 310.00,
    profitMargin: 44.9,
    active: true,
    unNumber: 'UN-ADR Muaf',
    adrClass: 'Tehlikesiz',
    phValue: '11.0 (Alkali)',
    density: '1.08 g/cm³',
    sdsAvailable: true,
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-09-20T11:00:00.000Z',
  },
  {
    id: 'prod-3',
    name: 'TK-300 Endüstriyel Zemin Otomat Deterjanı',
    code: 'TK-300',
    barcode: '8680001201039',
    brand: 'TEORİ KİMYA',
    category: 'Endüstriyel Zemin & Yüzey',
    subCategory: 'Köpüğü Ayarlı Otomat Kimyasalı',
    description: 'Epoksi, seramik ve helikopter beton zemin temizleme makineleri için köpüğü kontrollü, iz bırakmayan derinlemesine temizleyici.',
    purchasePrice: 310.00,
    salePrice: 580.00,
    vatRate: 20,
    discountRate: 10,
    stock: 8, // Kritik Stok Seviyesi!
    minStock: 15,
    unit: 'Bidon (20L)',
    profitAmount: 270.00,
    profitMargin: 46.5,
    active: true,
    unNumber: 'UN-ADR Muaf',
    adrClass: 'Tehlikesiz',
    phValue: '9.5',
    density: '1.05 g/cm³',
    sdsAvailable: true,
    createdAt: '2026-01-15T11:00:00.000Z',
    updatedAt: '2026-09-22T16:00:00.000Z',
  },
  {
    id: 'prod-4',
    name: 'TK-400 Kireç ve Pas Çözücü Ağır Asidik',
    code: 'TK-400',
    barcode: '8680001201046',
    brand: 'TEORİ KİMYA',
    category: 'Özel Kimyasallar',
    subCategory: 'Konsantre Kireç Çözücü',
    description: 'Isı eşanjörleri, kazanlar, inşaat sonrası harç kalıntıları ve ağır kireç tabakalarını hızla nötralize eden inhibitörlü asit formülasyonu.',
    purchasePrice: 460.00,
    salePrice: 820.00,
    vatRate: 20,
    discountRate: 0,
    stock: 22,
    minStock: 10,
    unit: 'Bidon (20L)',
    profitAmount: 360.00,
    profitMargin: 43.9,
    active: true,
    unNumber: 'UN 1805',
    adrClass: 'Sınıf 8 Fosforik Asit',
    packagingGroup: 'III',
    tunnelCode: 'E',
    phValue: '1.2 (Kuvvetli Asit)',
    density: '1.24 g/cm³',
    sdsAvailable: true,
    createdAt: '2026-02-01T08:00:00.000Z',
    updatedAt: '2026-09-15T09:00:00.000Z',
  },
  {
    id: 'prod-5',
    name: 'TK-500 Klor Bazlı Yoğun Hijyenik Temizleyici',
    code: 'TK-500',
    barcode: '8680001201053',
    brand: 'TEORİ KİMYA',
    category: 'Genel Temizlik & Hijyen',
    subCategory: 'Klorlu Ağartıcı ve Dezenfektan',
    description: 'Gıda işletmeleri, hastaneler ve ıslak hacimler için yüksek stabiliteye sahip aktif klorlu kıvamlı hijyen sıvısı.',
    purchasePrice: 280.00,
    salePrice: 520.00,
    vatRate: 20,
    discountRate: 5,
    stock: 5, // Kritik Stok!
    minStock: 20,
    unit: 'Bidon (20L)',
    profitAmount: 240.00,
    profitMargin: 46.1,
    active: true,
    unNumber: 'UN 1791',
    adrClass: 'Sınıf 8 Hipoklorit Çözeltisi',
    packagingGroup: 'II',
    tunnelCode: 'E',
    phValue: '12.5',
    density: '1.14 g/cm³',
    sdsAvailable: true,
    createdAt: '2026-02-10T12:00:00.000Z',
    updatedAt: '2026-09-21T18:00:00.000Z',
  },
  {
    id: 'prod-6',
    name: 'TK-600 Köpüklü Motor & Parça Yıkama Sıvısı',
    code: 'TK-600',
    barcode: '8680001201060',
    brand: 'TEORİ KİMYA',
    category: 'Oto Bakım & Yıkama',
    subCategory: 'Solventsiz Motor Temizleyici',
    description: 'Kauçuk, alüminyum ve plastik aksamlara zarar vermeden motor bloklarındaki gres ve yanmış yağ tortularını çözer.',
    purchasePrice: 340.00,
    salePrice: 620.00,
    vatRate: 20,
    discountRate: 0,
    stock: 28,
    minStock: 10,
    unit: 'Bidon (20L)',
    profitAmount: 280.00,
    profitMargin: 45.1,
    active: true,
    unNumber: 'UN-ADR Muaf',
    adrClass: 'Tehlikesiz',
    phValue: '10.5',
    density: '1.04 g/cm³',
    sdsAvailable: true,
    createdAt: '2026-02-15T15:00:00.000Z',
    updatedAt: '2026-09-19T13:00:00.000Z',
  },
  {
    id: 'prod-7',
    name: 'TK-700 Sanayi Tipi Bulaşık Makinesi Sıvı Deterjanı',
    code: 'TK-700',
    barcode: '8680001201077',
    brand: 'TEORİ KİMYA',
    category: 'Gıda Hijyeni & Mutfak',
    subCategory: 'Alkali Bulaşık Deterjanı',
    description: 'Endüstriyel dozajlama pompalarıyla kullanılan, porselen ve cam eşyaları çizmeden lekesiz yıkayan özel alkali formül.',
    purchasePrice: 490.00,
    salePrice: 890.00,
    vatRate: 20,
    discountRate: 0,
    stock: 19,
    minStock: 10,
    unit: 'Bidon (20L)',
    profitAmount: 400.00,
    profitMargin: 44.9,
    active: true,
    unNumber: 'UN 1824',
    adrClass: 'Sınıf 8 Aşındırıcı',
    packagingGroup: 'II',
    tunnelCode: 'E',
    phValue: '13.0',
    density: '1.25 g/cm³',
    sdsAvailable: true,
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-09-17T11:00:00.000Z',
  },
  {
    id: 'prod-8',
    name: 'TK-800 Endüstriyel Bulaşık Makinesi Parlatıcısı',
    code: 'TK-800',
    barcode: '8680001201084',
    brand: 'TEORİ KİMYA',
    category: 'Gıda Hijyeni & Mutfak',
    subCategory: 'Nötrleştirici Parlatıcı',
    description: 'Su damlacıklarının yüzey tutunmasını kırarak bulaşıkların hızla ve lekesiz kurumasını sağlayan durulama ajanı.',
    purchasePrice: 410.00,
    salePrice: 760.00,
    vatRate: 20,
    discountRate: 0,
    stock: 16,
    minStock: 8,
    unit: 'Bidon (20L)',
    profitAmount: 350.00,
    profitMargin: 46.0,
    active: true,
    unNumber: 'UN-ADR Muaf',
    adrClass: 'Tehlikesiz',
    phValue: '3.0 (Hafif Asidik)',
    density: '1.02 g/cm³',
    sdsAvailable: true,
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-09-16T15:00:00.000Z',
  },
  {
    id: 'prod-9',
    name: 'TK-900 Sedefli Sıvı El Sabunu Gliserinli',
    code: 'TK-900',
    barcode: '8680001201091',
    brand: 'TEORİ KİMYA',
    category: 'Genel Temizlik & Hijyen',
    subCategory: 'Kurumsal Cilt Temizleyici',
    description: 'Cildi kurutmayan nemlendirici gliserin katkılı, bol köpüklü, fabrikalar ve kurumsal binalar için ekonomik el yıkama sıvısı.',
    purchasePrice: 220.00,
    salePrice: 420.00,
    vatRate: 20,
    discountRate: 5,
    stock: 42,
    minStock: 15,
    unit: 'Bidon (20L)',
    profitAmount: 200.00,
    profitMargin: 47.6,
    active: true,
    unNumber: 'UN-ADR Muaf',
    adrClass: 'Tehlikesiz',
    phValue: '5.5 (Cilt Uyumlu)',
    density: '1.03 g/cm³',
    sdsAvailable: true,
    createdAt: '2026-03-05T08:00:00.000Z',
    updatedAt: '2026-09-22T09:00:00.000Z',
  },
  {
    id: 'prod-10',
    name: 'TK-ALC 70° Alkol Bazlı Hızlı Yüzey Dezenfektanı',
    code: 'TK-ALC',
    barcode: '8680001201107',
    brand: 'TEORİ KİMYA',
    category: 'Dezenfektan & Biyosidal',
    subCategory: 'Durulama Gerektirmeyen Hijyen',
    description: 'Gıda temas yüzeyleri ve ekipmanlar için durulama gerektirmeyen, 30 saniyede geniş antimikrobiyal etki gösteren alkollü solüsyon.',
    purchasePrice: 510.00,
    salePrice: 950.00,
    vatRate: 20,
    discountRate: 0,
    stock: 2, // Kritik Stok!
    minStock: 10,
    unit: 'Bidon (20L)',
    profitAmount: 440.00,
    profitMargin: 46.3,
    active: true,
    unNumber: 'UN 1170',
    adrClass: 'Sınıf 3 Alevlenir Sıvı',
    packagingGroup: 'II',
    tunnelCode: 'D/E',
    phValue: '7.0 (Nötr)',
    density: '0.88 g/cm³',
    sdsAvailable: true,
    createdAt: '2026-03-10T14:00:00.000Z',
    updatedAt: '2026-09-22T17:00:00.000Z',
  },
];

export const INITIAL_RAW_MATERIALS: RawMaterial[] = [
  {
    id: 'raw-1',
    name: 'LABSA (Lineer Alkil Benzen Sülfonik Asit %96)',
    casNumber: '27176-87-0',
    code: 'RM-LABSA',
    supplierName: 'Akkim Kimya Sanayi A.Ş.',
    purity: '%96.0',
    unit: 'Kg',
    quantity: 3450,
    minQuantity: 1000,
    storageConditions: 'Kapalı orijinal ambalajında, 15-25°C kuru ve güneş almayan alanda.',
    temperature: '15-25 °C',
    ventilation: 'Mekanik havalandırmalı kimyasal depo',
    adrClass: 'Sınıf 8 Aşındırıcı',
    unNumber: 'UN 2586',
    packagingGroup: 'III',
    costPerUnit: 68.50,
    notes: 'Ana anyonik yüzey aktif madde',
  },
  {
    id: 'raw-2',
    name: 'Sıvı Kostik (Sodyum Hidroksit %48)',
    casNumber: '1310-73-2',
    code: 'RM-NAOH',
    supplierName: 'Koruma Klor Alkali A.Ş.',
    purity: '%48.0',
    unit: 'Kg',
    quantity: 4200,
    minQuantity: 1500,
    storageConditions: 'Asitlerden uzak, korozyona dayanıklı tank veya IBC depolama.',
    temperature: '18-30 °C',
    ventilation: 'Sürekli taze hava sirkülasyonu',
    adrClass: 'Sınıf 8 Aşındırıcı',
    unNumber: 'UN 1824',
    packagingGroup: 'II',
    costPerUnit: 24.20,
    notes: 'Alkali pH düzenleyici ve sabunlaştırma ajanı',
  },
  {
    id: 'raw-3',
    name: 'SLES (Sodyum Lauril Eter Sülfat %70)',
    casNumber: '68891-38-3',
    code: 'RM-SLES',
    supplierName: 'Akkim Kimya Sanayi A.Ş.',
    purity: '%70.0',
    unit: 'Kg',
    quantity: 2800,
    minQuantity: 800,
    storageConditions: 'Donmaya karşı korunaklı, 20-30°C aralığında tutulmalıdır.',
    temperature: '20-30 °C',
    ventilation: 'Standart endüstriyel havalandırma',
    adrClass: 'Tehlikesiz',
    costPerUnit: 52.00,
    notes: 'Yüksek köpük oluşturucu deterjan hammaddesi',
  },
  {
    id: 'raw-4',
    name: 'Fosforik Asit (%85 Teknik Saflık)',
    casNumber: '7664-38-2',
    code: 'RM-H3PO4',
    supplierName: 'Sodaş Sodyum Sanayii A.Ş.',
    purity: '%85.0',
    unit: 'Kg',
    quantity: 1600,
    minQuantity: 600,
    storageConditions: 'Alkalilerden, siyanürlerden ve metallerden uzakta depolanmalıdır.',
    temperature: '10-25 °C',
    ventilation: 'Asit buharı emiş tertibatlı depo',
    adrClass: 'Sınıf 8 Aşındırıcı',
    unNumber: 'UN 1805',
    packagingGroup: 'III',
    costPerUnit: 64.00,
    notes: 'Kireç ve pas sökücü formüller için ana asit',
  },
  {
    id: 'raw-5',
    name: 'Sodyum Hipoklorit (%15 Sıvı Klor)',
    casNumber: '7681-52-9',
    code: 'RM-NACL-O',
    supplierName: 'Koruma Klor Alkali A.Ş.',
    purity: '%15.0 Aktif Klor',
    unit: 'Kg',
    quantity: 2100,
    minQuantity: 1000,
    storageConditions: 'Isı ve ışıktan tamamen izole edilmiş, havalandırmalı serin alan.',
    temperature: '10-20 °C',
    ventilation: 'Özel cebri klor havalandırma',
    adrClass: 'Sınıf 8 Hipoklorit Çözeltisi',
    unNumber: 'UN 1791',
    packagingGroup: 'II',
    costPerUnit: 14.80,
    notes: 'Dezenfektan ve ağartıcı ana bileşen',
  },
  {
    id: 'raw-6',
    name: 'Korozyon İnhibitörü & Pas Önleyici Katkı',
    casNumber: '64665-57-2',
    code: 'RM-INHIB',
    supplierName: 'Akkim Kimya Sanayi A.Ş.',
    purity: '%99.0',
    unit: 'Kg',
    quantity: 340,
    minQuantity: 100,
    storageConditions: 'Kuru ve oda sıcaklığında orijinal ambalajında.',
    temperature: '15-25 °C',
    ventilation: 'Genel',
    costPerUnit: 185.00,
    notes: 'Metal yüzeyleri asit ve baz saldırısına karşı korur',
  },
  {
    id: 'raw-7',
    name: 'Betain (Kokamidopropil Betain %30)',
    casNumber: '61789-40-0',
    code: 'RM-BETAIN',
    supplierName: 'Akkim Kimya Sanayi A.Ş.',
    purity: '%30.0',
    unit: 'Kg',
    quantity: 1450,
    minQuantity: 500,
    storageConditions: 'Donmaya karşı korumalı, serin kuru oda.',
    temperature: '15-25 °C',
    ventilation: 'Standart',
    costPerUnit: 39.50,
    notes: 'Köpük stabilizatörü ve viskozite artırıcı amfoterik ajan',
  },
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    name: 'TK-100 Ağır Kir & Yağ Sökücü Formülasyonu',
    targetProductId: 'prod-1',
    targetProductName: 'TK-100 Ağır Kir & Yağ Sökücü Endüstriyel',
    batchYield: 1000,
    unit: 'Litre',
    ingredients: [
      { rawMaterialId: 'raw-2', rawMaterialName: 'Sıvı Kostik (%48)', percentage: 18 },
      { rawMaterialId: 'raw-1', rawMaterialName: 'LABSA (%96)', percentage: 12 },
      { rawMaterialId: 'raw-6', rawMaterialName: 'Korozyon İnhibitörü', percentage: 2 },
      { rawMaterialId: 'raw-3', rawMaterialName: 'SLES (%70)', percentage: 5 },
    ],
    preparationSteps: [
      'Reaktöre toplam suyun %60\'ı alınır ve karıştırıcı 150 dev/dk hızda çalıştırılır.',
      'Sıvı Kostik yavaşça ilave edilerek ekzotermik reaksiyon sıcaklığı kontrol edilir (<45°C).',
      'LABSA kontrollü olarak nötralizasyon tankına beslenir, pH 13-13.5 dengesi gözetilir.',
      'Korozyon inhibitörü ve SLES homojenleşene dek 30 dakika mikserlenir.',
      'Kalan deiyonize su eklenerek nihai yoğunluk 1.18 g/cm³ test edilir ve numune alınır.',
    ],
    notes: 'Göz koruması ve kimyasal tulum zorunludur.',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'rec-2',
    name: 'TK-200 Cilalı Fırçasız Oto Köpük Formülü',
    targetProductId: 'prod-2',
    targetProductName: 'TK-200 Cilalı Fırçasız Oto Yıkama Köpüğü',
    batchYield: 1000,
    unit: 'Litre',
    ingredients: [
      { rawMaterialId: 'raw-3', rawMaterialName: 'SLES (%70)', percentage: 15 },
      { rawMaterialId: 'raw-7', rawMaterialName: 'Betain (%30)', percentage: 8 },
      { rawMaterialId: 'raw-1', rawMaterialName: 'LABSA (%96)', percentage: 6 },
      { rawMaterialId: 'raw-2', rawMaterialName: 'Sıvı Kostik (%48)', percentage: 4 },
    ],
    preparationSteps: [
      'Tank içine yumuşatılmış su alınır.',
      'SLES ve Betain homojen çözünene kadar köpürtülmeden düşük devirde karıştırılır.',
      'Önceden nötralize edilmiş LABSA karışımı ilave edilir.',
      'Polimerik cila ve parlatıcı katkı maddeleri eklenir.',
      'pH 11.0 kontrol edilerek filtre edilir.',
    ],
    notes: 'Köpük oluşumunu engellemek için dipten emişli karıştırma tercih edilir.',
    createdAt: '2026-02-05T14:00:00.000Z',
  },
  {
    id: 'rec-3',
    name: 'TK-400 Ağır Kireç ve Pas Sökücü Asit Formülü',
    targetProductId: 'prod-4',
    targetProductName: 'TK-400 Kireç ve Pas Çözücü Ağır Asidik',
    batchYield: 1000,
    unit: 'Litre',
    ingredients: [
      { rawMaterialId: 'raw-4', rawMaterialName: 'Fosforik Asit (%85)', percentage: 40 },
      { rawMaterialId: 'raw-6', rawMaterialName: 'Korozyon İnhibitörü', percentage: 4 },
    ],
    preparationSteps: [
      'Asit dayanımlı HDPE reaktöre saf su alınır.',
      'Fosforik Asit çok yavaş debiyle suya eklenir (ASLA asitin üzerine su eklenmez!).',
      'Korozyon inhibitörü ilave edilerek metal korozyon koruması sağlanır.',
      'Gereken yüzey aktif eklenerek 45 dakika sirküle edilir.',
      'pH 1.2 ve yoğunluk 1.24 g/cm³ ölçümü doğrulanır.',
    ],
    notes: 'ADR Sınıf 8 kapsamında reaktör sahasında tam asit koruma maskesi kullanılır.',
    createdAt: '2026-02-15T09:00:00.000Z',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    companyName: 'Kütahya Porselen Sanayi A.Ş.',
    contactPerson: 'Serdar Yılmaz (Satınalma Müdürü)',
    phone: '+90 274 225 0000',
    email: 'satinalma@kutahyaporselen.com.tr',
    taxOffice: '30 Ağustos V.D.',
    taxNumber: '6020019284',
    address: 'Atatürk Bulvarı No: 124 Organize Sanayi Bölgesi KÜTAHYA',
    city: 'Kütahya',
    riskLimit: 150000,
    balance: 42500, // 42,500 TL açık hesap alacağımız
    notes: 'Kurumsal fabrika temizliği ve kalıp temizleme kimyasalları düzenli alıcısı.',
    lastTransactionDate: '2026-09-20T14:20:00.000Z',
    createdAt: '2026-01-05T08:00:00.000Z',
    transactions: [
      {
        id: 'ctx-1',
        date: '2026-09-10T11:00:00.000Z',
        type: 'sale',
        amount: 25000,
        description: 'Fatura: FAT-2026-0042 (20L Zemin & Yağ Sökücü)',
        documentNo: 'FAT-2026-0042',
        balanceAfter: 67500,
      },
      {
        id: 'ctx-2',
        date: '2026-09-18T15:30:00.000Z',
        type: 'payment',
        amount: 25000,
        description: 'Banka Havalesi Tahsilatı',
        documentNo: 'DEK-88192',
        balanceAfter: 42500,
      },
    ],
  },
  {
    id: 'cust-2',
    companyName: 'Dumlupınar Lojistik & Filo Hizmetleri Ltd.',
    contactPerson: 'Kemal Erdem',
    phone: '+90 532 411 9080',
    email: 'filo@dumlupinarlojistik.com',
    taxOffice: 'Kütahya V.D.',
    taxNumber: '3150821945',
    address: 'Eskişehir Yolu 12. Km Kamyon Garajı İçi KÜTAHYA',
    city: 'Kütahya',
    riskLimit: 50000,
    balance: 18200,
    notes: 'Tır yıkama şampuanı TK-200 ve motor temizleyici düzenli alıyor.',
    lastTransactionDate: '2026-09-21T10:15:00.000Z',
    createdAt: '2026-01-15T09:00:00.000Z',
    transactions: [
      {
        id: 'ctx-3',
        date: '2026-09-21T10:15:00.000Z',
        type: 'sale',
        amount: 18200,
        description: 'Fatura: FAT-2026-0049 (TK-200 20L 28 Adet)',
        documentNo: 'FAT-2026-0049',
        balanceAfter: 18200,
      },
    ],
  },
  {
    id: 'cust-3',
    companyName: 'Ege Mermer & Madencilik İşletmeleri A.Ş.',
    contactPerson: 'Murat Çelik',
    phone: '+90 274 614 2030',
    email: 'muhasebe@egemermer.com.tr',
    taxOffice: 'Tavşanlı V.D.',
    taxNumber: '3280014819',
    address: 'Madenler Mevkii Tavşanlı / KÜTAHYA',
    city: 'Kütahya',
    riskLimit: 100000,
    balance: 65000,
    notes: 'Ağır iş makineleri motor ve gres temizliği için TK-100 sipariş veriyor.',
    lastTransactionDate: '2026-09-15T16:00:00.000Z',
    createdAt: '2026-02-01T11:00:00.000Z',
    transactions: [
      {
        id: 'ctx-4',
        date: '2026-09-15T16:00:00.000Z',
        type: 'sale',
        amount: 65000,
        description: 'Fatura: FAT-2026-0045 (TK-100 & Kireç Çözücü)',
        documentNo: 'FAT-2026-0045',
        balanceAfter: 65000,
      },
    ],
  },
  {
    id: 'cust-4',
    companyName: 'Çinili Termal Otel & Spa Resort',
    contactPerson: 'Elif Şimşek (Satınalma)',
    phone: '+90 274 245 1122',
    email: 'satinalma@ciniliotel.com',
    taxOffice: '30 Ağustos V.D.',
    taxNumber: '2540918231',
    address: 'Yoncalı Termal Bölgesi KÜTAHYA',
    city: 'Kütahya',
    riskLimit: 30000,
    balance: 9400,
    notes: 'Otel havuz hijyeni, TK-500 klor ve sedefli sıvı sabun alıcısı.',
    lastTransactionDate: '2026-09-19T13:40:00.000Z',
    createdAt: '2026-02-20T10:00:00.000Z',
    transactions: [],
  },
  {
    id: 'cust-5',
    companyName: 'Başak Toplu Yemek & Catering Sanayi',
    contactPerson: 'Cemalettin Demir',
    phone: '+90 542 319 7788',
    email: 'info@basakcatering.com',
    taxOffice: 'Kütahya V.D.',
    taxNumber: '1420593821',
    address: 'Sanayi Sitesi 4. Blok No: 18 KÜTAHYA',
    city: 'Kütahya',
    riskLimit: 40000,
    balance: 14800,
    notes: 'Bulaşık makinesi deterjanı TK-700 ve parlatıcı TK-800 kullanıyor.',
    lastTransactionDate: '2026-09-22T11:20:00.000Z',
    createdAt: '2026-03-01T09:00:00.000Z',
    transactions: [],
  },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    companyName: 'Akkim Kimya Sanayi ve Tic. A.Ş.',
    contactPerson: 'Bülent Aksoy',
    phone: '+90 226 815 3000',
    email: 'satis@akkim.com.tr',
    address: 'Yalova Suvermez Yolu Cad. No: 12 Yalova',
    productsSupplied: ['LABSA', 'SLES', 'Betain', 'İnhibitör'],
    balance: 112000,
    notes: 'Hammadde tedarikinde 30 gün vadeli çalışılıyor.',
  },
  {
    id: 'sup-2',
    companyName: 'Koruma Klor Alkali San. ve Tic. A.Ş.',
    contactPerson: 'Gökhan Yavuz',
    phone: '+90 262 239 2270',
    email: 'klor@koruma.com.tr',
    address: 'Deniz Mah. Petrol Cad. No: 43 Kocaeli',
    productsSupplied: ['Sıvı Kostik %48', 'Sodyum Hipoklorit %15', 'Tuz Ruhu'],
    balance: 78500,
    notes: 'ADR belgeli tanker teslimatları düzenli.',
  },
  {
    id: 'sup-3',
    companyName: 'Sodaş Sodyum Sanayii A.Ş.',
    contactPerson: 'Hakan Karaca',
    phone: '+90 232 464 1250',
    email: 'bilgi@sodas.com.tr',
    address: 'Atatürk Organize Sanayi Bölgesi İzmir',
    productsSupplied: ['Fosforik Asit', 'Sodyum Sülfat'],
    balance: 45000,
    notes: 'Asit sevkiyatlarında güvenlik raporları eksiksiz.',
  },
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    invoiceNo: 'FAT-2026-0051',
    date: '2026-09-23T08:30:00.000Z',
    customerId: 'cust-2',
    customerName: 'Dumlupınar Lojistik & Filo Hizmetleri Ltd.',
    paymentMethod: 'open_account',
    items: [
      {
        productId: 'prod-2',
        productName: 'TK-200 Cilalı Fırçasız Oto Yıkama Köpüğü',
        barcode: '8680001201022',
        unit: 'Bidon (20L)',
        quantity: 10,
        unitPrice: 690.00,
        discountRate: 0,
        vatRate: 20,
        lineTotal: 8280.00, // (690 * 10) * 1.20
        lineCost: 3800.00,
        lineProfit: 3100.00,
      },
      {
        productId: 'prod-6',
        productName: 'TK-600 Köpüklü Motor & Parça Yıkama Sıvısı',
        barcode: '8680001201060',
        unit: 'Bidon (20L)',
        quantity: 4,
        unitPrice: 620.00,
        discountRate: 0,
        vatRate: 20,
        lineTotal: 2976.00, // (620 * 4) * 1.20
        lineCost: 1360.00,
        lineProfit: 1120.00,
      }
    ],
    subTotal: 9380.00,
    vatTotal: 1876.00,
    discountTotal: 0,
    grandTotal: 11256.00,
    totalCost: 5160.00,
    totalProfit: 4220.00,
    status: 'completed',
    notes: 'Filo haftalık temizlik teslimatı',
    cashierName: 'Mehmet Bozkurt',
  },
  {
    id: 'sale-2',
    invoiceNo: 'FAT-2026-0050',
    date: '2026-09-22T15:10:00.000Z',
    customerId: 'cust-5',
    customerName: 'Başak Toplu Yemek & Catering Sanayi',
    paymentMethod: 'credit_card',
    items: [
      {
        productId: 'prod-7',
        productName: 'TK-700 Sanayi Tipi Bulaşık Makinesi Sıvı Deterjanı',
        barcode: '8680001201077',
        unit: 'Bidon (20L)',
        quantity: 5,
        unitPrice: 890.00,
        discountRate: 0,
        vatRate: 20,
        lineTotal: 5340.00,
        lineCost: 2450.00,
        lineProfit: 2000.00,
      },
      {
        productId: 'prod-8',
        productName: 'TK-800 Endüstriyel Bulaşık Makinesi Parlatıcısı',
        barcode: '8680001201084',
        unit: 'Bidon (20L)',
        quantity: 3,
        unitPrice: 760.00,
        discountRate: 0,
        vatRate: 20,
        lineTotal: 2736.00,
        lineCost: 1230.00,
        lineProfit: 1050.00,
      }
    ],
    subTotal: 6730.00,
    vatTotal: 1346.00,
    discountTotal: 0,
    grandTotal: 8076.00,
    totalCost: 3680.00,
    totalProfit: 3050.00,
    status: 'completed',
    notes: 'POS tahsilat yapıldı',
    cashierName: 'Mehmet Bozkurt',
  },
  {
    id: 'sale-3',
    invoiceNo: 'FAT-2026-0049',
    date: '2026-09-21T11:45:00.000Z',
    customerId: 'cust-1',
    customerName: 'Kütahya Porselen Sanayi A.Ş.',
    paymentMethod: 'open_account',
    items: [
      {
        productId: 'prod-1',
        productName: 'TK-100 Ağır Kir & Yağ Sökücü Endüstriyel',
        barcode: '8680001201015',
        unit: 'Bidon (20L)',
        quantity: 20,
        unitPrice: 750.00,
        discountRate: 5,
        vatRate: 20,
        lineTotal: 17100.00,
        lineCost: 8400.00,
        lineProfit: 5850.00,
      }
    ],
    subTotal: 14250.00,
    vatTotal: 2850.00,
    discountTotal: 750.00,
    grandTotal: 17100.00,
    totalCost: 8400.00,
    totalProfit: 5850.00,
    status: 'completed',
    notes: 'Kalıp bakım atölyesi teslimatı',
    cashierName: 'Mehmet Bozkurt',
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    orderNo: 'SIP-2026-0101',
    customerId: 'cust-1',
    customerName: 'Kütahya Porselen Sanayi A.Ş.',
    orderDate: '2026-09-22T09:00:00.000Z',
    deliveryDate: '2026-09-25T14:00:00.000Z',
    status: 'preparing',
    items: [
      {
        productId: 'prod-1',
        productName: 'TK-100 Ağır Kir & Yağ Sökücü Endüstriyel',
        quantity: 30,
        unit: 'Bidon (20L)',
        unitPrice: 750.00,
        discountRate: 5,
        vatRate: 20,
        lineTotal: 25650.00,
      },
      {
        productId: 'prod-3',
        productName: 'TK-300 Endüstriyel Zemin Otomat Deterjanı',
        quantity: 20,
        unit: 'Bidon (20L)',
        unitPrice: 580.00,
        discountRate: 10,
        vatRate: 20,
        lineTotal: 12528.00,
      }
    ],
    subTotal: 31815.00,
    vatTotal: 6363.00,
    totalAmount: 38178.00,
    deliveryAddress: 'Atatürk Bulvarı No: 124 OSB KÜTAHYA - Depo 2',
    notes: 'Forklift indirmeli teslimat talep ediliyor.',
    assignedStaff: 'Mehmet Bozkurt',
  },
  {
    id: 'ord-2',
    orderNo: 'SIP-2026-0102',
    customerId: 'cust-3',
    customerName: 'Ege Mermer & Madencilik İşletmeleri A.Ş.',
    orderDate: '2026-09-23T07:45:00.000Z',
    deliveryDate: '2026-09-26T10:00:00.000Z',
    status: 'pending',
    items: [
      {
        productId: 'prod-4',
        productName: 'TK-400 Kireç ve Pas Çözücü Ağır Asidik',
        quantity: 15,
        unit: 'Bidon (20L)',
        unitPrice: 820.00,
        discountRate: 0,
        vatRate: 20,
        lineTotal: 14760.00,
      }
    ],
    subTotal: 12300.00,
    vatTotal: 2460.00,
    totalAmount: 14760.00,
    deliveryAddress: 'Madenler Mevkii Tavşanlı / KÜTAHYA',
    notes: 'Kazan daireleri kireç temizliği için acil sevk isteniyor.',
    assignedStaff: 'Mehmet Bozkurt',
  },
  {
    id: 'ord-3',
    orderNo: 'SIP-2026-0103',
    customerId: 'cust-4',
    customerName: 'Çinili Termal Otel & Spa Resort',
    orderDate: '2026-09-21T14:30:00.000Z',
    deliveryDate: '2026-09-24T11:00:00.000Z',
    status: 'approved',
    items: [
      {
        productId: 'prod-5',
        productName: 'TK-500 Klor Bazlı Yoğun Hijyenik Temizleyici',
        quantity: 10,
        unit: 'Bidon (20L)',
        unitPrice: 520.00,
        discountRate: 5,
        vatRate: 20,
        lineTotal: 5928.00,
      },
      {
        productId: 'prod-9',
        productName: 'TK-900 Sedefli Sıvı El Sabunu Gliserinli',
        quantity: 15,
        unit: 'Bidon (20L)',
        unitPrice: 420.00,
        discountRate: 5,
        vatRate: 20,
        lineTotal: 7182.00,
      }
    ],
    subTotal: 10925.00,
    vatTotal: 2185.00,
    totalAmount: 13110.00,
    deliveryAddress: 'Yoncalı Termal Bölgesi KÜTAHYA',
    notes: 'Hafta sonu doluluğu öncesi teslim edilecek.',
    assignedStaff: 'Mehmet Bozkurt',
  }
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    productId: 'prod-1',
    productName: 'TK-100 Ağır Kir & Yağ Sökücü Endüstriyel',
    type: 'production_output',
    quantity: 50,
    unit: 'Bidon (20L)',
    previousStock: 18,
    newStock: 68,
    referenceId: 'BATCH-2026-081',
    notes: '1000L Reçete üretimi mamül dolumu tamamlandı.',
    performedBy: 'Üretim Operatörü',
    date: '2026-09-18T16:00:00.000Z',
  },
  {
    id: 'mov-2',
    productId: 'prod-1',
    productName: 'TK-100 Ağır Kir & Yağ Sökücü Endüstriyel',
    type: 'sale',
    quantity: -20,
    unit: 'Bidon (20L)',
    previousStock: 68,
    newStock: 48,
    referenceId: 'FAT-2026-0049',
    notes: 'Kütahya Porselen A.Ş. satışı',
    performedBy: 'Mehmet Bozkurt',
    date: '2026-09-21T11:45:00.000Z',
  },
  {
    id: 'mov-3',
    productId: 'prod-2',
    productName: 'TK-200 Cilalı Fırçasız Oto Yıkama Köpüğü',
    type: 'sale',
    quantity: -10,
    unit: 'Bidon (20L)',
    previousStock: 44,
    newStock: 34,
    referenceId: 'FAT-2026-0051',
    notes: 'Dumlupınar Lojistik sevkiyatı',
    performedBy: 'Mehmet Bozkurt',
    date: '2026-09-23T08:30:00.000Z',
  },
];

export const INITIAL_PRODUCTION_ORDERS: ProductionOrder[] = [
  {
    id: 'pord-1',
    batchNumber: 'BATCH-2026-081',
    recipeId: 'rec-1',
    recipeName: 'TK-100 Ağır Kir & Yağ Sökücü Formülasyonu',
    productId: 'prod-1',
    productName: 'TK-100 Ağır Kir & Yağ Sökücü Endüstriyel',
    plannedQuantity: 1000,
    actualQuantity: 1000,
    unit: 'Litre',
    status: 'completed',
    createdDate: '2026-09-18T09:00:00.000Z',
    completedDate: '2026-09-18T15:45:00.000Z',
    operator: 'Ahmet Usta (Baş Kimyager)',
    rawMaterialsConsumed: [
      { rawMaterialId: 'raw-2', rawMaterialName: 'Sıvı Kostik (%48)', quantity: 180, unit: 'Kg' },
      { rawMaterialId: 'raw-1', rawMaterialName: 'LABSA (%96)', quantity: 120, unit: 'Kg' },
      { rawMaterialId: 'raw-6', rawMaterialName: 'Korozyon İnhibitörü', quantity: 20, unit: 'Kg' },
      { rawMaterialId: 'raw-3', rawMaterialName: 'SLES (%70)', quantity: 50, unit: 'Kg' },
    ],
    notes: 'Parti kalite kontrol testleri başarılı. pH 13.4, yoğunluk 1.182.',
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Kritik Stok Uyarısı',
    message: 'TK-500 Klor Bazlı Temizleyici stok adedi kritik seviyede: 5 Bidon kaldı.',
    type: 'danger',
    date: '2026-09-23T07:15:00.000Z',
    read: false,
    linkTab: 'stock',
  },
  {
    id: 'notif-2',
    title: 'Kritik Stok Uyarısı',
    message: 'TK-ALC 70° Yüzey Dezenfektanı stok adedi: 2 Bidon kaldı. Üretim emri veriniz.',
    type: 'danger',
    date: '2026-09-23T07:20:00.000Z',
    read: false,
    linkTab: 'stock',
  },
  {
    id: 'notif-3',
    title: 'Yeni Sipariş Bekliyor',
    message: 'Ege Mermer A.Ş. tarafından 14.760 TL tutarında SIP-2026-0102 oluşturuldu.',
    type: 'info',
    date: '2026-09-23T07:45:00.000Z',
    read: false,
    linkTab: 'orders',
  },
  {
    id: 'notif-4',
    title: 'Başarılı Sevkiyat',
    message: 'Dumlupınar Lojistik için 11.256 TL tutarında FAT-2026-0051 satışı tamamlandı.',
    type: 'success',
    date: '2026-09-23T08:30:00.000Z',
    read: true,
    linkTab: 'invoices',
  },
];

// LocalStorage Keys
const KEYS = {
  COMPANY: 'teori_kimya_company_v2',
  PRODUCTS: 'teori_kimya_products_v2',
  RAW_MATERIALS: 'teori_kimya_raw_materials_v2',
  RECIPES: 'teori_kimya_recipes_v2',
  CUSTOMERS: 'teori_kimya_customers_v2',
  SUPPLIERS: 'teori_kimya_suppliers_v2',
  SALES: 'teori_kimya_sales_v2',
  ORDERS: 'teori_kimya_orders_v2',
  MOVEMENTS: 'teori_kimya_movements_v2',
  PRODUCTIONS: 'teori_kimya_productions_v2',
  NOTIFICATIONS: 'teori_kimya_notifications_v2',
  ACTIVE_ROLE: 'teori_kimya_role_v2',
};

// Safe JSON loader
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

// Data Store / Repository class
export class TeoriKimyaRepository {
  private company: CompanyInfo;
  private products: Product[];
  private rawMaterials: RawMaterial[];
  private recipes: Recipe[];
  private customers: Customer[];
  private suppliers: Supplier[];
  private sales: Sale[];
  private orders: Order[];
  private movements: StockMovement[];
  private productions: ProductionOrder[];
  private notifications: AppNotification[];
  private currentRole: UserRole;
  private listeners: (() => void)[] = [];

  constructor() {
    this.company = loadFromStorage(KEYS.COMPANY, INITIAL_COMPANY);
    this.products = loadFromStorage(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    this.rawMaterials = loadFromStorage(KEYS.RAW_MATERIALS, INITIAL_RAW_MATERIALS);
    this.recipes = loadFromStorage(KEYS.RECIPES, INITIAL_RECIPES);
    this.customers = loadFromStorage(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    this.suppliers = loadFromStorage(KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    this.sales = loadFromStorage(KEYS.SALES, INITIAL_SALES);
    this.orders = loadFromStorage(KEYS.ORDERS, INITIAL_ORDERS);
    this.movements = loadFromStorage(KEYS.MOVEMENTS, INITIAL_STOCK_MOVEMENTS);
    this.productions = loadFromStorage(KEYS.PRODUCTIONS, INITIAL_PRODUCTION_ORDERS);
    this.notifications = loadFromStorage(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.currentRole = loadFromStorage<UserRole>(KEYS.ACTIVE_ROLE, 'admin');
  }

  // Subscribe to changes
  subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Error in store listener:', err);
      }
    });
  }

  // Role
  getRole(): UserRole {
    return this.currentRole;
  }

  setRole(role: UserRole) {
    this.currentRole = role;
    saveToStorage(KEYS.ACTIVE_ROLE, role);
    this.notify();
  }

  // Company
  getCompany(): CompanyInfo {
    return this.company;
  }

  updateCompany(info: CompanyInfo) {
    this.company = info;
    saveToStorage(KEYS.COMPANY, info);
    this.notify();
  }

  // Products
  getProducts(): Product[] {
    return [...this.products];
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  getProductByBarcode(barcode: string): Product | undefined {
    const trimmed = barcode.trim();
    return this.products.find((p) => p.barcode.trim() === trimmed || p.code.trim().toLowerCase() === trimmed.toLowerCase());
  }

  addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'profitAmount' | 'profitMargin'>): { success: boolean; error?: string; product?: Product } {
    // Check barcode uniqueness
    const barcodeExists = this.products.some((p) => p.barcode.trim() === productData.barcode.trim());
    if (barcodeExists) {
      return { success: false, error: 'Bu barkod zaten kayıtlı! Lütfen farklı bir barkod giriniz.' };
    }

    const profitAmount = productData.salePrice - productData.purchasePrice;
    const profitMargin = productData.salePrice > 0 ? (profitAmount / productData.salePrice) * 100 : 0;
    const now = new Date().toISOString();

    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      profitAmount: Number(profitAmount.toFixed(2)),
      profitMargin: Number(profitMargin.toFixed(1)),
      createdAt: now,
      updatedAt: now,
    };

    this.products.unshift(newProduct);
    saveToStorage(KEYS.PRODUCTS, this.products);

    // Initial stock movement
    if (newProduct.stock > 0) {
      this.addStockMovement({
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'initial',
        quantity: newProduct.stock,
        unit: newProduct.unit,
        previousStock: 0,
        newStock: newProduct.stock,
        performedBy: this.company.contactPerson,
        notes: 'Ürün ilk kaydı ve stok girişi',
      });
    }

    this.notify();
    return { success: true, product: newProduct };
  }

  updateProduct(id: string, updates: Partial<Product>): { success: boolean; error?: string } {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return { success: false, error: 'Ürün bulunamadı!' };

    // If barcode is changing, verify unique
    if (updates.barcode) {
      const barcodeExists = this.products.some((p) => p.id !== id && p.barcode.trim() === updates.barcode!.trim());
      if (barcodeExists) {
        return { success: false, error: 'Bu barkod başka bir ürüne zaten kayıtlı!' };
      }
    }

    const current = this.products[index];
    const salePrice = updates.salePrice !== undefined ? updates.salePrice : current.salePrice;
    const purchasePrice = updates.purchasePrice !== undefined ? updates.purchasePrice : current.purchasePrice;
    const profitAmount = salePrice - purchasePrice;
    const profitMargin = salePrice > 0 ? (profitAmount / salePrice) * 100 : 0;

    this.products[index] = {
      ...current,
      ...updates,
      profitAmount: Number(profitAmount.toFixed(2)),
      profitMargin: Number(profitMargin.toFixed(1)),
      updatedAt: new Date().toISOString(),
    };

    saveToStorage(KEYS.PRODUCTS, this.products);
    this.notify();
    return { success: true };
  }

  deleteProduct(id: string): { success: boolean; error?: string } {
    const p = this.products.find((item) => item.id === id);
    if (!p) return { success: false, error: 'Ürün bulunamadı!' };

    // Check if sales exist
    const hasSales = this.sales.some((s) => s.items.some((i) => i.productId === id));
    if (hasSales) {
      // Soft deactivate instead of crash
      this.updateProduct(id, { active: false });
      return { success: true, error: 'Ürünün geçmiş satış kayıtları olduğu için silinmek yerine durumu PASİF yapıldı.' };
    }

    this.products = this.products.filter((item) => item.id !== id);
    saveToStorage(KEYS.PRODUCTS, this.products);
    this.notify();
    return { success: true };
  }

  // Stock Adjustments
  adjustStock(
    productId: string,
    delta: number,
    type: StockMovement['type'],
    notes: string,
    operator: string = 'Sistem Kullanıcısı'
  ): { success: boolean; error?: string } {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return { success: false, error: 'Ürün bulunamadı!' };

    const newStock = product.stock + delta;
    if (newStock < 0) {
      return { success: false, error: 'Yetersiz stok! Stok eksiye düşemez.' };
    }

    const previousStock = product.stock;
    product.stock = newStock;
    product.updatedAt = new Date().toISOString();
    saveToStorage(KEYS.PRODUCTS, this.products);

    this.addStockMovement({
      productId,
      productName: product.name,
      type,
      quantity: delta,
      unit: product.unit,
      previousStock,
      newStock,
      notes,
      performedBy: operator,
    });

    // Check critical stock
    if (newStock <= product.minStock) {
      this.addNotification({
        title: 'Kritik Stok Uyarısı',
        message: `${product.name} stok adedi (${newStock} ${product.unit}) kritik seviyenin altına indi!`,
        type: 'danger',
        linkTab: 'stock',
      });
    }

    this.notify();
    return { success: true };
  }

  // Stock Movements
  getStockMovements(): StockMovement[] {
    return [...this.movements];
  }

  private addStockMovement(data: Omit<StockMovement, 'id' | 'date'>) {
    const movement: StockMovement = {
      ...data,
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: new Date().toISOString(),
    };
    this.movements.unshift(movement);
    saveToStorage(KEYS.MOVEMENTS, this.movements);
  }

  // Sales & POS Execution
  createSale(params: {
    customerId?: string;
    customerName: string;
    paymentMethod: PaymentMethod;
    items: {
      productId: string;
      quantity: number;
      unitPrice: number;
      discountRate: number;
    }[];
    notes?: string;
    cashierName?: string;
  }): { success: boolean; error?: string; sale?: Sale } {
    if (params.items.length === 0) {
      return { success: false, error: 'Sepette ürün bulunmuyor!' };
    }

    // 1. Stock check for all items first
    for (const item of params.items) {
      const prod = this.getProductById(item.productId);
      if (!prod) {
        return { success: false, error: `Ürün sistemde bulunamadı (ID: ${item.productId})` };
      }
      if (prod.stock < item.quantity) {
        return {
          success: false,
          error: `Yetersiz stok: "${prod.name}" için mevcut stok: ${prod.stock} ${prod.unit}, talep edilen: ${item.quantity}`,
        };
      }
    }

    // 2. Compute lines, costs, totals
    let subTotal = 0;
    let vatTotal = 0;
    let discountTotal = 0;
    let totalCost = 0;
    let totalProfit = 0;

    const detailedItems = params.items.map((item) => {
      const prod = this.getProductById(item.productId)!;
      const baseLine = item.unitPrice * item.quantity;
      const discountAmount = baseLine * (item.discountRate / 100);
      const discountedLine = baseLine - discountAmount;
      const vatAmount = discountedLine * (prod.vatRate / 100);
      const lineTotal = discountedLine + vatAmount;

      const lineCost = prod.purchasePrice * item.quantity;
      const lineProfit = discountedLine - lineCost;

      subTotal += discountedLine;
      vatTotal += vatAmount;
      discountTotal += discountAmount;
      totalCost += lineCost;
      totalProfit += lineProfit;

      return {
        productId: prod.id,
        productName: prod.name,
        barcode: prod.barcode,
        unit: prod.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountRate: item.discountRate,
        vatRate: prod.vatRate,
        lineTotal: Number(lineTotal.toFixed(2)),
        lineCost: Number(lineCost.toFixed(2)),
        lineProfit: Number(lineProfit.toFixed(2)),
      };
    });

    const grandTotal = Number((subTotal + vatTotal).toFixed(2));
    const invoiceNo = `FAT-2026-${String(this.sales.length + 52).padStart(4, '0')}`;
    const saleId = `sale-${Date.now()}`;
    const now = new Date().toISOString();

    const sale: Sale = {
      id: saleId,
      invoiceNo,
      date: now,
      customerId: params.customerId,
      customerName: params.customerName || 'Perakende Müşteri',
      paymentMethod: params.paymentMethod,
      items: detailedItems,
      subTotal: Number(subTotal.toFixed(2)),
      vatTotal: Number(vatTotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2)),
      grandTotal,
      totalCost: Number(totalCost.toFixed(2)),
      totalProfit: Number(totalProfit.toFixed(2)),
      status: 'completed',
      notes: params.notes,
      cashierName: params.cashierName || this.company.contactPerson,
    };

    // 3. Atomically update stocks and log movements
    for (const item of detailedItems) {
      const prod = this.getProductById(item.productId)!;
      const prevStock = prod.stock;
      prod.stock -= item.quantity;
      prod.updatedAt = now;

      this.addStockMovement({
        productId: prod.id,
        productName: prod.name,
        type: 'sale',
        quantity: -item.quantity,
        unit: prod.unit,
        previousStock: prevStock,
        newStock: prod.stock,
        referenceId: invoiceNo,
        notes: `Satış Belgesi: ${invoiceNo} (${params.customerName})`,
        performedBy: sale.cashierName,
      });

      // Stock warning check
      if (prod.stock <= prod.minStock) {
        this.addNotification({
          title: 'Kritik Stok Uyarısı',
          message: `${prod.name} stok adedi (${prod.stock} ${prod.unit}) kritik eşiğin altına indi!`,
          type: 'danger',
          linkTab: 'stock',
        });
      }
    }
    saveToStorage(KEYS.PRODUCTS, this.products);

    // 4. Update customer balance if Open Account (Cari)
    if (params.paymentMethod === 'open_account' && params.customerId) {
      const customer = this.customers.find((c) => c.id === params.customerId);
      if (customer) {
        customer.balance += grandTotal;
        customer.lastTransactionDate = now;
        customer.transactions.unshift({
          id: `ctx-${Date.now()}`,
          date: now,
          type: 'sale',
          amount: grandTotal,
          description: `Fatura: ${invoiceNo} (Açık Hesap Satış)`,
          documentNo: invoiceNo,
          balanceAfter: customer.balance,
        });
        saveToStorage(KEYS.CUSTOMERS, this.customers);
      }
    }

    // 5. Store sale
    this.sales.unshift(sale);
    saveToStorage(KEYS.SALES, this.sales);

    this.addNotification({
      title: 'Satış Gerçekleşti',
      message: `${sale.customerName} için ${grandTotal.toLocaleString('tr-TR')} ₺ tutarında ${invoiceNo} oluşturuldu.`,
      type: 'success',
      linkTab: 'invoices',
    });

    this.notify();
    return { success: true, sale };
  }

  cancelSale(saleId: string): { success: boolean; error?: string } {
    const sale = this.sales.find((s) => s.id === saleId);
    if (!sale) return { success: false, error: 'Satış bulunamadı!' };
    if (sale.status === 'cancelled') return { success: false, error: 'Bu satış zaten iptal edilmiş.' };

    sale.status = 'cancelled';
    saveToStorage(KEYS.SALES, this.sales);

    // Reverse stocks
    for (const item of sale.items) {
      const prod = this.getProductById(item.productId);
      if (prod) {
        const prevStock = prod.stock;
        prod.stock += item.quantity;
        this.addStockMovement({
          productId: prod.id,
          productName: prod.name,
          type: 'sale_cancel',
          quantity: item.quantity,
          unit: prod.unit,
          previousStock: prevStock,
          newStock: prod.stock,
          referenceId: sale.invoiceNo,
          notes: `Satış İptali: ${sale.invoiceNo}`,
          performedBy: this.company.contactPerson,
        });
      }
    }
    saveToStorage(KEYS.PRODUCTS, this.products);

    // Reverse customer balance if open account
    if (sale.paymentMethod === 'open_account' && sale.customerId) {
      const customer = this.customers.find((c) => c.id === sale.customerId);
      if (customer) {
        customer.balance = Math.max(0, customer.balance - sale.grandTotal);
        customer.transactions.unshift({
          id: `ctx-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'return',
          amount: sale.grandTotal,
          description: `Satış İptali / İade: ${sale.invoiceNo}`,
          documentNo: sale.invoiceNo,
          balanceAfter: customer.balance,
        });
        saveToStorage(KEYS.CUSTOMERS, this.customers);
      }
    }

    this.addNotification({
      title: 'Satış İptal Edildi',
      message: `${sale.invoiceNo} numaralı satış faturası iptal edildi ve stoklar iade alındı.`,
      type: 'warning',
      linkTab: 'invoices',
    });

    this.notify();
    return { success: true };
  }

  getSales(): Sale[] {
    return [...this.sales];
  }

  // Customers (Cari Hesap)
  getCustomers(): Customer[] {
    return [...this.customers];
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customers.find((c) => c.id === id);
  }

  addCustomer(customerData: Omit<Customer, 'id' | 'balance' | 'transactions' | 'createdAt'>): { success: boolean; customer: Customer } {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      balance: 0,
      transactions: [],
      createdAt: new Date().toISOString(),
    };
    this.customers.unshift(newCustomer);
    saveToStorage(KEYS.CUSTOMERS, this.customers);
    this.notify();
    return { success: true, customer: newCustomer };
  }

  updateCustomer(id: string, updates: Partial<Customer>): { success: boolean; error?: string } {
    const index = this.customers.findIndex((c) => c.id === id);
    if (index === -1) return { success: false, error: 'Müşteri bulunamadı!' };

    this.customers[index] = { ...this.customers[index], ...updates };
    saveToStorage(KEYS.CUSTOMERS, this.customers);
    this.notify();
    return { success: true };
  }

  addCustomerPayment(customerId: string, amount: number, description: string, documentNo?: string): { success: boolean; error?: string } {
    const customer = this.customers.find((c) => c.id === customerId);
    if (!customer) return { success: false, error: 'Müşteri bulunamadı!' };
    if (amount <= 0) return { success: false, error: 'Ödeme tutarı 0\'dan büyük olmalıdır.' };

    const newBalance = Math.max(0, customer.balance - amount);
    customer.balance = newBalance;
    customer.lastTransactionDate = new Date().toISOString();

    customer.transactions.unshift({
      id: `ctx-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'payment',
      amount,
      description: description || 'Tahsilat / Ödeme Makbuzu',
      documentNo: documentNo || `MAK-${Date.now().toString().slice(-6)}`,
      balanceAfter: newBalance,
    });

    saveToStorage(KEYS.CUSTOMERS, this.customers);
    this.notify();
    return { success: true };
  }

  addCustomerDebt(customerId: string, amount: number, description: string, documentNo?: string): { success: boolean; error?: string } {
    const customer = this.customers.find((c) => c.id === customerId);
    if (!customer) return { success: false, error: 'Müşteri bulunamadı!' };
    if (amount <= 0) return { success: false, error: 'Tutar 0\'dan büyük olmalıdır.' };

    customer.balance += amount;
    customer.lastTransactionDate = new Date().toISOString();

    customer.transactions.unshift({
      id: `ctx-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'sale',
      amount,
      description: description || 'Manuel Borç Dekontu',
      documentNo: documentNo || `DEK-${Date.now().toString().slice(-6)}`,
      balanceAfter: customer.balance,
    });

    saveToStorage(KEYS.CUSTOMERS, this.customers);
    this.notify();
    return { success: true };
  }

  // Suppliers
  getSuppliers(): Supplier[] {
    return [...this.suppliers];
  }

  addSupplier(supplierData: Omit<Supplier, 'id'>): { success: boolean; supplier: Supplier } {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
    };
    this.suppliers.unshift(newSupplier);
    saveToStorage(KEYS.SUPPLIERS, this.suppliers);
    this.notify();
    return { success: true, supplier: newSupplier };
  }

  // Raw Materials
  getRawMaterials(): RawMaterial[] {
    return [...this.rawMaterials];
  }

  addRawMaterial(data: Omit<RawMaterial, 'id'>): { success: boolean; rawMaterial: RawMaterial } {
    const newMaterial: RawMaterial = {
      ...data,
      id: `raw-${Date.now()}`,
    };
    this.rawMaterials.unshift(newMaterial);
    saveToStorage(KEYS.RAW_MATERIALS, this.rawMaterials);
    this.notify();
    return { success: true, rawMaterial: newMaterial };
  }

  adjustRawMaterialStock(id: string, delta: number, notes?: string): { success: boolean; error?: string } {
    const rm = this.rawMaterials.find((r) => r.id === id);
    if (!rm) return { success: false, error: 'Hammadde bulunamadı!' };

    const newQty = rm.quantity + delta;
    if (newQty < 0) return { success: false, error: 'Hammadde stoku eksiye düşemez!' };

    rm.quantity = newQty;
    saveToStorage(KEYS.RAW_MATERIALS, this.rawMaterials);
    this.notify();
    return { success: true };
  }

  // Recipes & Production
  getRecipes(): Recipe[] {
    return [...this.recipes];
  }

  addRecipe(data: Omit<Recipe, 'id' | 'createdAt'>): { success: boolean; recipe: Recipe } {
    const newRecipe: Recipe = {
      ...data,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.recipes.unshift(newRecipe);
    saveToStorage(KEYS.RECIPES, this.recipes);
    this.notify();
    return { success: true, recipe: newRecipe };
  }

  getProductionOrders(): ProductionOrder[] {
    return [...this.productions];
  }

  executeProductionOrder(recipeId: string, plannedQuantity: number, operatorName: string): { success: boolean; error?: string; order?: ProductionOrder } {
    const recipe = this.recipes.find((r) => r.id === recipeId);
    if (!recipe) return { success: false, error: 'Reçete bulunamadı!' };
    if (plannedQuantity <= 0) return { success: false, error: 'Üretim miktarı 0\'dan büyük olmalıdır.' };

    const product = this.getProductById(recipe.targetProductId);
    if (!product) return { success: false, error: 'Hedef mamül ürün bulunamadı!' };

    // Calculate required raw materials based on formula
    // percentage: e.g. 18% means 0.18 * plannedQuantity
    const consumptionPlan: { rawMaterial: RawMaterial; requiredQty: number }[] = [];

    for (const ing of recipe.ingredients) {
      const rm = this.rawMaterials.find((r) => r.id === ing.rawMaterialId);
      if (!rm) {
        return { success: false, error: `Reçetedeki hammadde sistemde bulunamadı: ${ing.rawMaterialName}` };
      }
      const requiredQty = Number(((plannedQuantity * ing.percentage) / 100).toFixed(2));
      if (rm.quantity < requiredQty) {
        return {
          success: false,
          error: `Yetersiz hammadde stoku: "${rm.name}". Gereken: ${requiredQty} ${rm.unit}, Mevcut: ${rm.quantity} ${rm.unit}`,
        };
      }
      consumptionPlan.push({ rawMaterial: rm, requiredQty });
    }

    const batchNumber = `BATCH-2026-${String(this.productions.length + 82).padStart(3, '0')}`;
    const now = new Date().toISOString();

    // 1. Deduct raw materials
    for (const item of consumptionPlan) {
      item.rawMaterial.quantity -= item.requiredQty;
    }
    saveToStorage(KEYS.RAW_MATERIALS, this.rawMaterials);

    // 2. Increase target product stock
    // If target product is 20L drum, and recipe yield was in Litres, calculate number of packaging units
    // or direct addition based on unit
    let packageUnitsProduced = plannedQuantity;
    if (product.unit.includes('20L')) {
      packageUnitsProduced = Math.floor(plannedQuantity / 20);
    } else if (product.unit.includes('30L')) {
      packageUnitsProduced = Math.floor(plannedQuantity / 30);
    }

    const prevStock = product.stock;
    product.stock += packageUnitsProduced;
    product.updatedAt = now;
    saveToStorage(KEYS.PRODUCTS, this.products);

    // 3. Log stock movement for product
    this.addStockMovement({
      productId: product.id,
      productName: product.name,
      type: 'production_output',
      quantity: packageUnitsProduced,
      unit: product.unit,
      previousStock: prevStock,
      newStock: product.stock,
      referenceId: batchNumber,
      notes: `Reçeteli üretim tamamlandı: ${batchNumber} (${plannedQuantity} L şarjdan ${packageUnitsProduced} ${product.unit} dolum)`,
      performedBy: operatorName || 'Üretim Sorumlusu',
    });

    // 4. Create production record
    const pOrder: ProductionOrder = {
      id: `pord-${Date.now()}`,
      batchNumber,
      recipeId: recipe.id,
      recipeName: recipe.name,
      productId: product.id,
      productName: product.name,
      plannedQuantity,
      actualQuantity: plannedQuantity,
      unit: recipe.unit,
      status: 'completed',
      createdDate: now,
      completedDate: now,
      operator: operatorName || this.company.contactPerson,
      rawMaterialsConsumed: consumptionPlan.map((c) => ({
        rawMaterialId: c.rawMaterial.id,
        rawMaterialName: c.rawMaterial.name,
        quantity: c.requiredQty,
        unit: c.rawMaterial.unit,
      })),
      notes: `${batchNumber} nolu parti başarıyla reaktörden ambalaj hattına aktarıldı.`,
    };

    this.productions.unshift(pOrder);
    saveToStorage(KEYS.PRODUCTIONS, this.productions);

    this.addNotification({
      title: 'Üretim Tamamlandı',
      message: `${recipe.targetProductName} için ${batchNumber} partisi tamamlandı (+${packageUnitsProduced} ${product.unit} stok eklendi).`,
      type: 'success',
      linkTab: 'production',
    });

    this.notify();
    return { success: true, order: pOrder };
  }

  // Orders (B2B Siparişler)
  getOrders(): Order[] {
    return [...this.orders];
  }

  createOrder(data: {
    customerId: string;
    customerName: string;
    deliveryDate?: string;
    deliveryAddress: string;
    notes?: string;
    items: {
      productId: string;
      quantity: number;
      unitPrice: number;
      discountRate: number;
    }[];
  }): { success: boolean; error?: string; order?: Order } {
    if (data.items.length === 0) return { success: false, error: 'Sipariş için en az 1 ürün seçilmelidir.' };

    let subTotal = 0;
    let vatTotal = 0;

    const detailedItems = data.items.map((item) => {
      const prod = this.getProductById(item.productId)!;
      const baseLine = item.unitPrice * item.quantity;
      const discountAmount = baseLine * (item.discountRate / 100);
      const discountedLine = baseLine - discountAmount;
      const vatAmount = discountedLine * (prod.vatRate / 100);
      const lineTotal = discountedLine + vatAmount;

      subTotal += discountedLine;
      vatTotal += vatAmount;

      return {
        productId: prod.id,
        productName: prod.name,
        quantity: item.quantity,
        unit: prod.unit,
        unitPrice: item.unitPrice,
        discountRate: item.discountRate,
        vatRate: prod.vatRate,
        lineTotal: Number(lineTotal.toFixed(2)),
      };
    });

    const totalAmount = Number((subTotal + vatTotal).toFixed(2));
    const orderNo = `SIP-2026-${String(this.orders.length + 104).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNo,
      customerId: data.customerId,
      customerName: data.customerName,
      orderDate: now,
      deliveryDate: data.deliveryDate,
      status: 'pending',
      items: detailedItems,
      subTotal: Number(subTotal.toFixed(2)),
      vatTotal: Number(vatTotal.toFixed(2)),
      totalAmount,
      deliveryAddress: data.deliveryAddress,
      notes: data.notes,
      assignedStaff: this.company.contactPerson,
    };

    this.orders.unshift(newOrder);
    saveToStorage(KEYS.ORDERS, this.orders);

    this.addNotification({
      title: 'Yeni Sipariş Kaydedildi',
      message: `${newOrder.customerName} için ${totalAmount.toLocaleString('tr-TR')} ₺ tutarında ${orderNo} açıldı.`,
      type: 'info',
      linkTab: 'orders',
    });

    this.notify();
    return { success: true, order: newOrder };
  }

  generateOrderNo(): string {
    return `SIP-2026-${String(this.orders.length + 104).padStart(4, '0')}`;
  }

  addOrder(orderData: Partial<Order> & { customerId: string; customerName: string; items: any[] }): { success: boolean; order?: Order } {
    const orderNo = orderData.orderNo || this.generateOrderNo();
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNo,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      orderDate: orderData.orderDate || new Date().toISOString(),
      deliveryDate: orderData.deliveryDate,
      status: orderData.status || 'pending',
      items: orderData.items,
      subTotal: orderData.subTotal || orderData.totalAmount || 0,
      vatTotal: orderData.vatTotal || 0,
      totalAmount: orderData.totalAmount || 0,
      deliveryAddress: orderData.deliveryAddress || '',
      notes: orderData.notes,
      assignedStaff: this.company.contactPerson,
    };
    this.orders.unshift(newOrder);
    saveToStorage(KEYS.ORDERS, this.orders);
    this.notify();
    return { success: true, order: newOrder };
  }

  updateOrderStatus(orderId: string, status: OrderStatus): { success: boolean; error?: string } {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: 'Sipariş bulunamadı!' };

    order.status = status;
    saveToStorage(KEYS.ORDERS, this.orders);

    this.addNotification({
      title: 'Sipariş Durumu Güncellendi',
      message: `${order.orderNo} siparişi durumu "${status}" olarak güncellendi.`,
      type: 'info',
      linkTab: 'orders',
    });

    this.notify();
    return { success: true };
  }

  // Notifications
  getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  addNotification(notif: Omit<AppNotification, 'id' | 'date' | 'read'>) {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: new Date().toISOString(),
      read: false,
    };
    this.notifications.unshift(newNotif);
    if (this.notifications.length > 50) this.notifications.pop();
    saveToStorage(KEYS.NOTIFICATIONS, this.notifications);
  }

  markAllNotificationsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    saveToStorage(KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  // Dashboard Metrics Calculation from real records
  getDashboardMetrics(): {
    todayRevenue: number;
    monthRevenue: number;
    todaySalesCount: number;
    monthSalesCount: number;
    grossProfitMonth: number;
    profitMarginMonth: number;
    totalStockValue: number;
    criticalStockCount: number;
    totalReceivables: number;
    pendingOrdersCount: number;
  } {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7); // "2026-09"

    let todayRevenue = 0;
    let monthRevenue = 0;
    let todaySalesCount = 0;
    let monthSalesCount = 0;
    let grossProfitMonth = 0;

    for (const sale of this.sales) {
      if (sale.status === 'cancelled') continue;
      const saleDateStr = sale.date.split('T')[0];
      const saleMonthStr = saleDateStr.substring(0, 7);

      if (saleDateStr === todayStr) {
        todayRevenue += sale.grandTotal;
        todaySalesCount += 1;
      }

      if (saleMonthStr === currentMonthStr) {
        monthRevenue += sale.grandTotal;
        monthSalesCount += 1;
        grossProfitMonth += sale.totalProfit;
      }
    }

    const profitMarginMonth = monthRevenue > 0 ? (grossProfitMonth / monthRevenue) * 100 : 0;

    // Total Stock Value (At purchase cost)
    let totalStockValue = 0;
    let criticalStockCount = 0;

    for (const prod of this.products) {
      if (prod.active) {
        totalStockValue += prod.stock * prod.purchasePrice;
        if (prod.stock <= prod.minStock) {
          criticalStockCount += 1;
        }
      }
    }

    // Total Receivables (Cari Alacaklar)
    let totalReceivables = 0;
    for (const cust of this.customers) {
      if (cust.balance > 0) {
        totalReceivables += cust.balance;
      }
    }

    // Pending Orders
    const pendingOrdersCount = this.orders.filter(
      (o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'approved'
    ).length;

    return {
      todayRevenue: Number(todayRevenue.toFixed(2)),
      monthRevenue: Number(monthRevenue.toFixed(2)),
      todaySalesCount,
      monthSalesCount,
      grossProfitMonth: Number(grossProfitMonth.toFixed(2)),
      profitMarginMonth: Number(profitMarginMonth.toFixed(1)),
      totalStockValue: Number(totalStockValue.toFixed(2)),
      criticalStockCount,
      totalReceivables: Number(totalReceivables.toFixed(2)),
      pendingOrdersCount,
    };
  }

  // Reset to initial demo data
  resetAllData() {
    this.company = INITIAL_COMPANY;
    this.products = INITIAL_PRODUCTS;
    this.rawMaterials = INITIAL_RAW_MATERIALS;
    this.recipes = INITIAL_RECIPES;
    this.customers = INITIAL_CUSTOMERS;
    this.suppliers = INITIAL_SUPPLIERS;
    this.sales = INITIAL_SALES;
    this.orders = INITIAL_ORDERS;
    this.movements = INITIAL_STOCK_MOVEMENTS;
    this.productions = INITIAL_PRODUCTION_ORDERS;
    this.notifications = INITIAL_NOTIFICATIONS;

    saveToStorage(KEYS.COMPANY, this.company);
    saveToStorage(KEYS.PRODUCTS, this.products);
    saveToStorage(KEYS.RAW_MATERIALS, this.rawMaterials);
    saveToStorage(KEYS.RECIPES, this.recipes);
    saveToStorage(KEYS.CUSTOMERS, this.customers);
    saveToStorage(KEYS.SUPPLIERS, this.suppliers);
    saveToStorage(KEYS.SALES, this.sales);
    saveToStorage(KEYS.ORDERS, this.orders);
    saveToStorage(KEYS.MOVEMENTS, this.movements);
    saveToStorage(KEYS.PRODUCTIONS, this.productions);
    saveToStorage(KEYS.NOTIFICATIONS, this.notifications);

    this.notify();
  }

  // Barcode generator
  generateBarcode(prefix: string = '868000'): string {
    const random = Math.floor(100000 + Math.random() * 900000).toString();
    const codeWithoutCheck = `${prefix}${random}`;
    let sum = 0;
    for (let i = 0; i < codeWithoutCheck.length; i++) {
      const digit = parseInt(codeWithoutCheck[i], 10);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return `${codeWithoutCheck}${checkDigit}`;
  }

  // Import DB from JSON
  importDatabaseJson(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products && Array.isArray(data.products)) {
        this.products = data.products;
        saveToStorage(KEYS.PRODUCTS, this.products);
      }
      if (data.company) {
        this.company = data.company;
        saveToStorage(KEYS.COMPANY, this.company);
      }
      if (data.rawMaterials && Array.isArray(data.rawMaterials)) {
        this.rawMaterials = data.rawMaterials;
        saveToStorage(KEYS.RAW_MATERIALS, this.rawMaterials);
      }
      if (data.recipes && Array.isArray(data.recipes)) {
        this.recipes = data.recipes;
        saveToStorage(KEYS.RECIPES, this.recipes);
      }
      if (data.customers && Array.isArray(data.customers)) {
        this.customers = data.customers;
        saveToStorage(KEYS.CUSTOMERS, this.customers);
      }
      if (data.suppliers && Array.isArray(data.suppliers)) {
        this.suppliers = data.suppliers;
        saveToStorage(KEYS.SUPPLIERS, this.suppliers);
      }
      if (data.sales && Array.isArray(data.sales)) {
        this.sales = data.sales;
        saveToStorage(KEYS.SALES, this.sales);
      }
      if (data.orders && Array.isArray(data.orders)) {
        this.orders = data.orders;
        saveToStorage(KEYS.ORDERS, this.orders);
      }
      if (data.movements && Array.isArray(data.movements)) {
        this.movements = data.movements;
        saveToStorage(KEYS.MOVEMENTS, this.movements);
      }
      if (data.productions && Array.isArray(data.productions)) {
        this.productions = data.productions;
        saveToStorage(KEYS.PRODUCTIONS, this.productions);
      }
      this.notify();
      return true;
    } catch (e) {
      console.error('Failed to import database JSON:', e);
      return false;
    }
  }

  // Export entire DB as JSON
  exportDatabaseJson(): string {
    return JSON.stringify(
      {
        company: this.company,
        products: this.products,
        rawMaterials: this.rawMaterials,
        recipes: this.recipes,
        customers: this.customers,
        suppliers: this.suppliers,
        sales: this.sales,
        orders: this.orders,
        movements: this.movements,
        productions: this.productions,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }
}

// Singleton repository instance
export const repository = new TeoriKimyaRepository();
