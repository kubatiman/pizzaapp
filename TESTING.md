# Testing Guide - Whop App

## Test Scenarios

### 1. OAuth Login Flow Test

**Steps:**
1. Visit the app homepage
2. Click "Login with Whop"
3. Complete OAuth flow
4. Verify user profile displays

**Expected Results:**
- Redirects to Whop OAuth
- Returns to app with user logged in
- User profile shows email, username, and memberships
- Logout button appears

**Test Data:**
- Use test Whop account
- Verify JWT token is set in cookies
- Check user data in browser dev tools

### 2. Membership Gating Test

**Test A: Unauthenticated Access**
1. Clear cookies/logout
2. Try to access `/dashboard`
3. Try to access `/premium`

**Expected Results:**
- Redirected to login page
- Cannot access protected content

**Test B: Authenticated but No Active Membership**
1. Login with account that has no active memberships
2. Try to access `/premium`

**Expected Results:**
- Shows "Premium Access Required" message
- Redirects to upgrade page after 2 seconds

**Test C: Authenticated with Active Membership**
1. Login with account that has active membership
2. Access `/premium`

**Expected Results:**
- Shows premium content
- Displays membership benefits
- No redirect occurs

### 3. Webhook Testing

**Test Webhook Endpoint:**
```bash
curl -X POST https://your-app.vercel.app/api/webhooks/whop \
  -H "Content-Type: application/json" \
  -H "x-whop-signature: your_signature" \
  -d '{
    "type": "membership.created",
    "user_id": "test_user_123",
    "membership_id": "test_membership_456",
    "company_id": "test_company_789",
    "plan_id": "test_plan_101",
    "status": "active"
  }'
```

**Expected Results:**
- Returns 200 OK
- Event logged in database
- User profile created/updated
- Membership synced

### 4. API Endpoints Test

**Test Authentication:**
```bash
# Get current user
curl https://your-app.vercel.app/api/auth/me

# Check membership
curl https://your-app.vercel.app/api/membership/check

# Get user profile
curl https://your-app.vercel.app/api/user/profile
```

**Test Webhook Events:**
```bash
# Get webhook events
curl https://your-app.vercel.app/api/webhooks/events
```

### 5. Admin Panel Test

**Steps:**
1. Visit `/admin/webhooks`
2. Verify webhook events are displayed
3. Test event detail modals
4. Check filtering and pagination

**Expected Results:**
- Events table loads
- Event details show full payload
- Modals work correctly
- Refresh button updates data

## Test Checklist

### Authentication & Authorization
- [ ] OAuth login works
- [ ] JWT tokens are set correctly
- [ ] Logout clears session
- [ ] Protected routes require authentication
- [ ] Membership gating works correctly

### Data Persistence
- [ ] User profiles are created/updated
- [ ] Memberships are synced to database
- [ ] Webhook events are logged
- [ ] Data persists across sessions

### Webhook Processing
- [ ] Webhook signature verification works
- [ ] Events are processed correctly
- [ ] Database operations succeed
- [ ] Error handling works

### UI/UX
- [ ] Pages load correctly
- [ ] Responsive design works
- [ ] Error messages are clear
- [ ] Loading states work
- [ ] Navigation works

### Performance
- [ ] Pages load quickly
- [ ] API responses are fast
- [ ] Database queries are optimized
- [ ] No memory leaks

## Debugging

### Common Issues:

1. **OAuth redirect errors**
   - Check redirect URI configuration
   - Verify client ID/secret
   - Check CORS settings

2. **JWT token issues**
   - Verify NEXTAUTH_SECRET is set
   - Check token expiration
   - Clear cookies and retry

3. **Database connection errors**
   - Verify Supabase credentials
   - Check RLS policies
   - Test connection directly

4. **Webhook signature failures**
   - Verify webhook secret
   - Check signature calculation
   - Test with correct headers

### Logs to Check:

1. **Browser Console**: Client-side errors
2. **Vercel Function Logs**: Server-side errors
3. **Supabase Logs**: Database operations
4. **Whop Dashboard**: Webhook delivery status

## Test Data

### Sample User Data:
```json
{
  "id": "test_user_123",
  "email": "test@example.com",
  "username": "testuser",
  "profile_picture_url": "https://example.com/avatar.jpg"
}
```

### Sample Membership Data:
```json
{
  "id": "test_membership_456",
  "user_id": "test_user_123",
  "company_id": "test_company_789",
  "plan_id": "test_plan_101",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Sample Webhook Payload:
```json
{
  "type": "membership.created",
  "user_id": "test_user_123",
  "membership_id": "test_membership_456",
  "company_id": "test_company_789",
  "plan_id": "test_plan_101",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```