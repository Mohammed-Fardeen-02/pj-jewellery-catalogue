import { describe, it, expect, vi, beforeEach } from "vitest";
import { stockApi } from "@/features/stock";
import { ordersApi } from "@/features/orders";
import { analyticsApi } from "@/features/analytics";

describe("Stock Feature API (Independent Domain)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches stock overview metrics", async () => {
    const mockOverview = {
      total_stock_units: 42,
      total_products: 8,
      in_stock_count: 6,
      low_stock_count: 2,
      out_of_stock_count: 0,
      low_stock_items: [],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockOverview,
        headers: new Headers(),
      })
    );

    const res = await stockApi.getOverview("token-xyz");
    expect(res.total_stock_units).toBe(42);
    expect(res.low_stock_count).toBe(2);
  });

  it("posts stock adjustment transaction (Stock In)", async () => {
    const mockTx = {
      id: "tx-1",
      product_id: "prod-1",
      transaction_type: "stock_in",
      quantity: 5,
      previous_stock: 10,
      new_stock: 15,
      reason: "Supplier delivery",
      created_at: new Date().toISOString(),
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => mockTx,
      headers: new Headers(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await stockApi.adjustStock(
      "prod-1",
      { transaction_type: "stock_in", quantity: 5, reason: "Supplier delivery" },
      "token-xyz"
    );

    expect(res.new_stock).toBe(15);
    expect(fetchMock).toHaveBeenCalled();
  });

  it("retrieves product stock ledger history", async () => {
    const mockHistory = [
      {
        id: "tx-1",
        product_id: "prod-1",
        transaction_type: "stock_in",
        quantity: 10,
        previous_stock: 0,
        new_stock: 10,
        reason: "Initial stock",
        created_at: new Date().toISOString(),
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockHistory,
        headers: new Headers(),
      })
    );

    const history = await stockApi.getStockHistory("prod-1", 50, "token-xyz");
    expect(history.length).toBe(1);
    expect(history[0].transaction_type).toBe("stock_in");
  });
});

describe("Orders Feature API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates public storefront checkout order", async () => {
    const mockOrder = {
      id: "ord-1",
      order_number: "ORD-2026-0001",
      customer_name: "Duchess Sophia",
      customer_email: "sophia@example.com",
      total_amount: 12500,
      payment_status: "paid",
      items: [],
      created_at: new Date().toISOString(),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockOrder,
        headers: new Headers(),
      })
    );

    const res = await ordersApi.createStorefrontOrder({
      customer_name: "Duchess Sophia",
      customer_email: "sophia@example.com",
      shipping_address: "10 Belgrave Square",
      items: [{ product_id: "prod-1", quantity: 1 }],
    });

    expect(res.order_number).toBe("ORD-2026-0001");
    expect(res.payment_status).toBe("paid");
  });

  it("lists customer orders for admin", async () => {
    const mockOrdersList = {
      items: [],
      total: 0,
      page: 1,
      limit: 15,
      pages: 1,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockOrdersList,
        headers: new Headers(),
      })
    );

    const res = await ordersApi.listOrders("token-xyz", { page: 1, limit: 15 });
    expect(res.total).toBe(0);
  });
});

describe("Analytics Feature API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches dashboard analytics with horizon range", async () => {
    const mockAnalytics = {
      catalogue: { total_products: 10, published_products: 8 },
      inventory: { total_stock_units: 50 },
      commerce: { total_revenue: 25000, total_orders: 2 },
      daily_trends: [],
      recent_orders: [],
      recent_stock_transactions: [],
      low_stock_alerts: [],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockAnalytics,
        headers: new Headers(),
      })
    );

    const res = await analyticsApi.getDashboard("30d", "token-xyz");
    expect(res.commerce.total_revenue).toBe(25000);
  });
});
