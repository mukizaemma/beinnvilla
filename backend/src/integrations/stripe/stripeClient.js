// Requires `npm install stripe` in backend, plus STRIPE_SECRET_KEY
// and STRIPE_WEBHOOK_SECRET in your .env. Until both are set, every route
// that imports STRIPE_CONFIGURED returns an honest "not configured"
// response instead of throwing — same pattern as the frontend's EmailJS
// IS_CONFIGURED check.
import Stripe from 'stripe'

export const STRIPE_CONFIGURED = Boolean(
  process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET,
)

export const stripe = STRIPE_CONFIGURED ? new Stripe(process.env.STRIPE_SECRET_KEY) : null