import type { Order, OrderItem, OrderCreatePayload } from "@/types";

export type { Order, OrderItem, OrderCreatePayload };

export type OrderStatusFilter = "all" | "paid" | "pending" | "processing" | "completed" | "cancelled";

export interface OrderInvoiceItem {
  id: string;
  product_id?: string | null;
  product_title: string;
  product_sku: string;
  hsn_code: string;
  unit_price: number;
  quantity: number;
  taxable_value: number;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  total_price: number;
  image_url?: string | null;
}

export interface OrderInvoiceResponse {
  invoice_number: string;
  invoice_date: string;
  place_of_supply: string;
  order_id: string;
  order_number: string;
  order_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  billing_address: string;
  shipping_address: string;
  payment_method: string;
  payment_status: string;
  payment_reference?: string | null;
  currency: string;
  hsn_sac_code: string;
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  total_tax_amount: number;
  shipping_and_insurance: number;
  total_amount: number;
  amount_in_words: string;
  company_name: string;
  company_address: string;
  company_tax_id: string;
  company_pan_cin: string;
  company_contact: string;
  items: OrderInvoiceItem[];
}
