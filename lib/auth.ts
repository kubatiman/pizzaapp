import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  profile_picture_url?: string;
  memberships: Array<{
    id: string;
    user_id: string;
    company_id: string;
    plan_id: string;
    status: 'active' | 'cancelled' | 'expired' | 'paused';
    created_at: string;
    expires_at?: string;
  }>;
  accessToken: string;
  refreshToken: string;
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const token = request.cookies.get('whop_session')?.value;

    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');
    const { payload } = await jwtVerify(token, secret);
    
    return payload as unknown as AuthenticatedUser;
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

export function hasActiveMembership(user: AuthenticatedUser, companyId: string): boolean {
  return user.memberships.some(
    membership => 
      membership.company_id === companyId && 
      membership.status === 'active'
  );
}

export function hasAnyActiveMembership(user: AuthenticatedUser): boolean {
  return user.memberships.some(membership => membership.status === 'active');
}