import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createUserProfile, getUserProfile, updateUserProfile } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user profile from Supabase
    let profile = await getUserProfile(user.id);
    
    // If profile doesn't exist, create it
    if (!profile) {
      profile = await createUserProfile({
        whop_user_id: user.id,
        email: user.email,
        username: user.username,
        profile_picture_url: user.profile_picture_url,
      });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Failed to get/create profile' }, { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { username, profile_picture_url } = body;

    const updatedProfile = await updateUserProfile(user.id, {
      username,
      profile_picture_url,
    });

    if (!updatedProfile) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}