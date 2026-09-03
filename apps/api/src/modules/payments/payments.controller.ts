import { Body, Controller, Param, Post } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { Public } from "../../common/decorators";

@Controller("payments")
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post("jazzcash/init/:orderId")
  initiateJazzCash(@Param("orderId") orderId: string) {
    return this.payments.initiateJazzCash(orderId);
  }

  @Post("easypaisa/init/:orderId")
  initiateEasyPaisa(@Param("orderId") orderId: string) {
    return this.payments.initiateEasyPaisa(orderId);
  }

  @Public()
  @Post("webhook")
  handleWebhook(@Body() body: Record<string, string>) {
    return this.payments.handleWebhook(body);
  }
}
