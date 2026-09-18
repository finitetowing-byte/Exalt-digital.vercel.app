const Stripe = require('stripe');

const prices = {
  starter: 'price_starter_placeholder',
  growth: 'price_growth_placeholder',
};

module.exports = async function createCheckoutSession(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return response.status(500).json({ error: 'Stripe is not configured' });
  }

  const plan = request.body?.plan;
  const price = prices[plan];
  if (!price) {
    return response.status(400).json({ error: 'Choose a valid plan' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const domain = process.env.DOMAIN || 'http://localhost:3000';
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'hosted_page',
    mode: 'subscription',
    billing_address_collection: 'auto',
    phone_number_collection: { enabled: false },
    automatic_tax: { enabled: false },
    allow_promotion_codes: false,
    payment_method_collection: 'always',
    submit_type: 'auto',
    integration_identifier: 'hosted_web_0001',
    origin_context: 'web',
    success_url: `${domain}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domain}/?checkout=cancelled`,
    line_items: [{ price, quantity: 1 }],
  });

  return response.status(200).json({ url: session.url });
};
