import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Queue } from "bullmq";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

import { ORDER_EMAILS_QUEUE, type OrderEmailJob, type OrderEmailType } from "./order-emails.queue";

export type Mail = { to: string; subject: string; html: string; replyTo?: string };

const ENQUEUE_TIMEOUT_MS = 3_000;

/**
 * Order emails go through the BullMQ "order-emails" queue on Redis; the worker in
 * OrderEmailsProcessor renders and delivers them. Delivery uses Resend when
 * RESEND_API_KEY is set; without a key each email is written to apps/api/tmp-mail/.
 */
@Injectable()
export class MailService {
  private readonly log = new Logger(MailService.name);
  private readonly apiKey: string;
  private readonly from: string;
  private readonly outDir: string;
  readonly frontendUrl: string;

  constructor(
    config: ConfigService,
    @InjectQueue(ORDER_EMAILS_QUEUE) private queue: Queue<OrderEmailJob, unknown, OrderEmailType>,
  ) {
    this.apiKey = config.get<string>("RESEND_API_KEY", "").trim();
    this.from = config.get<string>("MAIL_FROM", "").trim() || "Abeera <onboarding@resend.dev>";
    this.outDir = config.get<string>("MAIL_OUTBOX_DIR", "").trim() || join(process.cwd(), "tmp-mail");
    this.frontendUrl = (config.get<string>("FRONTEND_URL", "") || "http://localhost:3000").replace(/\/$/, "");
  }

  /**
   * Called after the order transaction commits. Never throws and never blocks the
   * response: a Redis outage is logged and the order still succeeds.
   */
  orderPlaced(orderId: string) {
    for (const type of ["customer-slip", "admin-notification"] as const) {
      const add = this.queue.add(type, { orderId }, {
        jobId: `${orderId}__${type}`, // BullMQ forbids ":" in ids; same order + type = same job, so retries/replays never double-send
        attempts: 5,
        backoff: { type: "exponential", delay: 5_000 }, // 5s, 10s, 20s, 40s
        removeOnComplete: true,
        removeOnFail: { age: 7 * 24 * 3600 },
      });
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Redis did not answer within ${ENQUEUE_TIMEOUT_MS}ms`)), ENQUEUE_TIMEOUT_MS),
      );
      Promise.race([add, timeout]).catch((error: unknown) =>
        this.log.error(
          `Could not queue ${type} email for order ${orderId}: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  }

  /** Deliver one email. Throws on failure so the queue retries it. */
  async deliver(mail: Mail) {
    if (!this.apiKey) return { mode: "file" as const, file: await this.writeToOutbox(mail) };
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: this.from, to: [mail.to], subject: mail.subject, html: mail.html, reply_to: mail.replyTo }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`Resend rejected "${mail.subject}" (${res.status}): ${(await res.text()).slice(0, 300)}`);
    const body = (await res.json().catch(() => ({}))) as { id?: string };
    this.log.log(`Sent "${mail.subject}" via Resend (${body.id ?? "no id"})`);
    return { mode: "resend" as const, id: body.id };
  }

  private async writeToOutbox(mail: Mail) {
    await mkdir(this.outDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const safe = (s: string) => s.replace(/[^a-z0-9@._-]+/gi, "_").slice(0, 60);
    const file = join(this.outDir, `${stamp}_${safe(mail.to)}_${safe(mail.subject)}.html`);
    const header = `<!-- To: ${mail.to}\n     Subject: ${mail.subject}\n     Reply-To: ${mail.replyTo ?? ""} -->\n`;
    await writeFile(file, header + mail.html, "utf8");
    this.log.log(`No RESEND_API_KEY: wrote "${mail.subject}" to ${file}`);
    return file;
  }
}
