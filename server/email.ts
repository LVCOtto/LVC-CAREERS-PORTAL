const RESEND_API_URL = "https://api.resend.com/emails";

interface SendAuthCodeOptions {
  to: string;
  recipientName: string;
  code: string;
}

interface SendAuthCodeResult {
  mode: "logged" | "sent";
  providerId?: string;
  fromAddress?: string;
}

export async function sendAuthCodeEmail({ to, recipientName, code }: SendAuthCodeOptions): Promise<SendAuthCodeResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || "LVC Careers Portal <onboarding@resend.dev>";
  const portalName = process.env.PORTAL_NAME || "LVC Careers Portal";

  // Development fallback: log to console when no API key is configured
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] Sign-in code for ${to}: ${code}`);
      return { mode: "logged", fromAddress };
    }
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (process.env.NODE_ENV === "production" && !process.env.EMAIL_FROM) {
    console.warn("[auth] EMAIL_FROM is not configured; using onboarding@resend.dev test sender");
  }

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1a1a2e;padding:28px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">${portalName}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;color:#333;font-size:16px;">Hi ${recipientName},</p>
              <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.6;">
                Use the code below to sign in to the portal. It is valid for <strong>10 minutes</strong> and can only be used once.
              </p>
              <div style="background:#f0f4ff;border:2px solid #3b5bdb;border-radius:10px;padding:28px;text-align:center;margin-bottom:28px;">
                <span style="display:inline-block;font-size:44px;font-weight:800;letter-spacing:14px;color:#1a1a2e;font-family:'Courier New',monospace;">${code}</span>
              </div>
              <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">
                If you didn't request this code, you can safely ignore this email. Your account has not been affected.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8f9fa;padding:16px 40px;border-top:1px solid #eee;">
              <p style="margin:0;color:#aaa;font-size:12px;">
                This is an automated message from ${portalName}. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textBody = `${portalName} — Sign-in code\n\nHi ${recipientName},\n\nYour sign-in code is:\n\n  ${code}\n\nThis code is valid for 10 minutes and can only be used once.\n\nIf you didn't request this, you can ignore this email.\n\n— ${portalName}`;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [to],
      subject: `${code} is your ${portalName} sign-in code`,
      html: htmlBody,
      text: textBody,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({})) as any;
    throw new Error(`Email delivery failed (${response.status}): ${errorBody.message || response.statusText}`);
  }

  const responseBody = await response.json().catch(() => ({})) as { id?: string };
  return {
    mode: "sent",
    providerId: responseBody.id,
    fromAddress,
  };
}
