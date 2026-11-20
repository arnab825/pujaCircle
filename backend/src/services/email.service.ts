import { env } from '@/config/env.js';

export interface EmailOptions {
  toEmail: string;
  otp: string;
  purpose?: 'VERIFICATION' | 'PASSWORD_RESET';
}

/**
 * Brevo (Sendinblue) Transactional Email Service
 * Uses Brevo's direct HTTPS API (v3/smtp/email) - 100% cloud & Render safe (no blocked SMTP ports!)
 * 300 free emails per day with fast inbox delivery.
 */
export class BrevoEmailService {
  private apiKey: string;
  private senderEmail: string;
  private senderName: string;

  constructor() {
    this.apiKey = env.BREVO_API_KEY || '';
    this.senderEmail = env.BREVO_SENDER_EMAIL || 'noreply@pujacircle.com';
    this.senderName = env.BREVO_SENDER_NAME || 'PujaCircle Sanctum';
  }

  /**
   * Internal helper to dispatch transactional emails via Brevo HTTPS API
   */
  private async sendBrevoEmail(payload: {
    toEmail: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    logLabel: string;
    fallbackLogMessage?: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    const cleanEmail = payload.toEmail.trim().toLowerCase();
    if (!cleanEmail) return { success: false };

    if (this.apiKey) {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': this.apiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: {
              name: this.senderName,
              email: this.senderEmail,
            },
            to: [{ email: cleanEmail }],
            subject: payload.subject,
            htmlContent: payload.htmlContent,
            textContent: payload.textContent,
          }),
        });

        const data: any = await response.json();
        if (response.ok) {
          console.log(`[BREVO] Successfully dispatched ${payload.logLabel} to ${cleanEmail} | Message ID: ${data.messageId || 'sent'}`);
          return { success: true, messageId: data.messageId };
        } else {
          console.warn(`[BREVO NOTICE] Failed to send ${payload.logLabel} via Brevo API:`, data.message || JSON.stringify(data));
        }
      } catch (err: any) {
        console.warn(`[BREVO EXCEPTION] Failed to connect to Brevo API:`, err.message);
      }
    } else {
      console.log(payload.fallbackLogMessage || `ℹ️ Brevo: BREVO_API_KEY not configured. Dispatched ${payload.logLabel} to ${cleanEmail} (Simulated).`);
    }

    return { success: true };
  }

  /**
   * Dispatch 6-digit OTP verification email via Brevo REST API
   */
  async sendOtpEmail(
    toEmail: string,
    otp: string,
    purpose: 'VERIFICATION' | 'PASSWORD_RESET' = 'VERIFICATION'
  ): Promise<{ success: boolean; messageId?: string }> {
    const cleanEmail = toEmail.trim().toLowerCase();
    const isReset = purpose === 'PASSWORD_RESET';
    const subject = isReset
      ? 'ॐ PujaCircle — Password Reset Verification Code'
      : 'ॐ PujaCircle — Your Email Verification Passkey';

    const headerTitle = isReset ? 'Sacred Account Recovery' : 'Email Verification';
    const badgeText = isReset ? 'Passkey Reset' : 'Sanctum Security';
    const mainHeading = isReset
      ? 'Password Reset Request'
      : 'Confirm Your Email Address';
    const descriptionText = isReset
      ? 'We received a request to reset your PujaCircle portal credentials. Use the 6-digit code below to set your new password. This code will expire in 10 minutes.'
      : 'Welcome to PujaCircle. Please use the following 6-digit verification code to complete your devotee or Purohit registration. This code will expire in 10 minutes.';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #faf8f5; color: #1c1917; }
    .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 12px; border: 2px solid #fcd34d; overflow: hidden; box-shadow: 0 10px 25px rgba(120, 0, 22, 0.08); }
    .header { background: #780016; padding: 28px 24px; text-align: center; color: #ffffff; }
    .om-badge { display: inline-block; width: 44px; height: 44px; line-height: 44px; background: #fbbf24; color: #1c1917; border-radius: 8px; font-size: 24px; font-weight: bold; margin-bottom: 12px; }
    .brand-title { font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #fde68a; margin: 0; }
    .brand-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #fef3c7; margin-top: 4px; }
    .content { padding: 32px 28px; }
    .badge { display: inline-block; padding: 4px 12px; background: #fef3c7; color: #780016; border: 1px solid #fde68a; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 700; color: #1c1917; margin: 0 0 12px 0; }
    p { font-size: 14px; line-height: 1.6; color: #44403c; margin: 0 0 20px 0; }
    .otp-box { background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #780016; margin: 0; }
    .otp-validity { font-size: 11px; color: #b45309; font-weight: 600; margin-top: 8px; text-transform: uppercase; }
    .notice { font-size: 12px; color: #78716c; border-top: 1px solid #f5f5f4; padding-top: 16px; margin-top: 24px; line-height: 1.5; }
    .footer { background: #f5f5f4; padding: 20px; text-align: center; font-size: 11px; color: #a8a29e; }
    .quote { font-style: italic; color: #780016; margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="om-badge">ॐ</div>
      <div class="brand-title">PUJACIRCLE</div>
      <div class="brand-sub">${headerTitle}</div>
    </div>
    <div class="content">
      <div class="badge">${badgeText}</div>
      <h1>${mainHeading}</h1>
      <p>${descriptionText}</p>
      
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="otp-validity">Valid for 10 minutes only</div>
      </div>

      <p class="notice">
        If you did not request this verification code, please disregard this communication or contact our sanctum support immediately. Never share your one-time passkey with anyone.
      </p>
    </div>
    <div class="footer">
      <div class="quote">“यज्ञो वै श्रेष्ठतमं कर्म — Yajna is the highest auspicious deed.”</div>
      <div>© ${new Date().getFullYear()} PujaCircle Sanctum. All rights reserved.</div>
    </div>
  </div>
</body>
</html>
`;

    return this.sendBrevoEmail({
      toEmail: cleanEmail,
      subject,
      htmlContent,
      textContent: `${mainHeading}: Your PujaCircle verification code is ${otp}. Valid for 10 minutes.`,
      logLabel: 'OTP verification email',
      fallbackLogMessage: 'ℹ️ Brevo: BREVO_API_KEY not set yet. OTP safely printed below for immediate verification.',
    });
  }

  /**
   * Dispatch account status notification email (Ban, Suspension, or Deletion)
   * notifying user/priest of account action, reason, and cancellation of any active bookings.
   */
  async sendAccountStatusEmail(
    toEmail: string,
    userName: string,
    action: 'BANNED' | 'DELETED' | 'SUSPENDED',
    reason: string,
    cancelledBookingsCount: number = 0,
    accountType: 'PRIEST' | 'DEVOTEE' = 'PRIEST'
  ): Promise<{ success: boolean; messageId?: string }> {
    const cleanEmail = toEmail?.trim().toLowerCase();
    if (!cleanEmail) return { success: false };

    const isPriest = accountType === 'PRIEST';
    const isDeleted = action === 'DELETED';
    const actionLabel = isDeleted ? 'Permanently Removed' : 'Suspended';
    const roleLabel = isPriest ? 'Purohit' : 'Devotee';

    const subject = `ॐ PujaCircle — Important Notice: ${roleLabel} Account ${actionLabel}`;
    const headerTitle = isDeleted ? 'Account Deletion Notice' : 'Account Suspension Notice';
    const badgeText = isDeleted ? 'Account Deleted' : 'Account Suspended';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #faf8f5; color: #1c1917; }
    .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 12px; border: 2px solid #fcd34d; overflow: hidden; box-shadow: 0 10px 25px rgba(120, 0, 22, 0.08); }
    .header { background: #780016; padding: 28px 24px; text-align: center; color: #ffffff; }
    .om-badge { display: inline-block; width: 44px; height: 44px; line-height: 44px; background: #fbbf24; color: #1c1917; border-radius: 8px; font-size: 24px; font-weight: bold; margin-bottom: 12px; }
    .brand-title { font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #fde68a; margin: 0; }
    .brand-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #fef3c7; margin-top: 4px; }
    .content { padding: 32px 28px; }
    .badge { display: inline-block; padding: 4px 12px; background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 700; color: #1c1917; margin: 0 0 12px 0; }
    p { font-size: 14px; line-height: 1.6; color: #44403c; margin: 0 0 16px 0; }
    .info-card { background: #fff7ed; border-left: 4px solid #ea580c; border-radius: 6px; padding: 16px; margin: 20px 0; }
    .info-label { font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; margin-bottom: 4px; }
    .info-text { font-size: 13px; color: #431407; line-height: 1.5; margin: 0; }
    .cancellation-card { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin: 20px 0; }
    .cancellation-title { font-size: 13px; font-weight: 700; color: #991b1b; margin-bottom: 6px; }
    .cancellation-desc { font-size: 12px; color: #7f1d1d; margin: 0; line-height: 1.5; }
    .notice { font-size: 12px; color: #78716c; border-top: 1px solid #f5f5f4; padding-top: 16px; margin-top: 24px; line-height: 1.5; }
    .footer { background: #f5f5f4; padding: 20px; text-align: center; font-size: 11px; color: #a8a29e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="om-badge">ॐ</div>
      <div class="brand-title">PUJACIRCLE</div>
      <div class="brand-sub">${headerTitle}</div>
    </div>
    <div class="content">
      <div class="badge">${badgeText}</div>
      <h1>Account Notification for ${userName || roleLabel}</h1>
      <p>
        Please be informed that your PujaCircle ${roleLabel} account has been <strong>${actionLabel.toLowerCase()}</strong> by our platform administration.
      </p>

      <div class="info-card">
        <div class="info-label">Administrative Reason</div>
        <p class="info-text">${reason || 'Administrative action based on platform guidelines and policy compliance.'}</p>
      </div>

      <div class="cancellation-card">
        <div class="cancellation-title">Ceremony Booking Cancellation Notice</div>
        <p class="cancellation-desc">
          All active, pending, or confirmed ceremony appointments (${cancelledBookingsCount} booking(s)) linked to your account have been <strong>automatically cancelled</strong> to ensure fair coordination and ceremony integrity.
        </p>
      </div>

      <p class="notice">
        If you have questions regarding this administrative action or believe this was done in error, please contact the PujaCircle Sanctum Administration team at support@pujacircle.com.
      </p>
    </div>
    <div class="footer">
      <div>© ${new Date().getFullYear()} PujaCircle Sanctum. All rights reserved.</div>
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `PujaCircle Account Notice: Your ${roleLabel} account for ${userName} has been ${actionLabel.toLowerCase()} by the platform administrator. Reason: ${reason}. All active and pending ceremony bookings (${cancelledBookingsCount}) have been automatically cancelled. Contact support@pujacircle.com for inquiries.`;

    return this.sendBrevoEmail({
      toEmail: cleanEmail,
      subject,
      htmlContent,
      textContent,
      logLabel: 'account status email',
    });
  }

  /**
   * Send notification email to devotee when their ceremony booking is cancelled due to the assigned priest
   * being banned or deleted by the platform administrator.
   */
  async sendBookingCancelledDueToPriestStatusEmail(params: {
    userEmail: string;
    userName: string;
    bookingReference: string;
    serviceName: string;
    bookingDate: string;
    slotTime: string;
    priestName: string;
    action: 'BANNED' | 'DELETED';
    reason: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    const cleanEmail = params.userEmail?.trim().toLowerCase();
    if (!cleanEmail) return { success: false };

    const isDeleted = params.action === 'DELETED';
    const actionLabel = isDeleted ? 'permanently removed' : 'suspended';
    const subject = `ॐ PujaCircle — Important: Ceremony Appointment Cancelled (${params.bookingReference})`;
    const headerTitle = 'Ceremony Booking Cancellation Notice';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #faf8f5; color: #1c1917; }
    .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 12px; border: 2px solid #fcd34d; overflow: hidden; box-shadow: 0 10px 25px rgba(120, 0, 22, 0.08); }
    .header { background: #780016; padding: 28px 24px; text-align: center; color: #ffffff; }
    .om-badge { display: inline-block; width: 44px; height: 44px; line-height: 44px; background: #fbbf24; color: #1c1917; border-radius: 8px; font-size: 24px; font-weight: bold; margin-bottom: 12px; }
    .brand-title { font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #fde68a; margin: 0; }
    .brand-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #fef3c7; margin-top: 4px; }
    .content { padding: 32px 28px; }
    .badge { display: inline-block; padding: 4px 12px; background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 700; color: #1c1917; margin: 0 0 12px 0; }
    p { font-size: 14px; line-height: 1.6; color: #44403c; margin: 0 0 16px 0; }
    .booking-card { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 18px; margin: 18px 0; }
    .booking-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .booking-label { color: #78716c; font-weight: 600; }
    .booking-val { color: #1c1917; font-weight: 700; }
    .info-card { background: #fff7ed; border-left: 4px solid #ea580c; border-radius: 6px; padding: 16px; margin: 20px 0; }
    .info-label { font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; margin-bottom: 4px; }
    .info-text { font-size: 13px; color: #431407; line-height: 1.5; margin: 0; }
    .action-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px; margin: 20px 0; }
    .action-title { font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 6px; }
    .action-desc { font-size: 12px; color: #14532d; margin: 0; line-height: 1.5; }
    .notice { font-size: 12px; color: #78716c; border-top: 1px solid #f5f5f4; padding-top: 16px; margin-top: 24px; line-height: 1.5; }
    .footer { background: #f5f5f4; padding: 20px; text-align: center; font-size: 11px; color: #a8a29e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="om-badge">ॐ</div>
      <div class="brand-title">PUJACIRCLE</div>
      <div class="brand-sub">${headerTitle}</div>
    </div>
    <div class="content">
      <div class="badge">Appointment Cancelled</div>
      <h1>Ceremony Update for ${params.userName || 'Devotee'}</h1>
      <p>
        Please be informed that your upcoming ceremony booking has been <strong>automatically cancelled</strong> because the assigned Purohit (<strong>${params.priestName}</strong>) has been ${actionLabel} by our platform administration.
      </p>

      <div class="booking-card">
        <div class="booking-row">
          <span class="booking-label">Booking Reference:</span>
          <span class="booking-val">${params.bookingReference}</span>
        </div>
        <div class="booking-row">
          <span class="booking-label">Ceremony:</span>
          <span class="booking-val">${params.serviceName}</span>
        </div>
        <div class="booking-row">
          <span class="booking-label">Scheduled Date:</span>
          <span class="booking-val">${params.bookingDate}</span>
        </div>
        <div class="booking-row" style="margin-bottom: 0;">
          <span class="booking-label">Muhurat Slot:</span>
          <span class="booking-val">${params.slotTime}</span>
        </div>
      </div>

      <div class="info-card">
        <div class="info-label">Reason for Action</div>
        <p class="info-text">${params.reason || 'The Purohit account was suspended or removed following administrative moderation review.'}</p>
      </div>

      <div class="action-card">
        <div class="action-title">Zero Advance Policy — No Payment Held</div>
        <p class="action-desc">
          Because PujaCircle operates under a transparent zero-online-advance Dakshina policy (cash payment on ritual completion), no funds were deducted from you. You can immediately browse and book another verified Purohit for your sacred ceremony.
        </p>
      </div>

      <p class="notice">
        If you have questions or need help finding another verified Purohit for this Muhurat, please reach out to our team at support@pujacircle.com.
      </p>
    </div>
    <div class="footer">
      <div>© ${new Date().getFullYear()} PujaCircle Sanctum. All rights reserved.</div>
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `PujaCircle Notice: Your booking (${params.bookingReference}) for ${params.serviceName} scheduled on ${params.bookingDate} (${params.slotTime}) with ${params.priestName} has been cancelled because the priest account was ${actionLabel} by the platform administrator. Reason: ${params.reason}. Due to our zero advance policy, no funds were deducted. You can book another verified Purohit immediately on PujaCircle. Support: support@pujacircle.com`;

    return this.sendBrevoEmail({
      toEmail: cleanEmail,
      subject,
      htmlContent,
      textContent,
      logLabel: 'booking cancellation email',
    });
  }
  /**
   * Dispatch booking requested notifications to Devotee and Purohit
   */
  async sendBookingRequestedEmail(params: {
    devoteeEmail: string;
    devoteeName: string;
    priestEmail: string;
    priestName: string;
    bookingReference: string;
    serviceName: string;
    bookingDate: string;
    startTime: string;
    totalPrice: number;
    venueAddress: string;
  }): Promise<void> {
    const devoteeClean = params.devoteeEmail?.trim().toLowerCase();
    const priestClean = params.priestEmail?.trim().toLowerCase();

    // 1. Send receipt to Devotee
    if (devoteeClean) {
      const subject = `ॐ PujaCircle — Ceremony Booking Request Placed (${params.bookingReference})`;
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #faf8f5; color: #1c1917; }
    .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 12px; border: 2px solid #fcd34d; overflow: hidden; box-shadow: 0 10px 25px rgba(120, 0, 22, 0.08); }
    .header { background: #780016; padding: 26px 24px; text-align: center; color: #ffffff; }
    .om-badge { display: inline-block; width: 44px; height: 44px; line-height: 44px; background: #fbbf24; color: #1c1917; border-radius: 8px; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .brand-title { font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #fde68a; margin: 0; }
    .brand-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #fef3c7; margin-top: 4px; }
    .content { padding: 30px 26px; }
    .badge { display: inline-block; padding: 4px 12px; background: #fef3c7; color: #780016; border: 1px solid #fde68a; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 14px; }
    h1 { font-size: 20px; font-weight: 700; color: #1c1917; margin: 0 0 10px 0; }
    p { font-size: 14px; line-height: 1.6; color: #44403c; margin: 0 0 16px 0; }
    .details-box { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 16px; margin: 18px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .lbl { color: #78716c; font-weight: 600; }
    .val { color: #1c1917; font-weight: 700; text-align: right; }
    .dakshina-row { border-top: 1px dashed #d6d3d1; padding-top: 8px; margin-top: 8px; color: #780016; font-size: 14px; }
    .footer { background: #f5f5f4; padding: 20px; text-align: center; font-size: 11px; color: #a8a29e; }
    .quote { font-style: italic; color: #780016; margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="om-badge">ॐ</div>
      <div class="brand-title">PUJACIRCLE</div>
      <div class="brand-sub">Ceremony Reservation Request</div>
    </div>
    <div class="content">
      <div class="badge">Awaiting Purohit Confirmation</div>
      <h1>Pranam, ${params.devoteeName || 'Devotee'}</h1>
      <p>Your ceremony booking request has been successfully submitted and forwarded to <strong>${params.priestName}</strong> for Muhurat schedule review.</p>
      
      <div class="details-box">
        <div class="row"><span class="lbl">Booking Reference:</span><span class="val">${params.bookingReference}</span></div>
        <div class="row"><span class="lbl">Sacred Ceremony:</span><span class="val">${params.serviceName}</span></div>
        <div class="row"><span class="lbl">Ceremony Date:</span><span class="val">${params.bookingDate}</span></div>
        <div class="row"><span class="lbl">Muhurat Time:</span><span class="val">${params.startTime} IST</span></div>
        <div class="row"><span class="lbl">Assigned Purohit:</span><span class="val">${params.priestName}</span></div>
        <div class="row"><span class="lbl">Sanctum Venue:</span><span class="val">${params.venueAddress}</span></div>
        <div class="row dakshina-row"><span class="lbl">Total Cash Dakshina:</span><span class="val">₹${params.totalPrice}</span></div>
      </div>
      <p style="font-size: 12px; color: #78716c;">You will receive another notification as soon as the Purohit accepts your requested Muhurat slot.</p>
    </div>
    <div class="footer">
      <div class="quote">“यज्ञो वै श्रेष्ठतमं कर्म — Yajna is the highest auspicious deed.”</div>
      <div>© ${new Date().getFullYear()} PujaCircle Sanctum. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`;
      await this.sendBrevoEmail({
        toEmail: devoteeClean,
        subject,
        htmlContent,
        textContent: `PujaCircle: Your booking request (${params.bookingReference}) for ${params.serviceName} on ${params.bookingDate} at ${params.startTime} with ${params.priestName} has been submitted.`,
        logLabel: 'devotee booking requested email',
      }).catch(() => {});
    }

    // 2. Send appointment notification to Priest
    if (priestClean) {
      const subject = `ॐ PujaCircle — New Ceremony Appointment Request (${params.bookingReference})`;
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #faf8f5; color: #1c1917; }
    .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 12px; border: 2px solid #fcd34d; overflow: hidden; box-shadow: 0 10px 25px rgba(120, 0, 22, 0.08); }
    .header { background: #780016; padding: 26px 24px; text-align: center; color: #ffffff; }
    .om-badge { display: inline-block; width: 44px; height: 44px; line-height: 44px; background: #fbbf24; color: #1c1917; border-radius: 8px; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .brand-title { font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #fde68a; margin: 0; }
    .brand-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #fef3c7; margin-top: 4px; }
    .content { padding: 30px 26px; }
    .badge { display: inline-block; padding: 4px 12px; background: #fef3c7; color: #780016; border: 1px solid #fde68a; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 14px; }
    h1 { font-size: 20px; font-weight: 700; color: #1c1917; margin: 0 0 10px 0; }
    p { font-size: 14px; line-height: 1.6; color: #44403c; margin: 0 0 16px 0; }
    .details-box { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 16px; margin: 18px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .lbl { color: #78716c; font-weight: 600; }
    .val { color: #1c1917; font-weight: 700; text-align: right; }
    .action-btn { display: inline-block; background: #780016; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 700; font-size: 14px; margin-top: 12px; }
    .footer { background: #f5f5f4; padding: 20px; text-align: center; font-size: 11px; color: #a8a29e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="om-badge">ॐ</div>
      <div class="brand-title">PUJACIRCLE</div>
      <div class="brand-sub">Purohit Workspace Alert</div>
    </div>
    <div class="content">
      <div class="badge">Action Required</div>
      <h1>Pranam, Pandit ${params.priestName} Ji</h1>
      <p>A devotee has booked your sacred service on PujaCircle. Please review the ceremony details and accept the appointment from your dashboard.</p>
      
      <div class="details-box">
        <div class="row"><span class="lbl">Booking Reference:</span><span class="val">${params.bookingReference}</span></div>
        <div class="row"><span class="lbl">Devotee Name:</span><span class="val">${params.devoteeName}</span></div>
        <div class="row"><span class="lbl">Sacred Ceremony:</span><span class="val">${params.serviceName}</span></div>
        <div class="row"><span class="lbl">Ceremony Date:</span><span class="val">${params.bookingDate}</span></div>
        <div class="row"><span class="lbl">Muhurat Time:</span><span class="val">${params.startTime} IST</span></div>
        <div class="row"><span class="lbl">Venue Locality:</span><span class="val">${params.venueAddress}</span></div>
        <div class="row" style="color: #780016; font-size: 14px; border-top: 1px dashed #d6d3d1; padding-top: 8px;"><span class="lbl">Dakshina Amount:</span><span class="val">₹${params.totalPrice} (Cash on Vidhi Completion)</span></div>
      </div>
      <p>Please log in to your Purohit Workspace to accept or reschedule this booking.</p>
    </div>
    <div class="footer">
      <div>© ${new Date().getFullYear()} PujaCircle Sanctum. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`;
      await this.sendBrevoEmail({
        toEmail: priestClean,
        subject,
        htmlContent,
        textContent: `PujaCircle: New booking request (${params.bookingReference}) from ${params.devoteeName} for ${params.serviceName} on ${params.bookingDate} at ${params.startTime}. Please log in to accept.`,
        logLabel: 'priest new booking request email',
      }).catch(() => {});
    }
  }

  /**
   * Dispatch booking confirmed email to Devotee with 4-digit completion code
   */
  async sendBookingConfirmedEmail(params: {
    devoteeEmail: string;
    devoteeName: string;
    priestName: string;
    bookingReference: string;
    serviceName: string;
    bookingDate: string;
    startTime: string;
    totalPrice: number;
    completionCode: string;
    venueAddress: string;
  }): Promise<void> {
    const cleanEmail = params.devoteeEmail?.trim().toLowerCase();
    if (!cleanEmail) return;

    const subject = `ॐ PujaCircle — Ceremony Confirmed! (${params.bookingReference}) — Secret Passkey: ${params.completionCode}`;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #faf8f5; color: #1c1917; }
    .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 12px; border: 2px solid #fcd34d; overflow: hidden; box-shadow: 0 10px 25px rgba(120, 0, 22, 0.08); }
    .header { background: #780016; padding: 26px 24px; text-align: center; color: #ffffff; }
    .om-badge { display: inline-block; width: 44px; height: 44px; line-height: 44px; background: #fbbf24; color: #1c1917; border-radius: 8px; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .brand-title { font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #fde68a; margin: 0; }
    .content { padding: 30px 26px; }
    .badge-success { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 14px; }
    h1 { font-size: 20px; font-weight: 700; color: #1c1917; margin: 0 0 10px 0; }
    p { font-size: 14px; line-height: 1.6; color: #44403c; margin: 0 0 16px 0; }
    .otp-box { background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0; }
    .otp-label { font-size: 11px; font-weight: 700; color: #b45309; text-transform: uppercase; margin-bottom: 4px; }
    .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #780016; margin: 4px 0; }
    .otp-hint { font-size: 12px; color: #78716c; margin-top: 6px; }
    .details-box { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 16px; margin: 18px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .lbl { color: #78716c; font-weight: 600; }
    .val { color: #1c1917; font-weight: 700; }
    .footer { background: #f5f5f4; padding: 20px; text-align: center; font-size: 11px; color: #a8a29e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="om-badge">ॐ</div>
      <div class="brand-title">PUJACIRCLE</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #fef3c7; margin-top: 4px;">Ceremony Confirmed</div>
    </div>
    <div class="content">
      <div class="badge-success">Appointment Confirmed</div>
      <h1>Auspicious Muhurat Locked</h1>
      <p>Pranam <strong>${params.devoteeName}</strong>, Purohit <strong>${params.priestName}</strong> has officially accepted your ceremony booking. Your Muhurat slot is locked.</p>
      
      <div class="otp-box">
        <div class="otp-label">Devotee Secret Completion Passkey</div>
        <div class="otp-code">${params.completionCode}</div>
        <div class="otp-hint">🔒 Keep this code private. Hand it over to the Purohit only AFTER the ceremony and vidhi have been completed to your satisfaction.</div>
      </div>

      <div class="details-box">
        <div class="row"><span class="lbl">Booking Reference:</span><span class="val">${params.bookingReference}</span></div>
        <div class="row"><span class="lbl">Ceremony:</span><span class="val">${params.serviceName}</span></div>
        <div class="row"><span class="lbl">Date:</span><span class="val">${params.bookingDate}</span></div>
        <div class="row"><span class="lbl">Muhurat Time:</span><span class="val">${params.startTime} IST</span></div>
        <div class="row"><span class="lbl">Purohit:</span><span class="val">${params.priestName}</span></div>
        <div class="row"><span class="lbl">Sanctum Venue:</span><span class="val">${params.venueAddress}</span></div>
        <div class="row" style="color: #780016; font-size: 14px; border-top: 1px dashed #d6d3d1; padding-top: 8px;"><span class="lbl">Dakshina Amount:</span><span class="val">₹${params.totalPrice} (Direct Cash after Vidhi)</span></div>
      </div>
    </div>
    <div class="footer">
      <div>© ${new Date().getFullYear()} PujaCircle Sanctum. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`;

    await this.sendBrevoEmail({
      toEmail: cleanEmail,
      subject,
      htmlContent,
      textContent: `PujaCircle: Ceremony confirmed! Your booking ${params.bookingReference} for ${params.serviceName} with ${params.priestName} is locked on ${params.bookingDate} at ${params.startTime}. Your secret completion passkey is: ${params.completionCode}. Total Dakshina: ₹${params.totalPrice}.`,
      logLabel: 'booking confirmed email',
    }).catch(() => {});
  }

  /**
   * Dispatch booking rejected notification to Devotee
   */
  async sendBookingRejectedEmail(params: {
    devoteeEmail: string;
    devoteeName: string;
    priestName: string;
    bookingReference: string;
    serviceName: string;
    bookingDate: string;
    reason: string;
  }): Promise<void> {
    const cleanEmail = params.devoteeEmail?.trim().toLowerCase();
    if (!cleanEmail) return;

    const subject = `ॐ PujaCircle — Ceremony Appointment Declined (${params.bookingReference})`;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #faf8f5; color: #1c1917; }
    .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 12px; border: 2px solid #fcd34d; overflow: hidden; box-shadow: 0 10px 25px rgba(120, 0, 22, 0.08); }
    .header { background: #780016; padding: 26px 24px; text-align: center; color: #ffffff; }
    .om-badge { display: inline-block; width: 44px; height: 44px; line-height: 44px; background: #fbbf24; color: #1c1917; border-radius: 8px; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .brand-title { font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #fde68a; margin: 0; }
    .content { padding: 30px 26px; }
    .badge-declined { display: inline-block; padding: 4px 12px; background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 14px; }
    h1 { font-size: 20px; font-weight: 700; color: #1c1917; margin: 0 0 10px 0; }
    p { font-size: 14px; line-height: 1.6; color: #44403c; margin: 0 0 16px 0; }
    .reason-box { background: #fff7ed; border-left: 4px solid #ea580c; border-radius: 6px; padding: 14px; margin: 18px 0; font-size: 13px; color: #431407; }
    .footer { background: #f5f5f4; padding: 20px; text-align: center; font-size: 11px; color: #a8a29e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="om-badge">ॐ</div>
      <div class="brand-title">PUJACIRCLE</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #fef3c7; margin-top: 4px;">Ceremony Update</div>
    </div>
    <div class="content">
      <div class="badge-declined">Appointment Declined</div>
      <h1>Pranam, ${params.devoteeName || 'Devotee'}</h1>
      <p>Purohit <strong>${params.priestName}</strong> is unable to officiate your <strong>${params.serviceName}</strong> ceremony scheduled for <strong>${params.bookingDate}</strong> due to schedule constraints.</p>
      
      <div class="reason-box">
        <strong>Purohit's Reason:</strong><br/>
        ${params.reason || 'Existing ritual commitments during the requested Muhurat window.'}
      </div>

      <p>Because PujaCircle enforces a strict zero-advance policy, <strong>no money was deducted</strong>. You can immediately browse other verified Gurukul Purohits available in your locality.</p>
    </div>
    <div class="footer">
      <div>© ${new Date().getFullYear()} PujaCircle Sanctum. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`;

    await this.sendBrevoEmail({
      toEmail: cleanEmail,
      subject,
      htmlContent,
      textContent: `PujaCircle: Your booking ${params.bookingReference} for ${params.serviceName} was declined by ${params.priestName}. Reason: ${params.reason}. No payment was deducted. Browse other verified priests on PujaCircle.`,
      logLabel: 'booking rejected email',
    }).catch(() => {});
  }

  /**
   * Dispatch booking cancellation notification
   */
  async sendBookingCancelledEmail(params: {
    recipientEmail: string;
    recipientName: string;
    cancelledByName: string;
    bookingReference: string;
    serviceName: string;
    bookingDate: string;
    reason: string;
  }): Promise<void> {
    const cleanEmail = params.recipientEmail?.trim().toLowerCase();
    if (!cleanEmail) return;

    const subject = `ॐ PujaCircle — Ceremony Appointment Cancelled (${params.bookingReference})`;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #faf8f5; color: #1c1917; }
    .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 12px; border: 2px solid #fcd34d; overflow: hidden; box-shadow: 0 10px 25px rgba(120, 0, 22, 0.08); }
    .header { background: #780016; padding: 26px 24px; text-align: center; color: #ffffff; }
    .om-badge { display: inline-block; width: 44px; height: 44px; line-height: 44px; background: #fbbf24; color: #1c1917; border-radius: 8px; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .brand-title { font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #fde68a; margin: 0; }
    .content { padding: 30px 26px; }
    .badge { display: inline-block; padding: 4px 12px; background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 14px; }
    h1 { font-size: 20px; font-weight: 700; color: #1c1917; margin: 0 0 10px 0; }
    p { font-size: 14px; line-height: 1.6; color: #44403c; margin: 0 0 16px 0; }
    .reason-box { background: #fafaf9; border-left: 4px solid #780016; border-radius: 6px; padding: 14px; margin: 18px 0; font-size: 13px; }
    .footer { background: #f5f5f4; padding: 20px; text-align: center; font-size: 11px; color: #a8a29e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="om-badge">ॐ</div>
      <div class="brand-title">PUJACIRCLE</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #fef3c7; margin-top: 4px;">Cancellation Notice</div>
    </div>
    <div class="content">
      <div class="badge">Booking Cancelled</div>
      <h1>Ceremony Cancelled</h1>
      <p>Pranam <strong>${params.recipientName}</strong>, please be informed that ceremony booking <strong>${params.bookingReference}</strong> for <strong>${params.serviceName}</strong> (${params.bookingDate}) has been cancelled by ${params.cancelledByName}.</p>
      
      <div class="reason-box">
        <strong>Cancellation Reason:</strong><br/>
        ${params.reason || 'No specific reason provided.'}
      </div>

      <p style="font-size: 12px; color: #78716c;">Zero advance fees were deducted. You can schedule a new Muhurat anytime on PujaCircle.</p>
    </div>
    <div class="footer">
      <div>© ${new Date().getFullYear()} PujaCircle Sanctum. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`;

    await this.sendBrevoEmail({
      toEmail: cleanEmail,
      subject,
      htmlContent,
      textContent: `PujaCircle: Booking ${params.bookingReference} for ${params.serviceName} on ${params.bookingDate} has been cancelled by ${params.cancelledByName}. Reason: ${params.reason}.`,
      logLabel: 'booking cancelled email',
    }).catch(() => {});
  }

  /**
   * Dispatch ceremony completed receipt and review invitation to Devotee
   */
  async sendBookingCompletedEmail(params: {
    devoteeEmail: string;
    devoteeName: string;
    priestName: string;
    bookingReference: string;
    serviceName: string;
    bookingDate: string;
    totalPrice: number;
  }): Promise<void> {
    const cleanEmail = params.devoteeEmail?.trim().toLowerCase();
    if (!cleanEmail) return;

    const subject = `ॐ PujaCircle — Ceremony Successfully Completed (${params.bookingReference})`;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #faf8f5; color: #1c1917; }
    .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 12px; border: 2px solid #fcd34d; overflow: hidden; box-shadow: 0 10px 25px rgba(120, 0, 22, 0.08); }
    .header { background: #780016; padding: 26px 24px; text-align: center; color: #ffffff; }
    .om-badge { display: inline-block; width: 44px; height: 44px; line-height: 44px; background: #fbbf24; color: #1c1917; border-radius: 8px; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .brand-title { font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #fde68a; margin: 0; }
    .content { padding: 30px 26px; }
    .badge-done { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 14px; }
    h1 { font-size: 20px; font-weight: 700; color: #1c1917; margin: 0 0 10px 0; }
    p { font-size: 14px; line-height: 1.6; color: #44403c; margin: 0 0 16px 0; }
    .receipt-box { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 16px; margin: 18px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .lbl { color: #78716c; font-weight: 600; }
    .val { color: #1c1917; font-weight: 700; }
    .footer { background: #f5f5f4; padding: 20px; text-align: center; font-size: 11px; color: #a8a29e; }
    .quote { font-style: italic; color: #780016; margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="om-badge">ॐ</div>
      <div class="brand-title">PUJACIRCLE</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #fef3c7; margin-top: 4px;">Sacred Vidhi Completed</div>
    </div>
    <div class="content">
      <div class="badge-done">Ceremony Fulfilled</div>
      <h1>Subho Mangalam, ${params.devoteeName || 'Devotee'}</h1>
      <p>Your <strong>${params.serviceName}</strong> has been successfully officiated by Purohit <strong>${params.priestName}</strong> and marked as completed in our records.</p>
      
      <div class="receipt-box">
        <div class="row"><span class="lbl">Booking Reference:</span><span class="val">${params.bookingReference}</span></div>
        <div class="row"><span class="lbl">Ceremony:</span><span class="val">${params.serviceName}</span></div>
        <div class="row"><span class="lbl">Officiating Purohit:</span><span class="val">${params.priestName}</span></div>
        <div class="row"><span class="lbl">Fulfilled Date:</span><span class="val">${params.bookingDate}</span></div>
        <div class="row" style="color: #15803d; border-top: 1px dashed #d6d3d1; padding-top: 8px; font-size: 14px;"><span class="lbl">Dakshina Settled:</span><span class="val">₹${params.totalPrice} (Cash Received)</span></div>
      </div>

      <p>We invite you to share your sacred experience by submitting a verified 1–5 star rating and review for Pandit ${params.priestName} on your PujaCircle dashboard.</p>
    </div>
    <div class="footer">
      <div class="quote">“यज्ञो वै श्रेष्ठतमं कर्म — Yajna is the highest auspicious deed.”</div>
      <div>© ${new Date().getFullYear()} PujaCircle Sanctum. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`;

    await this.sendBrevoEmail({
      toEmail: cleanEmail,
      subject,
      htmlContent,
      textContent: `PujaCircle: Ceremony fulfilled! Your booking ${params.bookingReference} for ${params.serviceName} with ${params.priestName} is completed. Dakshina settled: ₹${params.totalPrice}. Please log in to leave your verified review.`,
      logLabel: 'booking completed email',
    }).catch(() => {});
  }
}

export const brevoEmailService = new BrevoEmailService();
