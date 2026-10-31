import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export interface AiSuggestRequest {
  image_url: string;
  category_hint?: string;
}

export interface AiSuggestResponse {
  title: string;
  description: string;
  category_name: string;
  category_slug: string;
  design_style: string;
  gemstone_type: string;
  metal_type: string;
  collection: string;
  tags: string[];
  keywords: string[];
  confidence_summary: string;
}

export const aiApi = {
  async suggestProduct(payload: AiSuggestRequest, token?: string): Promise<AiSuggestResponse> {
    return apiClient.post<AiSuggestResponse>(ENDPOINTS.admin.aiSuggest, payload, { token });
  },
};
