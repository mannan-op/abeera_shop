import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  SHOP_PAGE_ID,
  SITE_SETTINGS_ID,
  defaultShopPageContent,
  shopPageSchema,
  type ShopPageContent,
  defaultSiteSettings,
  siteSettingsSchema,
  type SiteDocumentResponse,
  type SiteSettings,
} from "@abeera/shared";
import type { z } from "zod";

import { PrismaService } from "../../prisma/prisma.service";

type DocumentDef<T> = { id: string; schema: z.ZodType<T>; defaults: T };

export const SITE_SETTINGS_DOC: DocumentDef<SiteSettings> = {
  id: SITE_SETTINGS_ID,
  schema: siteSettingsSchema as unknown as z.ZodType<SiteSettings>,
  defaults: defaultSiteSettings,
};

export const SHOP_PAGE_DOC: DocumentDef<ShopPageContent> = {
  id: SHOP_PAGE_ID,
  schema: shopPageSchema as unknown as z.ZodType<ShopPageContent>,
  defaults: defaultShopPageContent,
};

/** Reads and writes the admin-edited JSON documents in `site_documents`. */
@Injectable()
export class SiteDocumentsService {
  constructor(private prisma: PrismaService) {}

  async get<T>(def: DocumentDef<T>): Promise<SiteDocumentResponse<T>> {
    const row = await this.prisma.siteDocument.findUnique({ where: { id: def.id } });
    if (!row) return { content: def.defaults, updatedAt: null, source: "default" };
    const parsed = def.schema.safeParse(row.document);
    if (!parsed.success) return { content: def.defaults, updatedAt: row.updatedAt.toISOString(), source: "default" };
    return { content: parsed.data, updatedAt: row.updatedAt.toISOString(), source: "stored" };
  }

  async save<T>(def: DocumentDef<T>, content: T): Promise<SiteDocumentResponse<T>> {
    const document = JSON.parse(JSON.stringify(content)) as Prisma.InputJsonValue;
    const row = await this.prisma.siteDocument.upsert({
      where: { id: def.id },
      create: { id: def.id, document },
      update: { document },
    });
    return { content, updatedAt: row.updatedAt.toISOString(), source: "stored" };
  }

  async settings(): Promise<SiteSettings> {
    return (await this.get(SITE_SETTINGS_DOC)).content;
  }
}
