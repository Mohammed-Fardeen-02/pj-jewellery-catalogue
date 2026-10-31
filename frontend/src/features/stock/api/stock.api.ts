import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  StockAdjustmentPayload,
  StockOverviewResponse,
  StockTransactionResponse,
} from "../types/stock.types";

export const stockApi = {
  /**
   * Retrieve catalogue-wide inventory metrics including low and out-of-stock items.
   */
  async getOverview(token?: string): Promise<StockOverviewResponse> {
    return apiClient.get<StockOverviewResponse>(ENDPOINTS.admin.stockOverview, { token });
  },

  /**
   * Execute an inventory adjustment (Stock In / Stock Out / Audit) for a specific piece.
   */
  async adjustStock(
    productId: string,
    payload: StockAdjustmentPayload,
    token?: string
  ): Promise<StockTransactionResponse> {
    return apiClient.post<StockTransactionResponse>(
      ENDPOINTS.admin.productStockAdjust(productId),
      payload,
      { token }
    );
  },

  /**
   * Retrieve chronologically ordered inventory ledger transactions for a piece.
   */
  async getStockHistory(
    productId: string,
    limit: number = 50,
    token?: string
  ): Promise<StockTransactionResponse[]> {
    return apiClient.get<StockTransactionResponse[]>(
      ENDPOINTS.admin.productStockHistory(productId),
      {
        token,
        params: { limit },
      }
    );
  },
};
