import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, hasActiveMembership } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (companyId) {
      // Check specific company membership
      const hasMembership = hasActiveMembership(user, companyId);
      return NextResponse.json({ 
        hasMembership,
        companyId,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        }
      });
    } else {
      // Check if user has any active membership
      const hasAnyMembership = user.memberships.some(m => m.status === 'active');
      return NextResponse.json({ 
        hasMembership: hasAnyMembership,
        memberships: user.memberships,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        }
      });
    }
  } catch (error) {
    console.error('Membership check error:', error);
    return NextResponse.json(
      { error: 'Failed to check membership' },
      { status: 500 }
    );
  }
}