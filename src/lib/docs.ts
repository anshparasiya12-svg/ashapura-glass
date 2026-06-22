export type GstType = "CGST_SGST" | "IGST";

export interface DocHeader {
  doc_no: string;
  doc_date: string;
  valid_until?: string;
  due_date?: string;
  gst_type: GstType;
  customer_id: string | null;
  customer_snapshot: {
    name: string; phone?: string; email?: string; address?: string; state?: string; gst_no?: string;
  };
  notes?: string;
  terms?: string;
  attender?: string;
  biller?: string;
  discount: number;
}

export interface DocItem {
  id: string;
  description: string;
  hsn_code?: string;
  width?: number | null;
  height?: number | null;
  unit?: "ft" | "in" | "mm" | null;
  qty: number;
  area_sqft?: number | null;
  rate: number;
  gst_percent: number;
  amount: number;
}

export const emptyItem = (): DocItem => ({
  id: crypto.randomUUID(),
  description: "",
  hsn_code: "",
  width: null,
  height: null,
  unit: null,
  qty: 1,
  area_sqft: null,
  rate: 0,
  gst_percent: 18,
  amount: 0,
});

export const recomputeItem = (i: DocItem): DocItem => {
  let qty = i.qty || 0;
  let area: number | null = null;
  if (i.width && i.height && i.unit) {
    const toFt = i.unit === "ft" ? 1 : i.unit === "in" ? 1 / 12 : 1 / 304.8;
    area = +(i.width * toFt * (i.height * toFt) * (i.qty || 1)).toFixed(3);
  }
  const effectiveQty = area ?? qty;
  const amount = +(effectiveQty * (i.rate || 0)).toFixed(2);
  return { ...i, area_sqft: area, amount };
};

export const computeTotals = (items: DocItem[], gstType: GstType, discount = 0) => {
  const sub_total = +items.reduce((s, i) => s + i.amount, 0).toFixed(2);
  let cgst = 0, sgst = 0, igst = 0;
  for (const i of items) {
    const g = (i.amount * (i.gst_percent || 0)) / 100;
    if (gstType === "IGST") igst += g; else { cgst += g / 2; sgst += g / 2; }
  }
  cgst = +cgst.toFixed(2); sgst = +sgst.toFixed(2); igst = +igst.toFixed(2);
  const net_amount = +(sub_total + cgst + sgst + igst - (discount || 0)).toFixed(2);
  return { sub_total, cgst, sgst, igst, net_amount };
};

export const nextDocNo = (prefix: string, lastNumber: number) =>
  `${prefix}/${new Date().getFullYear()}/${String(lastNumber + 1).padStart(4, "0")}`;

export const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    sent: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    accepted: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    rejected: "bg-destructive/15 text-destructive",
    expired: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    partial: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    unpaid: "bg-destructive/15 text-destructive",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
};

export const paymentStatus = (net: number, paid: number) => {
  if (paid <= 0) return "unpaid";
  if (paid + 0.01 < net) return "partial";
  return "paid";
};
