export interface CompanySettings {
  companyName: string;
  ownerName: string;
  businessType: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  gstNo: string;
  panNo: string;
  logo: string; // dataURL
  bankName: string;
  branchName: string;
  accountHolderName: string;
  bankAcNo: string;
  ifscCode: string;
  accountType: string;
  upiId: string;
}

export interface Product {
  id: string;
  name: string;
  hsnCode: string;
  unit: string;
  rate: number;
  gstPercent: number;
  stock: number;
  lowStockThreshold: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gstNo: string;
  state: string;
}

export interface InvoiceItem {
  id: string;
  productName: string;
  hsnCode: string;
  qty: number;
  unit: string;
  rate: number;
  gstPercent: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceType: "Tax Invoice" | "Estimate";
  invoiceNo: string;
  date: string;
  attender: string;
  biller: string;
  gstType: "CGST + SGST" | "IGST";
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerGst: string;
  customerState: string;
  deliveryAddress: string;
  items: InvoiceItem[];
  subTotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  netAmount: number;
}

export interface LeftoverSheet {
  id: string;
  glassType: string;
  thickness: string;
  lengthFt: number;
  widthFt: number;
  createdAt: string;
}

const SETTINGS_KEY = "kc_settings";
const PRODUCTS_KEY = "kc_products";
const INVOICES_KEY = "kc_invoices";
const CUSTOMERS_KEY = "kc_customers";
const LEFTOVERS_KEY = "kc_leftovers";

export const getSettings = (): CompanySettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  return defaultSettings;
};

const defaultSettings: CompanySettings = {
  companyName: "Ashapura Glass Traders",
  ownerName: "Bharat Patel",
  businessType: "Proprietorship",
  address: "78 Sardar Vyapar Shankul",
  city: "Mehsana",
  state: "Gujarat",
  pincode: "384002",
  phone: "09824660185",
  email: "ashapura.glass.traders@gmail.com",
  website: "",
  gstNo: "",
  panNo: "",
  logo: "",
  bankName: "SBI",
  branchName: "Mehsana",
  accountHolderName: "Bharat Patel",
  bankAcNo: "8466484576848",
  ifscCode: "BN5546878",
  accountType: "Current",
  upiId: "",
};

export const saveSettings = (s: CompanySettings) =>
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (!stored) return [];
  const arr = JSON.parse(stored) as Product[];
  return arr.map((p) => ({ stock: 0, lowStockThreshold: 10, ...p }));
};
export const saveProducts = (p: Product[]) =>
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(p));

export const getInvoices = (): Invoice[] => {
  const stored = localStorage.getItem(INVOICES_KEY);
  return stored ? JSON.parse(stored) : [];
};
export const saveInvoices = (i: Invoice[]) =>
  localStorage.setItem(INVOICES_KEY, JSON.stringify(i));

export const getCustomers = (): Customer[] => {
  const stored = localStorage.getItem(CUSTOMERS_KEY);
  return stored ? JSON.parse(stored) : [];
};
export const saveCustomers = (c: Customer[]) =>
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(c));

export const getLeftovers = (): LeftoverSheet[] => {
  const stored = localStorage.getItem(LEFTOVERS_KEY);
  return stored ? JSON.parse(stored) : [];
};
export const saveLeftovers = (l: LeftoverSheet[]) =>
  localStorage.setItem(LEFTOVERS_KEY, JSON.stringify(l));

export const stockStatus = (p: Product): "in" | "low" | "out" => {
  if (p.stock <= 0) return "out";
  if (p.stock <= p.lowStockThreshold) return "low";
  return "in";
};

export const numberToWords = (num: number): string => {
  if (num === 0) return "ZERO RUPEES ONLY";
  const ones = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
    "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
  const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " HUNDRED" + (n % 100 ? " AND " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " THOUSAND" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " LAKH" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " CRORE" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  };
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = convert(rupees) + " RUPEES";
  if (paise > 0) result += " AND " + convert(paise) + " PAISE";
  return result + " ONLY";
};
