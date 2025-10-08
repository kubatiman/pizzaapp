import { NextRequest, NextResponse } from 'next/server';
import { whopAPI } from '@/lib/whop';
import { SignJWT } from 'jose';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL('/?error=oauth_error', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }

    // Verify state parameter
    const storedState = request.cookies.get('whop_oauth_state')?.value;
    if (!state || state !== storedState) {
      console.error('Invalid state parameter');
      return NextResponse.redirect(new URL('/?error=invalid_state', request.url));
    }

    const redirectUri = process.env.WHOP_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

    // Exchange code for access token
    const tokenData = await whopAPI.exchangeCodeForToken(code, redirectUri);
    
    // Get user information
    const user = await whopAPI.getUser(tokenData.access_token);
    
    // Get user memberships
    const memberships = await whopAPI.getUserMemberships(tokenData.access_token);

    // Create JWT token
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');
    const token = await new SignJWT({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profile_picture_url: user.profile_picture_url,
        memberships: memberships,
      },
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    // Set JWT as HTTP-only cookie
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('whop_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
    });

    // Clear OAuth state cookie
    response.cookies.delete('whop_oauth_state');

    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/?error=callback_error', request.url));
  }
}