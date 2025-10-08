import { NextRequest, NextResponse } from 'next/server';
import { getWebhookEvents } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const events = await getWebhookEvents(limit);

    return NextResponse.json({ 
      events,
      count: events.length 
    });
  } catch (error) {
    console.error('Error fetching webhook events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhook events' },
      { status: 500 }
    );
  }
}