import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

import { PrismaService } from "../../prisma/prisma.service";

export const UPLOADS_NEED_KEYS =
  "Uploads need Cloudinary keys. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to apps/api/.env, or paste an image link instead.";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

@Injectable()
export class MediaService {
  readonly configured: boolean;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const cloud = this.config.get<string>("CLOUDINARY_CLOUD_NAME");
    const key = this.config.get<string>("CLOUDINARY_API_KEY");
    const secret = this.config.get<string>("CLOUDINARY_API_SECRET");
    this.configured = Boolean(cloud && key && secret);
    cloudinary.config({ cloud_name: cloud, api_key: key, api_secret: secret });
  }

  async upload(file: Express.Multer.File, folder = "abeera"): Promise<UploadApiResponse> {
    if (!this.configured) throw new ServiceUnavailableException(UPLOADS_NEED_KEYS);
    if (!file) throw new BadRequestException("Choose an image file to upload.");
    if (!IMAGE_TYPES.includes(file.mimetype)) throw new BadRequestException("Only JPG, PNG, WebP, GIF or AVIF images can be uploaded.");
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  /** Uploads to Cloudinary and records the result in the library. */
  async uploadAndRecord(file: Express.Multer.File, alt = "") {
    const result = await this.upload(file);
    return this.prisma.mediaAsset.create({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        source: "cloudinary",
        filename: file.originalname ?? "",
        alt: alt.slice(0, 180),
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format,
      },
    });
  }

  async addLink(url: string, alt = "") {
    const clean = String(url ?? "").trim();
    if (!/^https?:\/\/\S+$/i.test(clean)) throw new BadRequestException("Use an image link starting with https://");
    const existing = await this.prisma.mediaAsset.findFirst({ where: { url: clean } });
    if (existing) return existing;
    let filename = "";
    try {
      filename = decodeURIComponent(new URL(clean).pathname.split("/").pop() ?? "");
    } catch {
      filename = "";
    }
    return this.prisma.mediaAsset.create({
      data: { url: clean, source: "link", filename: filename.slice(0, 120), alt: String(alt ?? "").slice(0, 180) },
    });
  }

  async list(search?: string, source?: string, page = 1, pageSize = 60) {
    const where: Prisma.MediaAssetWhereInput = {};
    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { filename: { contains: q, mode: "insensitive" } },
        { alt: { contains: q, mode: "insensitive" } },
        { url: { contains: q, mode: "insensitive" } },
      ];
    }
    if (source === "cloudinary" || source === "link") where.source = source;
    const take = Math.min(Math.max(1, pageSize), 200);
    const [items, total] = await Promise.all([
      this.prisma.mediaAsset.findMany({ where, orderBy: { createdAt: "desc" }, skip: (Math.max(1, page) - 1) * take, take }),
      this.prisma.mediaAsset.count({ where }),
    ]);
    return { items, total, page, pageSize: take, cloudinaryConfigured: this.configured };
  }

  async update(id: string, data: { alt?: string }) {
    await this.find(id);
    return this.prisma.mediaAsset.update({ where: { id }, data: { alt: String(data.alt ?? "").slice(0, 180) } });
  }

  /** Where an image URL is used across the store, so deletes are informed. */
  async usage(id: string) {
    const asset = await this.find(id);
    const url = asset.url;
    const [images, categories, docs] = await Promise.all([
      this.prisma.productImage.findMany({
        where: { url, product: { deletedAt: null } },
        select: { product: { select: { id: true, name: true } } },
      }),
      this.prisma.category.findMany({ where: { image: url }, select: { name: true } }),
      this.prisma.$queryRaw<{ name: string }[]>`
        SELECT 'Homepage' AS name FROM homepage_content WHERE document::text LIKE ${"%" + url + "%"}
        UNION ALL
        SELECT id AS name FROM site_documents WHERE document::text LIKE ${"%" + url + "%"}
      `,
    ]);
    const all = [
      ...images.map((i) => ({ kind: "product", label: `Product · ${i.product.name}`, href: `/admin/products/${i.product.id}/edit` })),
      ...categories.map((c) => ({ kind: "category", label: `Category · ${c.name}`, href: "/admin/categories" })),
      ...docs.map((d) =>
        d.name === "Homepage"
          ? { kind: "homepage", label: "Homepage", href: "/admin/homepage" }
          : d.name === "shop-page"
            ? { kind: "shop", label: "Shop page", href: "/admin/shop-page" }
            : { kind: "settings", label: "Site settings", href: "/admin/settings" },
      ),
    ];
    return all.filter((u, i) => all.findIndex((o) => o.label === u.label) === i);
  }

  async remove(id: string) {
    const asset = await this.find(id);
    if (asset.publicId && this.configured) {
      await cloudinary.uploader.destroy(asset.publicId).catch(() => undefined);
    }
    await this.prisma.mediaAsset.delete({ where: { id } });
    return { deleted: true, removedFromCloudinary: Boolean(asset.publicId && this.configured) };
  }

  async delete(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
  }

  private async find(id: string) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException("Image not found");
    return asset;
  }
}
