# Stripe Checkout Integration TODO

## Values to Replace

The following values are placeholders and must be updated before going live.

**Files containing placeholders:**
- [api/create-checkout-session.js](api/create-checkout-session.js)

| Field | Current Value | What to Set |
|---|---|---|
| `prices.starter` | `price_starter_placeholder` | The recurring Stripe Price ID for Starter Rescue ($199/month) from [Stripe Prices](https://dashboard.stripe.com/prices). |
| `prices.growth` | `price_growth_placeholder` | The recurring Stripe Price ID for Growth Engine ($399/month) from [Stripe Prices](https://dashboard.stripe.com/prices). |
| `DOMAIN` | `http://localhost:3000` fallback | Set `DOMAIN` to `https://exaltdigitalmedia.com`; it is used for successful and cancelled Checkout redirects. |

## Configured Parameters

**Files containing these parameters:**
- [api/create-checkout-session.js](api/create-checkout-session.js)

| Parameter | Value |
|---|---|
| `ui_mode` | `hosted_page` |
| `mode` | `subscription` |
| `billing_address_collection` | `auto` |
| `phone_number_collection.enabled` | `false` |
| `automatic_tax.enabled` | `false` |
| `allow_promotion_codes` | `false` |
| `payment_method_collection` | `always` |
| `submit_type` | `auto` |
| `integration_identifier` | `hosted_web_0001` |
| `origin_context` | `web` |

## Setup and Next Steps

1. In [Vercel environment variables](https://vercel.com/finitetowing-3243/exalt-digital/settings/environment-variables), add `STRIPE_SECRET_KEY` and `DOMAIN` for Production. Do not commit secret keys.
2. Replace both placeholder Price IDs with Stripe recurring Price IDs, then deploy.
3. The pricing buttons post the selected plan to `/api/create-checkout-session`; the Vercel Function creates a hosted Stripe Checkout Session and redirects the browser to it.
4. Test in Stripe test mode with card `4242 4242 4242 4242`, any future expiry date, and any CVC. Use Stripe test keys until the checkout flow is confirmed.
5. Before production, configure fulfillment/onboarding and Stripe webhooks for completed subscriptions and payment failures. No webhook handler was added because this project has no existing fulfillment or datastore pattern.

Resources: [Stripe Support](https://support.stripe.com) and [Stripe documentation](https://docs.stripe.com/mcp).
