"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async initiateJazzCash(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
        });
        if (!order || !order.payment)
            throw new common_1.BadRequestException("Order not found");
        if (order.payment.method !== "JAZZCASH")
            throw new common_1.BadRequestException("Not a JazzCash order");
        const merchantId = this.config.get("JAZZCASH_MERCHANT_ID", "");
        const password = this.config.get("JAZZCASH_PASSWORD", "");
        const salt = this.config.get("JAZZCASH_INTEGRITY_SALT", "");
        const txnRefNo = `T${Date.now()}`;
        const amount = String(order.total);
        const dateTime = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
        const expiryDateTime = new Date(Date.now() + 3600000).toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
        const hashString = [
            salt, amount, "PKR", dateTime, expiryDateTime,
            merchantId, password, "", txnRefNo,
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
    async initiateEasyPaisa(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
        });
        if (!order || !order.payment)
            throw new common_1.BadRequestException("Order not found");
        if (order.payment.method !== "EASYPAISA")
            throw new common_1.BadRequestException("Not an EasyPaisa order");
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
    async handleWebhook(body) {
        const txnRefNo = body.pp_TxnRefNo ?? body.transactionId;
        if (!txnRefNo)
            throw new common_1.BadRequestException("Missing transaction reference");
        const payment = await this.prisma.payment.findFirst({
            where: { transactionId: txnRefNo },
        });
        if (!payment)
            throw new common_1.BadRequestException("Payment not found");
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map