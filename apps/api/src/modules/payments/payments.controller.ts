import { Body, Controller, Param, Post } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { CurrentUser, Public } from "../../common/decorators";

@Controller("payments")
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post("jazzcash/init/:orderId")
  initiateJazzCash(@CurrentUser("id") userId: string, @Param("orderId") orderId: string) {
    return this.payments.initiateJazzCash(orderId, userId);
  }

  @Post("easypaisa/init/:orderId")
  initiateEasyPaisa(@CurrentUser("id") userId: string, @Param("orderId") orderId: string) {
    return this.payments.initiateEasyPaisa(orderId, userId);
  }

  @Public()
  @Post("webhook")
  handleWebhook(@Body() body: Record<string, string>) {
    return this.payments.handleWebhook(body);
  }
}
