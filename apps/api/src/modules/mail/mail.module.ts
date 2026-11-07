import { BullModule } from "@nestjs/bullmq";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { MailService } from "./mail.service";
import { OrderEmailsProcessor } from "./order-emails.processor";
import { ORDER_EMAILS_QUEUE } from "./order-emails.queue";

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = new URL(config.get<string>("REDIS_URL") ?? "redis://localhost:6379");
        return {
          prefix: "abeera",
          connection: {
            host: url.hostname,
            port: Number(url.port || 6379),
            username: url.username || undefined,
            password: url.password ? decodeURIComponent(url.password) : undefined,
            db: url.pathname.length > 1 ? Number(url.pathname.slice(1)) : undefined,
            tls: url.protocol === "rediss:" ? {} : undefined,
          },
        };
      },
    }),
    BullModule.registerQueue({ name: ORDER_EMAILS_QUEUE }),
  ],
  providers: [MailService, OrderEmailsProcessor],
  exports: [MailService],
})
export class MailModule {}
