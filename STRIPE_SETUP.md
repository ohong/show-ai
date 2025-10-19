# Stripe Integration Setup Guide

This guide will help you set up Stripe payment processing for your AI Skills Marketplace.

## 1. Stripe Account Setup

1. **Create a Stripe Account**
   - Go to [stripe.com](https://stripe.com) and create an account
   - Complete the account verification process

2. **Get Your API Keys**
   - Go to [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys)
   - Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

## 2. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 3. Webhook Setup

1. **Install Stripe CLI** (for local development)
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe CLI**
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   
   This will give you a webhook secret that starts with `whsec_` - add this to your `.env.local`

4. **For Production**
   - Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
   - Click "Add endpoint"
   - Set URL to: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
   - Copy the webhook signing secret to your production environment

## 4. Database Schema

Make sure your `purchases` table has these columns:

```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id),
  video_id UUID NOT NULL REFERENCES videos(id),
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_intent_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 5. Testing

### Test Cards (Development Mode)

Use these test card numbers in development:

- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.

### Test the Flow

1. Start your development server: `npm run dev`
2. Go to the marketplace
3. Try to purchase a skill
4. Use test card `4242 4242 4242 4242`
5. Complete the payment
6. Check that the purchase appears in your database

## 6. Production Deployment

1. **Switch to Live Keys**
   - Replace test keys with live keys in production
   - Update webhook endpoint to production URL

2. **Enable Live Mode**
   - In Stripe Dashboard, toggle to "Live mode"
   - Use live API keys

3. **Set up Production Webhooks**
   - Create webhook endpoint in Stripe Dashboard
   - Point to your production domain

## 7. Security Considerations

- **Never expose secret keys** in client-side code
- **Always verify webhook signatures** (already implemented)
- **Use HTTPS** in production
- **Validate payment amounts** on the server side
- **Implement proper error handling**

## 8. Monitoring

- Monitor payments in [Stripe Dashboard](https://dashboard.stripe.com/payments)
- Set up alerts for failed payments
- Review webhook logs for any issues

## 9. Features Included

✅ **Payment Intent Creation** - Secure payment processing  
✅ **Stripe Elements** - Modern payment UI  
✅ **Webhook Handling** - Automatic payment confirmation  
✅ **Success/Failure Pages** - User feedback  
✅ **Purchase History** - Track completed purchases  
✅ **Error Handling** - Graceful failure management  

## 10. Next Steps

- Set up email notifications for successful purchases
- Implement refund functionality
- Add subscription support for recurring payments
- Set up analytics and reporting
- Implement fraud detection

## Support

If you encounter any issues:
1. Check the Stripe Dashboard for payment logs
2. Review webhook delivery logs
3. Check your server logs for errors
4. Contact Stripe support if needed
