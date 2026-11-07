import {
  defaultShopPageContent,
  defaultSiteSettings,
  type ShopPageContent,
  type SiteDocumentResponse,
  type SiteSettings,
} from "@abeera/shared";
import { cache } from "react";

import { apiClient } from "@/lib/api/client";
import { isCatalogApiRequired } from "@/lib/catalog/source";

/** Site settings from the API, or the built-in defaults when no API is configured or it fails. */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!isCatalogApiRequired()) return defaultSiteSettings;
  try {
    const res = await apiClient.get<SiteDocumentResponse<SiteSettings>>("/site-settings");
    return res.content;
  } catch {
    return defaultSiteSettings;
  }
});

/** WhatsApp digits: the saved number, else NEXT_PUBLIC_WHATSAPP_NUMBER. */
export function whatsappDigits(settings: SiteSettings) {
  const raw = settings.store.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  return raw.replace(/\D/g, "");
}

/** /shop heading, banner and SEO, or the original defaults. */
export const getShopPageContent = cache(async (): Promise<ShopPageContent> => {
  if (!isCatalogApiRequired()) return defaultShopPageContent;
  try {
    const res = await apiClient.get<SiteDocumentResponse<ShopPageContent>>("/shop-page");
    return res.content;
  } catch {
    return defaultShopPageContent;
  }
});
