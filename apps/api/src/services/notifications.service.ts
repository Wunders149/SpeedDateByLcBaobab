/**
 * Notification delivery adapter.
 *
 * Provides a single `NotificationService` abstraction over one or more channels
 * (in-app MongoDB persistence, e-mail via SMTP or console, SMS via provider).
 *
 * Transports are dependency-free by default (console logging) so the API works
 * without external providers configured. When `SMTP_HOST` / `SMS_PROVIDER_URL`
 * are present the service upgrades to real delivery (requires the optional
 * nodemailer / fetchable SMS provider; if the module is unavailable it falls
 * back to the console transport rather than crashing).
 */

export interface EmailMessage {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface SmsMessage {
  to: string;
  body: string;
}

export interface DeliveryResult {
  channel: 'in_app' | 'email' | 'sms';
  status: 'sent' | 'queued' | 'failed' | 'skipped';
  providerMessageId?: string;
  error?: string;
}

export interface NotificationChannel {
  name: 'email' | 'sms' | 'in_app';
  isAvailable(): boolean;
  sendEmail(msg: EmailMessage): Promise<DeliveryResult>;
  sendSms(msg: SmsMessage): Promise<DeliveryResult>;
}

class ConsoleChannel implements NotificationChannel {
  name: 'email' | 'sms' = 'email';

  isAvailable() {
    return true;
  }

  async sendEmail(msg: EmailMessage): Promise<DeliveryResult> {
    console.log(`[notification:email] -> ${msg.to} :: ${msg.subject}\n${msg.text ?? msg.html ?? ''}`);
    return { channel: 'email', status: 'sent', providerMessageId: `console-${Date.now()}` };
  }

  async sendSms(msg: SmsMessage): Promise<DeliveryResult> {
    console.log(`[notification:sms] -> ${msg.to} :: ${msg.body}`);
    return { channel: 'sms', status: 'sent', providerMessageId: `console-${Date.now()}` };
  }
}

export interface NotificationSendRequest {
  recipientId?: string;
  eventId?: string;
  email?: string;
  phone?: string;
  type: string;
  title: string;
  message: string;
  channels?: Array<'in_app' | 'email' | 'sms'>;
  metadata?: Record<string, unknown>;
}

export interface NotificationServiceOptions {
  inAppPersist?: (payload: NotificationSendRequest) => Promise<unknown>;
  emailTransport?: 'console' | 'smtp';
  smsTransport?: 'console' | 'http';
  smtp?: { host: string; port: number; user?: string; pass?: string; from: string };
  smsEndpoint?: { url: string; apiKey?: string };
}

const defaultOptions: NotificationServiceOptions = {
  emailTransport: 'console',
  smsTransport: 'console',
};

export class NotificationService {
  private readonly inAppPersist?: (payload: NotificationSendRequest) => Promise<unknown>;
  private readonly emailTransport: 'console' | 'smtp';
  private readonly smsTransport: 'console' | 'http';
  private readonly smtp?: NotificationServiceOptions['smtp'];
  private readonly smsEndpoint?: NotificationServiceOptions['smsEndpoint'];

  constructor(options: NotificationServiceOptions = defaultOptions) {
    this.inAppPersist = options.inAppPersist;
    this.emailTransport = options.emailTransport ?? 'console';
    this.smsTransport = options.smsTransport ?? 'console';
    this.smtp = options.smtp;
    this.smsEndpoint = options.smsEndpoint;
  }

  async send(req: NotificationSendRequest): Promise<DeliveryResult[]> {
    const channels = req.channels ?? ['in_app'];
    const results: DeliveryResult[] = [];

    if (channels.includes('in_app') && this.inAppPersist) {
      try {
        await this.inAppPersist(req);
        results.push({ channel: 'in_app', status: 'sent' });
      } catch (err) {
        results.push({ channel: 'in_app', status: 'failed', error: (err as Error).message });
      }
    } else if (channels.includes('in_app')) {
      results.push({ channel: 'in_app', status: 'skipped' });
    }

    if (channels.includes('email') && req.email) {
      results.push(await this.deliverEmail(req.email, req.title, req.message));
    }
    if (channels.includes('sms') && req.phone) {
      results.push(await this.deliverSms(req.phone, `${req.title}: ${req.message}`));
    }

    return results;
  }

  private async deliverEmail(to: string, subject: string, body: string): Promise<DeliveryResult> {
    if (this.emailTransport === 'smtp' && this.smtp?.host) {
      // Dynamic require for optional nodemailer; fall back to console if absent.
      try {
        const nodemailer = await import(/* @vite-ignore */ 'nodemailer' as string).catch(() => null);
        if (nodemailer?.default?.createTransport || nodemailer?.createTransport) {
          const createTransport = nodemailer.default?.createTransport ?? nodemailer.createTransport;
          const transporter = createTransport({
            host: this.smtp.host,
            port: this.smtp.port,
            auth: this.smtp.user ? { user: this.smtp.user, pass: this.smtp.pass } : undefined,
          });
          const info = await transporter.sendMail({
            from: this.smtp.from,
            to,
            subject,
            text: body,
          });
          return { channel: 'email', status: 'sent', providerMessageId: info.messageId };
        }
      } catch (err) {
        console.warn('[notification:email] SMTP failed, falling back to console:', (err as Error).message);
      }
    }
    return new ConsoleChannel().sendEmail({ to, subject, text: body });
  }

  private async deliverSms(to: string, body: string): Promise<DeliveryResult> {
    if (this.smsTransport === 'http' && this.smsEndpoint?.url) {
      try {
        const res = await fetch(this.smsEndpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.smsEndpoint.apiKey ? { Authorization: `Bearer ${this.smsEndpoint.apiKey}` } : {}),
          },
          body: JSON.stringify({ to, body }),
        });
        if (!res.ok) throw new Error(`SMS provider responded ${res.status}`);
        const json = await res.json().catch(() => ({}));
        return { channel: 'sms', status: 'sent', providerMessageId: json?.id ?? `http-${Date.now()}` };
      } catch (err) {
        console.warn('[notification:sms] HTTP provider failed, falling back to console:', (err as Error).message);
      }
    }
    return new ConsoleChannel().sendSms({ to, body });
  }
}

/** Singleton configured from environment variables. */
export function createNotificationServiceFromEnv(
  inAppPersist?: (payload: NotificationSendRequest) => Promise<unknown>,
): NotificationService {
  const smtpHost = process.env.SMTP_HOST;
  const smsUrl = process.env.SMS_PROVIDER_URL;
  return new NotificationService({
    inAppPersist,
    emailTransport: smtpHost ? 'smtp' : 'console',
    smsTransport: smsUrl ? 'http' : 'console',
    smtp: smtpHost
      ? {
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT ?? '587', 10),
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
          from: process.env.SMTP_FROM ?? 'no-reply@speeddate.dev',
        }
      : undefined,
    smsEndpoint: smsUrl ? { url: smsUrl, apiKey: process.env.SMS_API_KEY } : undefined,
  });
}
