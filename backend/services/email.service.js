class EmailService {
  static async sendEmail({ to, subject, html }) {
    console.log("==================================================");
    console.log(`[EMAIL SEND] To: ${to}`);
    console.log(`[EMAIL SEND] Subject: ${subject}`);
    console.log(`[EMAIL SEND] HTML Content:\n${html}`);
    console.log("==================================================");

    // Production SMTP transporter fallback integration:
    // if (process.env.SMTP_HOST) {
    //   const nodemailer = await import("nodemailer");
    //   const transporter = nodemailer.createTransport({
    //     host: process.env.SMTP_HOST,
    //     port: process.env.SMTP_PORT || 587,
    //     secure: process.env.SMTP_SECURE === "true",
    //     auth: {
    //       user: process.env.SMTP_USER,
    //       pass: process.env.SMTP_PASS
    //     }
    //   });
    //   await transporter.sendMail({
    //     from: '"Strategix AI Billing" <billing@strategix.ai>',
    //     to,
    //     subject,
    //     html
    //   });
    // }

    return true;
  }

  static async sendInvoiceEmail(to, customerName, invoiceNumber, total) {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Payment Receipt</h2>
        <p>Dear ${customerName},</p>
        <p>Thank you for choosing <strong>Strategix AI</strong>. We have successfully processed your billing renewal.</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <strong>Invoice Number:</strong> ${invoiceNumber}<br/>
          <strong>Total Charged:</strong> INR ${total} (GST Included)<br/>
          <strong>Status:</strong> Paid / Captured
        </div>
        <p>You can view and download your full printable GST invoice anytime under the Settings > Subscription tab in your dashboard.</p>
        <p>If you have any questions, please contact billing@strategix.ai.</p>
        <br/>
        <p>Best regards,<br/>The Strategix AI Team</p>
      </div>
    `;
    return await EmailService.sendEmail({
      to,
      subject: `Your Invoice ${invoiceNumber} from Strategix AI`,
      html,
    });
  }

  static async sendSubscriptionFailedEmail(to, customerName, planName) {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Billing Payment Failed</h2>
        <p>Dear ${customerName},</p>
        <p>We attempted to renew your subscription for the <strong>${planName.toUpperCase()} Plan</strong>, but the transaction could not be completed.</p>
        <p>Please update your billing card and payment parameters to avoid access suspension.</p>
        <br/>
        <p>Best regards,<br/>The Strategix AI Team</p>
      </div>
    `;
    return await EmailService.sendEmail({
      to,
      subject: "Action Required: Billing Payment Failed",
      html,
    });
  }
}

export default EmailService;
