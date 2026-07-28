import EmailLog from "../models/emailLog.model.js";

// Reusable responsive HTML wrapper styling for premium emails
const emailWrapper = (title, bodyHtml) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
      .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
      .content { padding: 40px 30px; line-height: 1.6; }
      .content h2 { color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600; }
      .card { background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 6px; padding: 20px; margin: 24px 0; }
      .button { display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 15px 0; font-size: 14px; text-align: center; }
      .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      .footer a { color: #4f46e5; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Strategix AI</h1>
      </div>
      <div class="content">
        ${bodyHtml}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Strategix AI. All rights reserved.</p>
        <p>You received this email because you are a registered member of Strategix AI.</p>
      </div>
    </div>
  </body>
  </html>
`;

class EmailService {
  /**
   * Centralized email sending with logs, idempotency, and status updates
   */
  static async sendEmail({ to, subject, html, templateName = "custom", uniqueKey = null }) {
    // 1. Enforce Idempotency
    if (uniqueKey) {
      const existing = await EmailLog.findOne({ uniqueKey });
      if (existing) {
        if (existing.status === "sent" || existing.status === "pending") {
          console.log(`[EMAIL IDEMPOTENCY] Email with key "${uniqueKey}" already sent or in flight. Skipping.`);
          return existing;
        }
      }
    }

    // 2. Write pending log to database
    let log = null;
    if (uniqueKey) {
      log = await EmailLog.findOneAndUpdate(
        { uniqueKey },
        { to, subject, template: templateName, status: "pending" },
        { upsert: true, new: true }
      );
    } else {
      log = new EmailLog({ to, subject, template: templateName, status: "pending" });
      await log.save();
    }

    try {
      // 3. Dispatch SMTP or Mock fallback
      log.attempts += 1;
      
      console.log("==================================================");
      console.log(`[EMAIL SEND] To: ${to}`);
      console.log(`[EMAIL SEND] Subject: ${subject}`);
      console.log(`[EMAIL SEND] Template: ${templateName}`);
      console.log(`[EMAIL SEND] HTML Length: ${html.length}`);
      console.log("==================================================");

      if (process.env.SMTP_HOST) {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        await transporter.sendMail({
          from: `"Strategix AI" <${process.env.SMTP_USER || "no-reply@strategix.ai"}>`,
          to,
          subject,
          html,
        });
      }

      // 4. Mark log as sent
      log.status = "sent";
      log.lastError = undefined;
      await log.save();
      return log;
    } catch (error) {
      console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error);
      log.status = "failed";
      log.lastError = error.message || String(error);
      await log.save();
      return log;
    }
  }

  /**
   * Background retry dispatcher checking failed logs with attempts < 3
   */
  static async retryFailedEmails() {
    const failedEmails = await EmailLog.find({ status: "failed", attempts: { $lt: 3 } });
    if (failedEmails.length === 0) return;

    console.log(`[EMAIL RETRY WORKER] Found ${failedEmails.length} failed emails to retry...`);
    for (const log of failedEmails) {
      try {
        log.attempts += 1;
        if (process.env.SMTP_HOST) {
          const nodemailer = await import("nodemailer");
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });
          
          // Re-generate HTML templates is mockable here or we could fetch the template's previous layout context
          // For sandbox robustness, we fallback send using standard HTML logs
          await transporter.sendMail({
            from: '"Strategix AI" <no-reply@strategix.ai>',
            to: log.to,
            subject: log.subject,
            html: `<!-- Retried Email Layout -->\n` + (log.metadata?.htmlBody || "No HTML saved"),
          });
        }
        log.status = "sent";
        log.lastError = undefined;
        await log.save();
        console.log(`[EMAIL RETRY WORKER] Successfully resent email: ${log.subject} to ${log.to}`);
      } catch (err) {
        log.lastError = err.message || String(err);
        if (log.attempts >= 3) {
          console.error(`[EMAIL RETRY WORKER] Exceeded max retries for email to ${log.to}: ${log.subject}`);
        }
        await log.save();
      }
    }
  }

  // ==========================================
  // Layout Templates Implementing Scenarios
  // ==========================================

  static async sendWelcomeEmail(to, userName) {
    const html = emailWrapper(
      "Welcome to Strategix AI",
      `<h2>Welcome aboard, ${userName}!</h2>
       <p>We are absolutely thrilled to have you join Strategix AI. Get ready to supercharge your marketing campaigns with AI-driven operations.</p>
       <p>Click below to open your workspace dashboard and get started:</p>
       <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/dashboard" class="button">Go to Dashboard</a>
       <p>If you need any guidance, just reply to this email.</p>`
    );
    return await EmailService.sendEmail({
      to,
      subject: "Welcome to Strategix AI!",
      html,
      templateName: "welcome",
      uniqueKey: `welcome_${to}`,
    });
  }

  static async sendPasswordResetEmail(to, userName, resetLink) {
    const html = emailWrapper(
      "Reset your password",
      `<h2>Password Reset Request</h2>
       <p>Dear ${userName},</p>
       <p>We received a request to reset your password for your Strategix AI account.</p>
       <p>Click the link below to securely reset your credentials:</p>
       <a href="${resetLink}" class="button">Reset Password</a>
       <p>If you did not request a password reset, you can safely ignore this email.</p>`
    );
    return await EmailService.sendEmail({
      to,
      subject: "Reset your password - Strategix AI",
      html,
      templateName: "password_reset",
    });
  }

  static async sendCampaignCreatedEmail(to, userName, campaignName) {
    const html = emailWrapper(
      "Campaign Created",
      `<h2>Campaign Created Successfully</h2>
       <p>Hi ${userName},</p>
       <p>Your new marketing campaign <strong>"${campaignName}"</strong> has been created in your workspace.</p>
       <p>We've initialized its scheduling parameters and automatically prepared its content studio placeholders.</p>
       <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/campaigns" class="button">View Campaigns</a>`
    );
    return await EmailService.sendEmail({
      to,
      subject: `Campaign Created: "${campaignName}"`,
      html,
      templateName: "campaign_created",
    });
  }

  static async sendCampaignUpdatedEmail(to, userName, campaignName) {
    const html = emailWrapper(
      "Campaign Updated",
      `<h2>Campaign Schedule Updated</h2>
       <p>Hi ${userName},</p>
       <p>Your campaign <strong>"${campaignName}"</strong> was updated. All associated events and calendar entries have been synchronized.</p>
       <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/campaigns" class="button">View Campaign Details</a>`
    );
    return await EmailService.sendEmail({
      to,
      subject: `Campaign Updated: "${campaignName}"`,
      html,
      templateName: "campaign_updated",
    });
  }

  static async sendCampaignDetailsReportEmail(to, userName, campaign, strategy) {
    let strategyHtml = "";
    if (strategy) {
      strategyHtml = `
        <div class="card" style="margin-top: 25px; border-left: 4px solid #7c3aed; background-color: #faf5ff; padding: 20px; border-radius: 8px;">
          <h3 style="color: #6d28d9; margin-top: 0; font-size: 16px; font-weight: 700;">AI Strategy Overview</h3>
          <p style="margin: 8px 0; font-size: 14px;"><strong>Objective:</strong> ${strategy.objective || "N/A"}</p>
          
          <h4 style="color: #4b5563; font-size: 13px; margin: 12px 0 6px 0;">Target Audience:</h4>
          <ul style="padding-left: 20px; font-size: 13px; color: #4b5563; margin: 0 0 12px 0;">
            ${(strategy.targetAudiencePoints || []).map(p => `<li>${p}</li>`).join("") || "<li>None defined</li>"}
          </ul>
          
          <h4 style="color: #4b5563; font-size: 13px; margin: 12px 0 6px 0;">Marketing Funnel:</h4>
          <ul style="padding-left: 20px; font-size: 13px; color: #4b5563; margin: 0 0 12px 0;">
            ${(strategy.funnelPoints || []).map(p => `<li>${p}</li>`).join("") || "<li>None defined</li>"}
          </ul>
          
          <h4 style="color: #4b5563; font-size: 13px; margin: 12px 0 6px 0;">Posting Schedule:</h4>
          <ul style="padding-left: 20px; font-size: 13px; color: #4b5563; margin: 0 0 12px 0;">
            ${(strategy.postingSchedulePoints || []).map(p => `<li>${p}</li>`).join("") || "<li>None defined</li>"}
          </ul>
          
          <h4 style="color: #4b5563; font-size: 13px; margin: 12px 0 6px 0;">Budget Recommendations:</h4>
          <ul style="padding-left: 20px; font-size: 13px; color: #4b5563; margin: 0 0 12px 0;">
            ${(strategy.budgetPoints || []).map(p => `<li>${p}</li>`).join("") || "<li>None defined</li>"}
          </ul>
          
          <h4 style="color: #4b5563; font-size: 13px; margin: 12px 0 6px 0;">KPI Recommendations:</h4>
          <ul style="padding-left: 20px; font-size: 13px; color: #4b5563; margin: 0;">
            ${(strategy.kpiPoints || []).map(p => `<li>${p}</li>`).join("") || "<li>None defined</li>"}
          </ul>
        </div>
      `;
    } else {
      strategyHtml = `
        <p style="color: #6b7280; font-style: italic; margin-top: 20px;">No AI Marketing Strategy has been generated for this campaign yet. You can generate one in the Campaign Details dashboard.</p>
      `;
    }

    const html = emailWrapper(
      "Campaign Details Report",
      `<h2>Campaign Details Report</h2>
       <p>Hi ${userName},</p>
       <p>Here is the detailed overview report for your marketing campaign <strong>"${campaign.name}"</strong>.</p>
       
       <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 6px; padding: 15px; margin: 20px 0; font-size: 14px; line-height: 1.6;">
         <p style="margin: 5px 0;"><strong>Campaign Name:</strong> ${campaign.name}</p>
         <p style="margin: 5px 0;"><strong>Main Goal:</strong> ${campaign.goal}</p>
         <p style="margin: 5px 0;"><strong>Status:</strong> <span style="text-transform: uppercase; font-weight: bold; font-size: 10px; padding: 2px 6px; border-radius: 4px; background-color: #e2e8f0; color: #475569;">${campaign.status}</span></p>
         <p style="margin: 5px 0;"><strong>Budget:</strong> INR ${campaign.budget || 0}</p>
         <p style="margin: 5px 0;"><strong>Start Date:</strong> ${campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "N/A"}</p>
         <p style="margin: 5px 0;"><strong>End Date:</strong> ${campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : "N/A"}</p>
       </div>

       ${strategyHtml}

       <div style="text-align: center; margin-top: 30px;">
         <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/campaigns/${campaign._id || campaign.id}" class="button">View in Dashboard</a>
       </div>`
    );

    return await EmailService.sendEmail({
      to,
      subject: `Campaign Report: "${campaign.name}"`,
      html,
      templateName: "campaign_report",
      uniqueKey: `report_${campaign._id || campaign.id}_${Date.now()}`
    });
  }

  static async sendCampaignReminderEmail(to, userName, campaignDetails) {
    const { campaignName, scheduledDate, scheduledTime, description } = campaignDetails;
    const html = emailWrapper(
      "Campaign Launch Reminder",
      `<h2>Upcoming Campaign Launch</h2>
       <p>Hi ${userName},</p>
       <p>This is a reminder that your campaign is scheduled to run soon:</p>
       <div class="card">
         <strong>Campaign:</strong> ${campaignName}<br/>
         <strong>Date:</strong> ${scheduledDate}<br/>
         <strong>Time:</strong> ${scheduledTime}<br/>
         <p style="margin-top: 10px; font-style: italic; color: #64748b;">${description || "No description provided."}</p>
       </div>
       <p>Please ensure all media elements are finalized.</p>`
    );
    return await EmailService.sendEmail({
      to,
      subject: `Reminder: Campaign "${campaignName}" is scheduled soon`,
      html,
      templateName: "campaign_reminder",
    });
  }

  static async sendCalendarInvitationEmail(to, userName, campaignName, scheduledDate) {
    const html = emailWrapper(
      "Google Calendar Synced",
      `<h2>Calendar Event Synchronized</h2>
       <p>Hi ${userName},</p>
       <p>We have successfully synchronized <strong>"${campaignName}"</strong> with your connected Google Calendar account.</p>
       <div class="card">
         <strong>Event:</strong> ${campaignName}<br/>
         <strong>Start Date:</strong> ${scheduledDate}
       </div>
       <p>Notifications and reminder events have been configured automatically.</p>`
    );
    return await EmailService.sendEmail({
      to,
      subject: `Google Calendar Synced: "${campaignName}"`,
      html,
      templateName: "calendar_invitation",
    });
  }

  static async sendSubscriptionActivatedEmail(to, userName, planName) {
    const html = emailWrapper(
      "Subscription Activated",
      `<h2>Subscription Active!</h2>
       <p>Dear ${userName},</p>
       <p>Your subscription to the <strong>${planName.toUpperCase()} Plan</strong> has been successfully activated.</p>
       <p>Your workspace is now upgraded with increased limits, advanced AI templates, and full integration capabilities.</p>
       <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/dashboard" class="button">Open Workspace</a>`
    );
    return await EmailService.sendEmail({
      to,
      subject: "Your subscription is now active! - Strategix AI",
      html,
      templateName: "subscription_activated",
      uniqueKey: `sub_active_${to}_${planName}`,
    });
  }

  static async sendPaymentSuccessEmail(to, userName, invoiceNumber, amount) {
    const html = emailWrapper(
      "Payment Success",
      `<h2>Payment Captured Successfully</h2>
       <p>Dear ${userName},</p>
       <p>Thank you for your payment. We have successfully processed your renewal invoice.</p>
       <div class="card">
         <strong>Invoice:</strong> ${invoiceNumber}<br/>
         <strong>Amount Paid:</strong> INR ${amount}<br/>
         <strong>Status:</strong> Completed
       </div>
       <p>Your invoice document is ready for download in your account settings.</p>`
    );
    return await EmailService.sendEmail({
      to,
      subject: `Payment Successful for Invoice ${invoiceNumber}`,
      html,
      templateName: "payment_success",
    });
  }

  static async sendPaymentFailureEmail(to, userName, planName, errorMsg) {
    const html = emailWrapper(
      "Payment Failed",
      `<h2>Action Required: Payment Failed</h2>
       <p>Dear ${userName},</p>
       <p>We attempted to charge your card for the <strong>${planName.toUpperCase()} Plan</strong> renewal, but the payment failed.</p>
       <div class="card" style="border-left-color: #ef4444;">
         <strong>Reason:</strong> ${errorMsg || "Transaction declined by card provider."}
       </div>
       <p>Please update your billing information under the Settings page to prevent service interruption.</p>
       <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/settings?tab=subscription" class="button" style="background-color: #ef4444;">Update Billing Details</a>`
    );
    return await EmailService.sendEmail({
      to,
      subject: "Alert: Payment failed for your Strategix AI subscription",
      html,
      templateName: "payment_failure",
    });
  }

  static async sendInvoiceEmail(to, customerName, invoiceNumber, total) {
    const html = emailWrapper(
      "Invoice Generated",
      `<h2>Invoice Generated</h2>
       <p>Dear ${customerName},</p>
       <p>A new billing receipt invoice has been generated for your recent renewal:</p>
       <div class="card">
         <strong>Invoice Number:</strong> ${invoiceNumber}<br/>
         <strong>Amount Due:</strong> INR ${total}<br/>
         <strong>Status:</strong> Paid
       </div>
       <p>You can download the full printable GST layout anytime under settings tab.</p>`
    );
    return await EmailService.sendEmail({
      to,
      subject: `Your Invoice ${invoiceNumber} from Strategix AI`,
      html,
      templateName: "invoice_generated",
    });
  }

  static async sendTeamInvitationEmail(to, inviterName, workspaceName, inviteLink) {
    const html = emailWrapper(
      "Team Invitation",
      `<h2>You've been invited!</h2>
       <p>Hi there,</p>
       <p><strong>${inviterName}</strong> has invited you to join their marketing workspace <strong>"${workspaceName}"</strong> on Strategix AI.</p>
       <p>Click the link below to accept the invitation and configure your team profile:</p>
       <a href="${inviteLink}" class="button">Accept Invitation</a>`
    );
    return await EmailService.sendEmail({
      to,
      subject: `Invitation to join ${workspaceName} workspace`,
      html,
      templateName: "team_invitation",
    });
  }

  static async sendAccountDeletionEmail(to, userName) {
    const html = emailWrapper(
      "Account Deleted",
      `<h2>Account Deletion Confirmed</h2>
       <p>Hi ${userName},</p>
       <p>This is confirmation that your account and associated workspace data have been successfully deleted from our records.</p>
       <p>We are sorry to see you go. If you change your mind, you can re-register anytime.</p>`
    );
    return await EmailService.sendEmail({
      to,
      subject: "Account Deletion Confirmation - Strategix AI",
      html,
      templateName: "account_deleted",
      uniqueKey: `delete_${to}`,
    });
  }
}

export default EmailService;
