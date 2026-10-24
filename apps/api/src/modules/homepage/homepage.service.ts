import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  HOMEPAGE_CONTENT_ID,
  defaultHomepageContent,
  homepageContentSchema,
  type HomepageContent,
  type HomepageDocumentResponse,
} from "@abeera/shared";

import { PrismaService } from "../../prisma/prisma.service";

function toJson(content: HomepageContent): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(content)) as Prisma.InputJsonValue;
}

@Injectable()
export class HomepageService {
  constructor(private prisma: PrismaService) {}

  async get(): Promise<HomepageDocumentResponse> {
    const row = await this.prisma.homepageContent.findUnique({
      where: { id: HOMEPAGE_CONTENT_ID },
    });
    if (!row) {
      return { content: defaultHomepageContent, updatedAt: null, source: "default" };
    }

    const parsed = homepageContentSchema.safeParse(row.document);
    if (!parsed.success) {
      return {
        content: defaultHomepageContent,
        updatedAt: row.updatedAt.toISOString(),
        source: "default",
      };
    }

    return {
      content: parsed.data,
      updatedAt: row.updatedAt.toISOString(),
      source: "stored",
    };
  }

  async save(content: HomepageContent): Promise<HomepageDocumentResponse> {
    const row = await this.prisma.homepageContent.upsert({
      where: { id: HOMEPAGE_CONTENT_ID },
      create: { id: HOMEPAGE_CONTENT_ID, document: toJson(content) },
      update: { document: toJson(content) },
    });
    return {
      content,
      updatedAt: row.updatedAt.toISOString(),
      source: "stored",
    };
  }
}
