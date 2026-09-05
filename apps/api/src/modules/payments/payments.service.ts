import { Injectable, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async initiateJazzCash(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order || !order.payment) throw new BadRequestException("Order not found");
    if (order.payment.method !== "JAZZCASH") throw new BadRequestException("Not a JazzCash order");

    const merchantId = this.config.get<string>("JAZZCASH_MERCHANT_ID", "");
    const password = this.config.get<string>("JAZZCASH_PASSWORD", "");
    const salt = this.config.get<string>("JAZZCASH_INTEGRITY_SALT", "");

    const txnRefNo = `T${Date.now()}`;
    const amount = String(order.total);
    const dateTime = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    const expiryDateTime = new Date(Date.now() + 3600000)
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .slice(0, 14);

    const hashString = [
      salt,
      amount,
      "PKR",
      dateTime,
      expiryDateTime,
      merchantId,
      password,
      "",
      txnRefNo,
    ].join("&");

    const secureHash = crypto.createHmac("sha256", salt).update(hashString).digest("hex");

    await this.prisma.payment.update({
      where: { id: order.payment.id },
      data: { transactionId: txnRefNo },
    });

    return {
      endpoint: this.config.get("JAZZCASH_ENDPOINT"),
      params: {
        pp_Version: "1.1",
        pp_TxnType: "MWALLET",
        pp_Language: "EN",
        pp_MerchantID: merchantId,
        pp_Password: password,
        pp_TxnRefNo: txnRefNo,
        pp_Amount: amount,
        pp_TxnCurrency: "PKR",
        pp_TxnDateTime: dateTime,
        pp_TxnExpiryDateTime: expiryDateTime,
        pp_SecureHash: secureHash,
        pp_ReturnURL: `${this.config.get("FRONTEND_URL", "http://localhost:3000")}/order-confirmation?id=${orderId}`,
      },
    };
  }

  async initiateEasyPaisa(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order || !order.payment) throw new BadRequestException("Order not found");
    if (order.payment.method !== "EASYPAISA") throw new BadRequestException("Not an EasyPaisa order");

    const storeId = this.config.get("EASYPAISA_STORE_ID", "");
    const txnRefNo = `EP${Date.now()}`;

    await this.prisma.payment.update({
      where: { id: order.payment.id },
      data: { transactionId: txnRefNo },
    });

    return {
      storeId,
      transactionId: txnRefNo,
      amount: order.total,
      orderId: order.id,
    };
  }

  verifyJazzCashHash(body: Record<string, string>) {
    const salt = this.config.get<string>("JAZZCASH_INTEGRITY_SALT", "");
    const received = (body.pp_SecureHash ?? "").toLowerCase();

    if (!salt) {
      if (process.env.NODE_ENV === "production") return false;
      // Local only: allow unsigned payloads; reject any provided hash without a salt
      return !received;
    }

    if (!received) return false;

    const sortedKeys = Object.keys(body)
      .filter((key) => key !== "pp_SecureHash" && body[key] !== undefined && body[key] !== "")
      .sort();

    const payload = [salt, ...sortedKeys.map((key) => body[key])].join("&");
    const expected = crypto.createHmac("sha256", salt).update(payload).digest("hex").toLowerCase();
    if (expected.length !== received.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  }

  async handleWebhook(body: Record<string, string>) {
    const txnRefNo = body.pp_TxnRefNo ?? body.transactionId;
    if (!txnRefNo) throw new BadRequestException("Missing transaction reference");

    if (body.pp_SecureHash || body.pp_TxnRefNo) {
      const valid = this.verifyJazzCashHash(body);
      if (!valid) throw new UnauthorizedException("Invalid payment signature");
    } else if (body.transactionId && body.hash) {
      const hashKey = this.config.get<string>("EASYPAISA_HASH_KEY", "");
      if (hashKey) {
        const expected = crypto
          .createHmac("sha256", hashKey)
          .update(`${body.transactionId}${body.amount ?? ""}${body.responseCode ?? ""}`)
          .digest("hex");
        if (expected.toLowerCase() !== body.hash.toLowerCase()) {
          throw new UnauthorizedException("Invalid EasyPaisa signature");
        }
      } else if (process.env.NODE_ENV === "production") {
        throw new UnauthorizedException("Payment hash key not configured");
      }
    } else if (process.env.NODE_ENV === "production") {
      throw new BadRequestException("Unsigned webhook rejected in production");
    }

    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: txnRefNo },
    });
    if (!payment) throw new BadRequestException("Payment not found");

    const responseCode = body.pp_ResponseCode ?? body.responseCode;
    const success = responseCode === "000" || responseCode === "0000";

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: success ? "COMPLETED" : "FAILED",
        rawResponse: body,
      },
    });

    if (success) {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "CONFIRMED" },
      });
    }

    return { success };
  }
}
