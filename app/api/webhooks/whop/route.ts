import { NextRequest, NextResponse } from 'next/server';
import { whopAPI } from '@/lib/whop';
import { logWebhookEvent, syncMembership, getUserProfile, createUserProfile } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-whop-signature') || '';
    
    // Verify webhook signature
    if (!whopAPI.verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const eventType = payload.type || payload.event_type;

    console.log(`Received Whop webhook: ${eventType}`, payload);

    // Log the webhook event
    const loggedEvent = await logWebhookEvent({
      event_type: eventType,
      whop_user_id: payload.user_id || payload.data?.user_id,
      whop_membership_id: payload.membership_id || payload.data?.membership_id,
      company_id: payload.company_id || payload.data?.company_id,
      plan_id: payload.plan_id || payload.data?.plan_id,
      payload: payload,
    });

    if (!loggedEvent) {
      console.error('Failed to log webhook event');
      return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
    }

    // Process different event types
    switch (eventType) {
      case 'membership.created':
      case 'membership.updated':
      case 'membership.renewed':
        await handleMembershipEvent(payload, 'active');
        break;
        
      case 'membership.cancelled':
      case 'membership.expired':
        await handleMembershipEvent(payload, 'cancelled');
        break;
        
      case 'user.created':
      case 'user.updated':
        await handleUserEvent(payload);
        break;
        
      case 'payment.succeeded':
        await handlePaymentEvent(payload, 'success');
        break;
        
      case 'payment.failed':
        await handlePaymentEvent(payload, 'failed');
        break;
        
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ success: true, eventId: loggedEvent.id });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleMembershipEvent(payload: any, status: string) {
  try {
    const membershipData = payload.data || payload;
    
    if (!membershipData.user_id || !membershipData.id) {
      console.error('Missing required membership data');
      return;
    }

    // Ensure user profile exists
    let userProfile = await getUserProfile(membershipData.user_id);
    if (!userProfile) {
      // Create user profile if it doesn't exist
      userProfile = await createUserProfile({
        whop_user_id: membershipData.user_id,
        email: membershipData.user?.email || 'unknown@example.com',
        username: membershipData.user?.username || 'unknown_user',
        profile_picture_url: membershipData.user?.profile_picture_url,
      });
    }

    // Sync membership
    const syncedMembership = await syncMembership({
      whop_user_id: membershipData.user_id,
      whop_membership_id: membershipData.id,
      company_id: membershipData.company_id || membershipData.company?.id,
      plan_id: membershipData.plan_id || membershipData.plan?.id,
      status: status,
      expires_at: membershipData.expires_at,
    });

    if (syncedMembership) {
      console.log(`Successfully synced membership: ${syncedMembership.whop_membership_id}`);
    }
  } catch (error) {
    console.error('Error handling membership event:', error);
  }
}

async function handleUserEvent(payload: any) {
  try {
    const userData = payload.data || payload;
    
    if (!userData.id) {
      console.error('Missing user ID in user event');
      return;
    }

    // Check if user profile exists
    let userProfile = await getUserProfile(userData.id);
    
    if (userProfile) {
      // Update existing profile
      await createUserProfile({
        whop_user_id: userData.id,
        email: userData.email || userProfile.email,
        username: userData.username || userProfile.username,
        profile_picture_url: userData.profile_picture_url || userProfile.profile_picture_url,
      });
    } else {
      // Create new profile
      await createUserProfile({
        whop_user_id: userData.id,
        email: userData.email || 'unknown@example.com',
        username: userData.username || 'unknown_user',
        profile_picture_url: userData.profile_picture_url,
      });
    }

    console.log(`Successfully processed user event for: ${userData.id}`);
  } catch (error) {
    console.error('Error handling user event:', error);
  }
}

async function handlePaymentEvent(payload: any, status: string) {
  try {
    const paymentData = payload.data || payload;
    
    console.log(`Payment ${status}:`, {
      user_id: paymentData.user_id,
      membership_id: paymentData.membership_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
    });

    // You can add additional payment processing logic here
    // For example, updating user credits, sending notifications, etc.
    
  } catch (error) {
    console.error('Error handling payment event:', error);
  }
}