import { describe, it, expect, vi, beforeEach } from "vitest";
import { ordersApi } from "@/features/orders";
import { generateQRCodeMatrix } from "@/lib/utils/qrcode";

describe("Order Invoice & Shipping Label", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches official tax invoice via ordersApi.getOrderInvoice", async () => {
    const mockInvoice = {
      invoice_number: "INV-PJ-202611-0001",
      invoice_date: new Date().toISOString(),
      order_id: "ord-123",
      order_number: "ORD-2026-0001",
      customer_name: "Duchess Sophia",
      taxable_amount: 10000,
      cgst_amount: 150,
      sgst_amount: 150,
      total_tax_amount: 300,
      total_amount: 10300,
      items: [],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockInvoice,
        headers: new Headers(),
      })
    );

    const res = await ordersApi.getOrderInvoice("ord-123", "test-token");
    expect(res.invoice_number).toBe("INV-PJ-202611-0001");
    expect(res.total_tax_amount).toBe(300);
    expect(res.customer_name).toBe("Duchess Sophia");
  });

  it("generates valid QR code matrix with finder patterns", () => {
    const matrix = generateQRCodeMatrix("https://pjjewellery.com/track/ORD-2026-0001");
    expect(matrix).toBeDefined();
    expect(matrix.length).toBeGreaterThan(20);
    // Finder pattern top-left check
    expect(matrix[0][0]).toBe(true);
    expect(matrix[0][6]).toBe(true);
    expect(matrix[6][0]).toBe(true);
    expect(matrix[6][6]).toBe(true);
  });
});

