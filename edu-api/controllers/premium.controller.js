const Users = require("../models/user.model");
const {
  sendAdminPremiumPaymentSuccessEmail,
  sendPremiumPaymentSuccessEmail,
} = require("../utils/mailer");

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const Stripe = require("stripe");
  return Stripe(process.env.STRIPE_SECRET_KEY);
};

const getReceiptUrl = async (stripe, session) => {
  try {
    if (!session.payment_intent) return "";
    const paymentIntentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent.id;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge"],
    });
    return paymentIntent.latest_charge?.receipt_url || "";
  } catch (err) {
    console.warn("Stripe receipt lookup skipped:", err.message);
    return "";
  }
};

const premiumCtrl = {
  getAdminContact: async (req, res) => {
    try {
      const admin = await Users.findOne({
        role: "admin",
        isActive: { $ne: false },
        _id: { $ne: req.user._id },
      })
        .select("avatar username fullname followers following")
        .lean();

      if (!admin) return res.status(404).json({ msg: "No available admin account found." });
      return res.json({ admin });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  createCheckout: async (req, res) => {
    try {
      const stripe = getStripe();
      if (!stripe) return res.status(500).json({ msg: "Stripe is not configured." });

      const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: req.user.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "EduSocial Premium Learning AI",
                description: "Automatic activation after Stripe payment.",
              },
              unit_amount: 2000,
            },
            quantity: 1,
          },
        ],
        success_url: `${clientUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/premium?cancelled=true`,
        metadata: {
          userId: req.user._id.toString(),
          username: req.user.username,
          plan: "premium_learning_ai",
        },
      });

      await Users.findByIdAndUpdate(req.user._id, {
        premiumPayment: {
          status: "pending",
          amount: 20,
          currency: "usd",
          stripeSessionId: session.id,
          checkoutUrl: session.url,
          updatedAt: new Date(),
        },
      });

      return res.json({ url: session.url, sessionId: session.id });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  confirmCheckout: async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) return res.status(400).json({ msg: "Stripe session id is required." });

      const stripe = getStripe();
      if (!stripe) return res.status(500).json({ msg: "Stripe is not configured." });

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.metadata?.userId !== req.user._id.toString()) {
        return res.status(403).json({ msg: "This payment session does not belong to your account." });
      }

      if (session.payment_status !== "paid") {
        await Users.findByIdAndUpdate(req.user._id, {
          "premiumPayment.status": "pending",
          "premiumPayment.updatedAt": new Date(),
        });
        return res.status(400).json({ msg: "Payment has not been completed yet." });
      }

      const receiptUrl = await getReceiptUrl(stripe, session);
      const paymentIntentId = typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

      const wasAlreadyActivated = req.user.aiEnabled && req.user.premiumPayment?.status === "paid";
      const paidAt = req.user.premiumPayment?.paidAt || new Date();
      const amount = (session.amount_total || 2000) / 100;
      const currency = session.currency || "usd";

      const user = await Users.findByIdAndUpdate(req.user._id, {
        aiEnabled: true,
        aiEnabledAt: paidAt,
        premiumPayment: {
          status: "paid",
          amount,
          currency,
          stripeSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          receiptUrl,
          checkoutUrl: session.url,
          paidAt,
          updatedAt: paidAt,
        },
      }, { new: true }).select("-password");

      if (!wasAlreadyActivated) {
        const admins = await Users.find({ role: "admin", isActive: true })
          .select("email username fullname")
          .lean();
        const adminEmails = [
          process.env.ADMIN_EMAIL,
          ...admins.map((admin) => admin.email),
        ].filter(Boolean);
        const uniqueAdminEmails = [...new Set(adminEmails)];

        const emailResults = await Promise.allSettled([
          sendPremiumPaymentSuccessEmail({
            to: user.email,
            username: user.username,
            amount,
            currency,
            receiptUrl,
            paidAt,
            sessionId: session.id,
          }),
          ...uniqueAdminEmails.map((to) => sendAdminPremiumPaymentSuccessEmail({
            to,
            user,
            amount,
            currency,
            receiptUrl,
            paidAt,
            sessionId: session.id,
          })),
        ]);

        emailResults
          .filter((result) => result.status === "rejected")
          .forEach((result) => console.warn("Premium payment email failed:", result.reason?.message || result.reason));
      }

      return res.json({
        msg: "Payment confirmed. Premium AI has been activated.",
        user,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = premiumCtrl;
