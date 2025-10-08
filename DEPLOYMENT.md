# Deployment Guide - Whop App

## Vercel Deployment

### 1. Prerequisites

- GitHub repository with the code
- Vercel account
- Whop API credentials
- Supabase project

### 2. Environment Variables

Set these in your Vercel dashboard under Project Settings > Environment Variables:

#### Required Variables:
```
WHOP_API_KEY=your_whop_api_key
WHOP_CLIENT_ID=your_whop_client_id
WHOP_CLIENT_SECRET=your_whop_client_secret
WHOP_REDIRECT_URI=https://your-app.vercel.app/api/auth/callback
WHOP_WEBHOOK_SECRET=your_whop_webhook_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
```

### 3. Database Setup

1. Create a Supabase project
2. Run the SQL schema from `supabase/schema.sql`
3. Update environment variables with your Supabase credentials

### 4. Whop Configuration

1. Create a Whop app in your dashboard
2. Set OAuth redirect URI to: `https://your-app.vercel.app/api/auth/callback`
3. Configure webhook URL to: `https://your-app.vercel.app/api/webhooks/whop`
4. Copy API credentials to Vercel environment variables

### 5. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Import the project
3. Set all environment variables
4. Deploy

### 6. Post-Deployment

1. Test the OAuth flow
2. Configure webhooks in Whop dashboard
3. Test webhook events
4. Verify membership gating works

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

## Testing Checklist

- [ ] OAuth login flow works
- [ ] User profile displays correctly
- [ ] Membership gating blocks unauthorized access
- [ ] Premium content requires active membership
- [ ] Webhook events are logged
- [ ] Admin panel shows webhook events
- [ ] Database operations work correctly

## Troubleshooting

### Common Issues:

1. **OAuth redirect mismatch**: Ensure redirect URI matches exactly
2. **Webhook signature verification fails**: Check webhook secret
3. **Database connection issues**: Verify Supabase credentials
4. **CORS errors**: Check domain configuration

### Debug Steps:

1. Check Vercel function logs
2. Monitor webhook events in admin panel
3. Verify environment variables are set
4. Test API endpoints directly