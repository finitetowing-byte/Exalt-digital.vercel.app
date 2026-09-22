import Stripe from 'stripe';

const PLANS = {
  starter: {
    name: 'Starter Rescue',
    amount: 19900,
  },
  growth: {
    name: 'Growth Engine',
    amount: 39900,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan } = req.body || {};
  const selectedPlan = PLANS[plan];
  if (!selectedPlan) {
    return res.status(400).json({ error: 'Invalid plan.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Stripe is not configured');
    return res.status(500).json({ error: 'Checkout is unavailable.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const siteUrl = 'https://exaltdigitalmedia.com';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_collection: 'always',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: selectedPlan.name },
            recurring: { interval: 'month' },
            unit_amount: selectedPlan.amount,
          },
          quantity: 1,
        },
      ],
      subscription_data: { trial_period_days: 7 },
      success_url: `${siteUrl}/?checkout=success`,
      cancel_url: `${siteUrl}/?checkout=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout session creation failed', error);
    return res.status(502).json({ error: 'Checkout is unavailable.' });
  }
}
