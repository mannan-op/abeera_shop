import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
export declare class PaymentsService {
    private prisma;
    private config;
    constructor(prisma: PrismaService, config: ConfigService);
    initiateJazzCash(orderId: string): Promise<{
        endpoint: any;
        params: {
            pp_Version: string;
            pp_TxnType: string;
            pp_Language: string;
            pp_MerchantID: any;
            pp_Password: any;
            pp_TxnRefNo: string;
            pp_Amount: string;
            pp_TxnCurrency: string;
            pp_TxnDateTime: string;
            pp_TxnExpiryDateTime: string;
            pp_SecureHash: string;
            pp_ReturnURL: string;
        };
    }>;
    initiateEasyPaisa(orderId: string): Promise<{
        storeId: any;
        transactionId: string;
        amount: number;
        orderId: string;
    }>;
    handleWebhook(body: Record<string, string>): Promise<{
        success: boolean;
    }>;
}
