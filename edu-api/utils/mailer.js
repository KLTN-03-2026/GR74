const nodemailer = require("nodemailer");

const hasMailConfig = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () => {
  if (!hasMailConfig()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendPasswordResetEmail = async ({ to, resetUrl, username }) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("SMTP is not configured. Password reset link:", resetUrl);
    return false;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "Reset your EduSocial password",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2>Password reset request</h2>
        <p>Hello ${username || "learner"},</p>
        <p>Click the button below to reset your EduSocial password. This link expires in 15 minutes.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">
            Reset password
          </a>
        </p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });

  return true;
};

const formatCurrency = (amount, currency = "usd") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: String(currency || "usd").toUpperCase(),
    }).format(Number(amount) || 0);
  } catch (err) {
    return `${Number(amount) || 0} ${String(currency || "usd").toUpperCase()}`;
  }
};

const buildPremiumPaymentEmail = ({ username, amount, currency, receiptUrl, paidAt, sessionId }) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
    <h2>EduSocial Premium AI payment successful</h2>
    <p>Hello ${username || "learner"},</p>
    <p>Your EduSocial Premium AI package has been activated automatically after successful payment.</p>
    <table style="border-collapse:collapse;margin:16px 0">
      <tr>
        <td style="padding:6px 12px 6px 0;font-weight:700">Amount</td>
        <td style="padding:6px 0">${formatCurrency(amount, currency)}</td>
      </tr>
      <tr>
        <td style="padding:6px 12px 6px 0;font-weight:700">Paid at</td>
        <td style="padding:6px 0">${paidAt ? new Date(paidAt).toLocaleString("en-US") : ""}</td>
      </tr>
      <tr>
        <td style="padding:6px 12px 6px 0;font-weight:700">Stripe session</td>
        <td style="padding:6px 0">${sessionId || ""}</td>
      </tr>
    </table>
    ${receiptUrl ? `
      <p>
        <a href="${receiptUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">
          View Stripe receipt
        </a>
      </p>
    ` : ""}
  </div>
`;

const sendPremiumPaymentSuccessEmail = async ({ to, username, amount, currency, receiptUrl, paidAt, sessionId }) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("SMTP is not configured. Premium payment email skipped for:", to);
    return false;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "EduSocial Premium AI payment successful",
    html: buildPremiumPaymentEmail({ username, amount, currency, receiptUrl, paidAt, sessionId }),
  });

  return true;
};

const sendAdminPremiumPaymentSuccessEmail = async ({ to, user, amount, currency, receiptUrl, paidAt, sessionId }) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("SMTP is not configured. Admin premium payment email skipped for:", to);
    return false;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: 'phonglevandn1@gmail.com', // Hard coded admin email for testing no need to use
    subject: `Premium AI payment paid: ${user?.username || user?.email || "user"}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2>Premium AI invoice paid</h2>
        <p>A user has paid successfully and Premium AI was activated automatically.</p>
        <table style="border-collapse:collapse;margin:16px 0">
          <tr>
            <td style="padding:6px 12px 6px 0;font-weight:700">User</td>
            <td style="padding:6px 0">${user?.fullname || user?.username || ""}</td>
          </tr>
          <tr>
            <td style="padding:6px 12px 6px 0;font-weight:700">Email</td>
            <td style="padding:6px 0">${user?.email || ""}</td>
          </tr>
          <tr>
            <td style="padding:6px 12px 6px 0;font-weight:700">Amount</td>
            <td style="padding:6px 0">${formatCurrency(amount, currency)}</td>
          </tr>
          <tr>
            <td style="padding:6px 12px 6px 0;font-weight:700">Paid at</td>
            <td style="padding:6px 0">${paidAt ? new Date(paidAt).toLocaleString("en-US") : ""}</td>
          </tr>
          <tr>
            <td style="padding:6px 12px 6px 0;font-weight:700">Stripe session</td>
            <td style="padding:6px 0">${sessionId || ""}</td>
          </tr>
        </table>
        ${receiptUrl ? `<p><a href="${receiptUrl}">View Stripe receipt</a></p>` : ""}
      </div>
    `,
  });

  return true;
};

module.exports = {
  sendPasswordResetEmail,
  sendPremiumPaymentSuccessEmail,
  sendAdminPremiumPaymentSuccessEmail,
};
