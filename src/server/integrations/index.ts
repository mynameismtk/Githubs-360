/**
 * External services.
 *
 * Every one of these is an interface plus a development adapter. The dev adapters are
 * honest — they say what would have happened rather than pretending it did. Each real
 * integration is marked `INTEGRATION POINT` so that `grep -rn "INTEGRATION POINT" src/`
 * lists exactly what still needs a vendor. docs/02 TD-5.
 */

// ─── SMS ─────────────────────────────────────────────────────────────────────

export interface SmsMessage {
  to: string
  body: string
  /** DLT template id — mandatory for transactional SMS in India. */
  templateId?: string
}

export interface SmsProvider {
  readonly name: string
  send(message: SmsMessage): Promise<{ providerRef: string }>
}

/**
 * Development transport. Prints where the message would have gone.
 * It never claims delivery, and it is refused outright in production.
 */
class ConsoleSmsProvider implements SmsProvider {
  readonly name = 'console'
  async send(message: SmsMessage) {
    console.info(`\n  ┌─ SMS (not actually sent — dev transport)\n  │  to:   ${message.to}\n  │  body: ${message.body}\n  └─\n`)
    return { providerRef: `dev_${Date.now()}` }
  }
}

// INTEGRATION POINT: implement SmsProvider against MSG91 / Gupshup / Twilio.
// Requires SMS_PROVIDER_KEY, SMS_SENDER_ID and DLT template registration.
export function getSmsProvider(): SmsProvider {
  const configured = process.env.SMS_PROVIDER ?? 'console'
  if (configured === 'console') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'SMS_PROVIDER is not configured. Refusing to run in production with the dev SMS transport.',
      )
    }
    return new ConsoleSmsProvider()
  }
  throw new Error(`SMS provider "${configured}" is not implemented yet. See src/server/integrations.`)
}

// ─── Email ───────────────────────────────────────────────────────────────────

export interface EmailMessage {
  to: string
  subject: string
  /** Deliberately plain text: emailed clinical content is a privacy surface. */
  body: string
}

export interface EmailProvider {
  readonly name: string
  send(message: EmailMessage): Promise<{ providerRef: string }>
}

class ConsoleEmailProvider implements EmailProvider {
  readonly name = 'console'
  async send(message: EmailMessage) {
    console.info(`[email:dev] to=${message.to} subject="${message.subject}"`)
    return { providerRef: `dev_${Date.now()}` }
  }
}

// INTEGRATION POINT: SES / Resend / Postmark.
export function getEmailProvider(): EmailProvider {
  return new ConsoleEmailProvider()
}

// ─── Push ────────────────────────────────────────────────────────────────────

export interface PushMessage {
  userId: string
  title: string
  /**
   * Push bodies are deliberately non-clinical. "Your report is ready" — never the result.
   * A lock-screen preview is visible to anyone holding the phone. Risk register R-16.
   */
  body: string
  deepLink?: string
}

export interface PushProvider {
  readonly name: string
  send(message: PushMessage): Promise<{ providerRef: string } | { skipped: true }>
}

class NoopPushProvider implements PushProvider {
  readonly name = 'noop'
  async send(): Promise<{ skipped: true }> {
    // In development the in-app notification row is still written by the notification
    // service; only the device delivery is skipped.
    return { skipped: true }
  }
}

// INTEGRATION POINT: FCM (Android/web) + APNs (iOS). Needs device-token registration.
export function getPushProvider(): PushProvider {
  return new NoopPushProvider()
}

// ─── Object storage ──────────────────────────────────────────────────────────

export interface StorageProvider {
  readonly name: string
  put(key: string, body: Buffer, contentType: string): Promise<void>
  get(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
}

/**
 * Local-disk adapter for development.
 *
 * The security-relevant property is preserved: files land outside `public/`, so there is
 * no route that serves them directly. Reads go through the same authorised download
 * handler that the S3 adapter will use. Only the byte source differs. docs/07 §4.
 */
class LocalDiskStorage implements StorageProvider {
  readonly name = 'local-disk'
  private root = process.env.STORAGE_LOCAL_PATH ?? '.storage'

  private async fs() {
    return import('node:fs/promises')
  }
  private async path() {
    return import('node:path')
  }

  private async resolve(key: string) {
    const path = await this.path()
    // Traversal guard: a crafted key must never escape the storage root.
    const safe = path.normalize(key).replace(/^(\.\.[/\\])+/, '')
    const full = path.resolve(this.root, safe)
    if (!full.startsWith(path.resolve(this.root))) throw new Error('Invalid storage key')
    return full
  }

  async put(key: string, body: Buffer) {
    const [fs, path] = [await this.fs(), await this.path()]
    const full = await this.resolve(key)
    await fs.mkdir(path.dirname(full), { recursive: true })
    await fs.writeFile(full, body)
  }

  async get(key: string) {
    const fs = await this.fs()
    return fs.readFile(await this.resolve(key))
  }

  async delete(key: string) {
    const fs = await this.fs()
    await fs.unlink(await this.resolve(key)).catch(() => undefined)
  }
}

// INTEGRATION POINT: S3 / MinIO. Server-side encryption on, bucket NOT public, and
// presigned URLs issued server-side only — never a bucket path sent to the browser.
export function getStorageProvider(): StorageProvider {
  return new LocalDiskStorage()
}

// ─── Payments ────────────────────────────────────────────────────────────────

export interface PaymentIntent {
  /** Our reference, so a webhook can be reconciled back to an invoice. */
  reference: string
  amountPaise: number
  currency: 'INR'
  patientName: string
  description: string
}

export interface PaymentIntentResult {
  providerRef: string
  /** Where to send the payer. Null for an offline/at-counter settlement. */
  redirectUrl: string | null
  status: 'PENDING' | 'SUCCEEDED'
}

export interface PaymentProvider {
  readonly name: string
  readonly supportsUpi: boolean
  createIntent(intent: PaymentIntent): Promise<PaymentIntentResult>
  /** Webhooks are never trusted without a signature check. */
  verifyWebhook(rawBody: string, signature: string): Promise<boolean>
}

/**
 * Development / at-the-counter adapter.
 *
 * This does NOT simulate a card charge. It records the real-world thing a clinic does
 * today: the patient pays at the desk and a staff member marks the invoice settled. That
 * is an honest behaviour rather than a fake one, and it stays useful in production as the
 * "cash at counter" method.
 */
class ManualPaymentProvider implements PaymentProvider {
  readonly name = 'manual'
  readonly supportsUpi = false
  async createIntent(intent: PaymentIntent): Promise<PaymentIntentResult> {
    return { providerRef: `manual_${intent.reference}`, redirectUrl: null, status: 'PENDING' }
  }
  async verifyWebhook(): Promise<boolean> {
    return false
  }
}

// INTEGRATION POINT: Razorpay / Cashfree / PhonePe for UPI collect + intent flows.
// Credentials come from PAYMENT_PROVIDER_KEY / PAYMENT_PROVIDER_SECRET. Never hardcoded,
// never sent to the client, and we never touch card or VPA data ourselves. Risk R-8.
export function getPaymentProvider(): PaymentProvider {
  return new ManualPaymentProvider()
}
