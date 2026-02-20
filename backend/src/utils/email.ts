import sgMail from '@sendgrid/mail';
import { EmailLogModel } from '@/modules/emailLogs/model';
import { config } from '@/config';

let isInitialized = false;

const initializeSendGrid = (): void => {
    if (!isInitialized && config.email.sendgridApiKey) {
        sgMail.setApiKey(config.email.sendgridApiKey);
        isInitialized = true;
        console.log('SendGrid initialized');
    }
};

const logEmail = async (emailData: Record<string, any>): Promise<any> => {
    try {
        const log = new EmailLogModel(emailData);
        await log.save();
        return log;
    } catch (error) {
        console.error('Error logging email:', error);
        return null;
    }
};

/**
 * Send verification email to user
 */
export const sendVerificationEmail = async (email: string, name: string, verificationToken: string) => {
    initializeSendGrid();

    const FROM_EMAIL = config.email.fromEmail;
    const STORE_NAME = config.email.storeName;
    const frontendUrl = config.frontendUrl;
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    const msg = {
        to: email,
        from: { email: FROM_EMAIL, name: STORE_NAME },
        subject: `Verify Your Email - Welcome to ${STORE_NAME}!`,
        text: `Welcome to ${STORE_NAME}, ${name}!\n\nPlease verify your email by visiting: ${verificationLink}\n\nThis link will expire in 24 hours.`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f4f7;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr><td align="center" style="padding:40px 0;">
      <table role="presentation" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
        <tr><td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:40px;text-align:center;border-radius:16px 16px 0 0;">
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;">Welcome to ${STORE_NAME}!</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 20px;color:#1f2937;font-size:24px;">Hi ${name}!</h2>
          <p style="margin:0 0 20px;color:#4b5563;font-size:16px;line-height:1.6;">Thank you for creating an account. Please verify your email address by clicking the button below.</p>
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr><td align="center" style="padding:30px 0;">
              <a href="${verificationLink}" style="display:inline-block;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:50px;font-size:18px;font-weight:bold;">Verify My Email</a>
            </td></tr>
          </table>
          <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Or copy and paste this link: ${verificationLink}</p>
          <div style="padding:20px;background-color:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
            <p style="margin:0;color:#92400e;font-size:14px;"><strong>Important:</strong> This link expires in 24 hours.</p>
          </div>
        </td></tr>
        <tr><td style="padding:30px;background-color:#f9fafb;text-align:center;border-radius:0 0 16px 16px;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">&copy; ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    };

    try {
        const response = await sgMail.send(msg);
        await logEmail({
            to: email,
            from: FROM_EMAIL,
            subject: msg.subject,
            type: 'verification',
            status: 'sent',
            statusCode: response[0].statusCode,
            verificationToken,
            provider: 'sendgrid',
            metadata: { name },
        });
        return { success: true, statusCode: response[0].statusCode };
    } catch (error: any) {
        await logEmail({
            to: email,
            from: FROM_EMAIL,
            subject: msg.subject,
            type: 'verification',
            status: 'failed',
            errorMessage: error.message,
            verificationToken,
            provider: 'sendgrid',
            metadata: { name },
        });
        throw error;
    }
};

/**
 * Send welcome email after verification
 */
export const sendWelcomeEmail = async (email: string, name: string) => {
    initializeSendGrid();

    const FROM_EMAIL = config.email.fromEmail;
    const STORE_NAME = config.email.storeName;
    const frontendUrl = config.frontendUrl;

    const msg = {
        to: email,
        from: { email: FROM_EMAIL, name: STORE_NAME },
        subject: `Email Verified - Welcome to ${STORE_NAME}!`,
        text: `Congratulations, ${name}! Your email has been verified. Start shopping: ${frontendUrl}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f4f7;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr><td align="center" style="padding:40px 0;">
      <table role="presentation" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
        <tr><td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:40px;text-align:center;border-radius:16px 16px 0 0;">
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;">You're All Set!</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 20px;color:#1f2937;font-size:24px;">Congratulations, ${name}!</h2>
          <p style="margin:0 0 20px;color:#4b5563;font-size:16px;line-height:1.6;">Your email has been verified. You now have full access.</p>
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr><td align="center">
              <a href="${frontendUrl}" style="display:inline-block;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:50px;font-size:18px;font-weight:bold;">Start Shopping</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:30px;background-color:#f9fafb;text-align:center;border-radius:0 0 16px 16px;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">&copy; ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    };

    try {
        const response = await sgMail.send(msg);
        await logEmail({
            to: email,
            from: FROM_EMAIL,
            subject: msg.subject,
            type: 'welcome',
            status: 'sent',
            statusCode: response[0].statusCode,
            provider: 'sendgrid',
            metadata: { name },
        });
        return { success: true, statusCode: response[0].statusCode };
    } catch (error: any) {
        await logEmail({
            to: email,
            from: FROM_EMAIL,
            subject: msg.subject,
            type: 'welcome',
            status: 'failed',
            errorMessage: error.message,
            provider: 'sendgrid',
            metadata: { name },
        });
        return { success: false, error: error.message };
    }
};

/**
 * Generate a random verification token
 */
export const generateVerificationToken = async (): Promise<string> => {
    const crypto = await import('crypto');
    return crypto.randomBytes(32).toString('hex');
};
