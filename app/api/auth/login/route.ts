import { NextRequest, NextResponse } from 'next/server';
import { whopAPI } from '@/lib/whop';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUri = process.env.WHOP_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';
    
    // Generate state parameter for security
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state in a cookie for verification
    const response = NextResponse.redirect(
      whopAPI.getAuthUrl(redirectUri, state)
    );
    
    response.cookies.set('whop_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate login' },
      { status: 500 }
    );
  }
}