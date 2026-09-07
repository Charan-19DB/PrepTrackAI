import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  } else {
    // Fallback: log to console or ethereal if credentials not set yet
    console.warn('[EmailService] EMAIL_USER or EMAIL_PASS not configured in .env. Emails will be logged to server logs.');
  }

  return transporter;
};

export const sendOtpEmail = async ({ to, code, type = 'verification' }) => {
  const isReset = type === 'reset';
  const subject = isReset 
    ? `🔐 PrepTrack AI — Password Reset Code: ${code}` 
    : `✨ PrepTrack AI — Verify Your Student Email: ${code}`;

  const title = isReset ? 'Reset Your Account Password' : 'Verify Student Email Address';
  const subtitle = isReset 
    ? 'Use the 6-digit verification code below to set a new password for your PrepTrack AI account.' 
    : 'Use the 6-digit code below to confirm your student email and unlock full placement analytics.';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #ffffff;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #111827; border: 1px solid #1f2937; border-radius: 24px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <tr>
            <td align="center">
              <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; font-size: 24px; text-align: center; color: #ffffff;">
                ⚡
              </div>
              <h1 style="margin: 16px 0 4px; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                PrepTrack<span style="color: #6366f1;">.AI</span>
              </h1>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
                CSE Placement & Learning LMS
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 28px;">
              <h2 style="margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #f3f4f6;">
                ${title}
              </h2>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #9ca3af;">
                ${subtitle}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center">
              <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px;">
                <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                  Your 6-Digit Verification Code
                </div>
                <div style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #6366f1;">
                  ${code}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <p style="margin: 0 0 12px; font-size: 12px; color: #6b7280; text-align: center;">
                ⏱️ This code will expire in <strong>15 minutes</strong>.
              </p>
              <p style="margin: 0; font-size: 11px; color: #4b5563; text-align: center; line-height: 1.4;">
                If you did not request this email, please disregard it. Do not share this code with anyone.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const mailClient = getTransporter();

  if (mailClient) {
    try {
      const info = await mailClient.sendMail({
        from: `"PrepTrack AI" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      });
      console.log(`[EmailService] Sent OTP email to ${to}:`, info.messageId);
      return { success: true, messageId: info.messageId, code };
    } catch (err) {
      console.error(`[EmailService] Failed to send email to ${to}:`, err.message);
      // Fallback to simulated delivery so user is never blocked
      return { success: true, simulated: true, code, error: err.message };
    }
  } else {
    console.log(`[EmailService] SIMULATED EMAIL TO ${to}: Code is ${code}`);
    return { success: true, simulated: true, code };
  }
};
