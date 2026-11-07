import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { defaultSiteSettings } from "@abeera/shared";
import type { Job } from "bullmq";

import { PrismaService } from "../../prisma/prisma.service";
import { SiteDocumentsService } from "../site/site-documents.service";
import { MailService } from "./mail.service";
import { adminOrderEmail, customerOrderEmail } from "./order-emails";
import { ORDER_EMAILS_QUEUE, type OrderEmailJob, type OrderEmailType } from "./order-emails.queue";


/** Worker inside the API process: renders each order email from the database and sends it. A throw = retry. */
@Processor(ORDER_EMAILS_QUEUE, { concurrency: 4 })
export class OrderEmailsProcessor extends WorkerHost {
  private readonly log = new Logger(OrderEmailsProcessor.name);
  /** Local testing only: fail the first N attempts of every job to exercise retries. */
  private readonly simulateFailures: number;

  constructor(
    private prisma: PrismaService,
    private site: SiteDocumentsService,
    private mail: MailService,
    config: ConfigService,
  ) {
    super();
    this.simulateFailures = Number(config.get<string>("MAIL_SIMULATE_FAILURES", "0")) || 0;
  }

  async process(job: Job<OrderEmailJob, unknown, OrderEmailType>) {
    if (job.attemptsMade < this.simulateFailures) {
      throw new Error(`Simulated failure ${job.attemptsMade + 1}/${this.simulateFailures} (MAIL_SIMULATE_FAILURES)`);
    }
    const order = await this.prisma.order.findUnique({
      where: { id: job.data.orderId },
      include: { items: true, payment: true, address: true },
    });
    if (!order) {
      this.log.warn(`Order ${job.data.orderId} no longer exists; skipping ${job.name}`);
      return { skipped: true };
    }
    const settings = await this.site.settings();
    const ctx = { order, settings, siteUrl: this.mail.frontendUrl };
    const store = settings.store;
    if (job.name === "customer-slip") {
      return this.mail.deliver({
        to: order.customerEmail,
        subject: `Your Abeera order ${order.orderNumber}`,
        html: customerOrderEmail(ctx),
        replyTo: store.contactEmail || defaultSiteSettings.store.contactEmail,
      });
    }
    const adminTo = store.orderNotificationEmail || defaultSiteSettings.store.orderNotificationEmail;
    return this.mail.deliver({
      to: adminTo,
      subject: `New order ${order.orderNumber} — ${order.customerName}`,
      html: adminOrderEmail(ctx),
      replyTo: order.customerEmail,
    });
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<OrderEmailJob>, error: Error) {
    const final = job.attemptsMade >= (job.opts.attempts ?? 1);
    this.log[final ? "error" : "warn"](
      `${job.name} for order ${job.data.orderId} failed (attempt ${job.attemptsMade}/${job.opts.attempts ?? 1})${final ? " — giving up" : ", will retry"}: ${error.message}`,
    );
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job<OrderEmailJob>) {
    this.log.log(`${job.name} for order ${job.data.orderId} done after ${job.attemptsMade} attempt(s)`);
  }
}
