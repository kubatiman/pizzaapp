import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { syncMembership, getUserMemberships } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Sync all user memberships to Supabase
    const syncedMemberships = [];
    
    for (const membership of user.memberships) {
      const synced = await syncMembership({
        whop_user_id: membership.user_id,
        whop_membership_id: membership.id,
        company_id: membership.company_id,
        plan_id: membership.plan_id,
        status: membership.status,
        expires_at: membership.expires_at,
      });
      
      if (synced) {
        syncedMemberships.push(synced);
      }
    }

    return NextResponse.json({ 
      success: true, 
      syncedCount: syncedMemberships.length,
      memberships: syncedMemberships 
    });
  } catch (error) {
    console.error('Membership sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync memberships' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get memberships from Supabase
    const memberships = await getUserMemberships(user.id);

    return NextResponse.json({ memberships });
  } catch (error) {
    console.error('Membership fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memberships' },
      { status: 500 }
    );
  }
}