# Whop App - Functional Membership Gated Experience

A complete Next.js application with Whop OAuth integration, membership gating, and webhook handling.

## Features

✅ **Whop OAuth Integration** - Complete login/logout flow with Whop
✅ **Membership Gating** - Server-side validation of active memberships
✅ **Supabase Integration** - Data persistence and user management
✅ **Webhook Handling** - Real-time event processing for purchases, cancellations, renewals
✅ **Admin Dashboard** - Monitor webhook events and user activity
✅ **Responsive UI** - Modern, mobile-friendly interface

## Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

**Required Environment Variables:**
- `WHOP_API_KEY` - Your Whop API key
- `WHOP_CLIENT_ID` - OAuth client ID
- `WHOP_CLIENT_SECRET` - OAuth client secret
- `WHOP_REDIRECT_URI` - OAuth redirect URI
- `WHOP_WEBHOOK_SECRET` - Webhook signature verification
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXTAUTH_URL` - NextAuth base URL
- `NEXTAUTH_SECRET` - NextAuth secret

### 2. Database Setup

Run the SQL schema in your Supabase project:

```sql
-- See supabase/schema.sql for the complete schema
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Authentication
- `GET /api/auth/login` - Initiate Whop OAuth
- `GET /api/auth/callback` - OAuth callback handler
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Membership
- `GET /api/membership/check` - Check user membership status
- `POST /api/memberships/sync` - Sync memberships with Supabase
- `GET /api/memberships/sync` - Get synced memberships

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Webhooks
- `POST /api/webhooks/whop` - Whop webhook endpoint
- `GET /api/webhooks/events` - Get webhook events (admin)

## Pages

- `/` - Home page with login/logout
- `/dashboard` - Protected dashboard (requires auth)
- `/premium` - Premium content (requires active membership)
- `/admin/webhooks` - Webhook event monitoring

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

The app is configured for Vercel with `vercel.json`.

## Webhook Configuration

Configure your Whop webhook to point to:
```
https://your-app.vercel.app/api/webhooks/whop
```

Supported events:
- `membership.created`
- `membership.updated` 
- `membership.cancelled`
- `membership.expired`
- `membership.renewed`
- `user.created`
- `user.updated`
- `payment.succeeded`
- `payment.failed`

## Architecture

- **Frontend**: Next.js 14 with App Router
- **Authentication**: JWT-based sessions with Whop OAuth
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Security

- JWT tokens with secure HTTP-only cookies
- Webhook signature verification
- Row Level Security (RLS) in Supabase
- Server-side membership validation
- CSRF protection

## Testing

1. **Login Flow**: Click "Login with Whop" → Complete OAuth → See user profile
2. **Membership Gating**: Try accessing `/premium` without active membership
3. **Webhook Testing**: Use Whop's webhook testing tools or create test events
4. **Admin Panel**: Visit `/admin/webhooks` to monitor events

## Support

For issues or questions, check the logs in the admin panel or browser console.