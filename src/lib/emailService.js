/**
 * EmailJS OTP Service for UNIMART
 *
 * Setup Instructions:
 * 1. Go to https://www.emailjs.com and create a free account
 * 2. Create an Email Service (Gmail recommended) → copy Service ID
 * 3. Create an Email Template with these variables:
 *      {{to_email}}   - recipient email
 *      {{to_name}}    - recipient name
 *      {{otp_code}}   - 6-digit OTP
 *      {{app_name}}   - app name (UNIMART)
 * 4. Copy Template ID and your Public Key
 * 5. Replace the placeholder values below with your real credentials
 *
 * Sample template body:
 *   Subject: UNIMART Password Reset OTP
 *   Hi {{to_name}},
 *   Your OTP for password reset is: {{otp_code}}
 *   This OTP is valid for 10 minutes.
 *   — {{app_name}} Team
 */

import emailjs from '@emailjs/browser';

// ── Replace these with your real EmailJS credentials ──────────────────────────
const EMAILJS_SERVICE_ID  = 'service_5ykki09';
const EMAILJS_TEMPLATE_ID = 'template_tbxpdcd';
const EMAILJS_PUBLIC_KEY  = 'F8ejS1sNUnTIxrW0_';
// ─────────────────────────────────────────────────────────────────────────────

const IS_CONFIGURED =
  EMAILJS_SERVICE_ID  !== 'YOUR_SERVICE_ID' &&
  EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' &&
  EMAILJS_PUBLIC_KEY  !== 'YOUR_PUBLIC_KEY';

/**
 * Generates a cryptographically-safe 6-digit OTP string.
 */
export function generateOTP() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 900000 + 100000); // always 6 digits
}

/**
 * Sends the OTP to the given email address via EmailJS.
 * Falls back to console-log mode when credentials are not yet configured.
 *
 * @param {string} toEmail   - recipient email
 * @param {string} toName    - recipient display name
 * @param {string} otpCode   - 6-digit OTP to send
 * @returns {Promise<{success: boolean, simulated: boolean, otp?: string}>}
 */
export async function sendOTPEmail(toEmail, toName, otpCode) {
  if (!IS_CONFIGURED) {
    // Development / demo mode — log to console and return OTP so the UI can display it
    console.warn(
      '[UNIMART] EmailJS not configured. Simulating OTP send.\n' +
      `  Email : ${toEmail}\n` +
      `  Name  : ${toName}\n` +
      `  OTP   : ${otpCode}\n\n` +
      'See src/lib/emailService.js for setup instructions.'
    );
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    return { success: true, simulated: true, otp: otpCode };
  }

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: toEmail,
        to_name:  toName || toEmail.split('@')[0],
        otp_code: otpCode,
        app_name: 'UNIMART',
      },
      EMAILJS_PUBLIC_KEY
    );
    return { success: true, simulated: false };
  } catch (err) {
    console.error('[UNIMART] EmailJS send error:', err);
    throw new Error('Failed to send OTP email. Please try again.');
  }
}
