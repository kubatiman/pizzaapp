import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types
export interface UserProfile {
  id: string;
  whop_user_id: string;
  email: string;
  username: string;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MembershipRecord {
  id: string;
  whop_user_id: string;
  whop_membership_id: string;
  company_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  created_at: string;
  expires_at?: string;
  last_synced: string;
}

export interface WebhookEvent {
  id: string;
  event_type: string;
  whop_user_id?: string;
  whop_membership_id?: string;
  company_id?: string;
  plan_id?: string;
  payload: any;
  processed: boolean;
  created_at: string;
}

// User profile operations
export async function createUserProfile(userData: {
  whop_user_id: string;
  email: string;
  username: string;
  profile_picture_url?: string;
}): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
}

export async function getUserProfile(whopUserId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('whop_user_id', whopUserId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserProfile(whopUserId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(updates)
      .eq('whop_user_id', whopUserId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

// Membership operations
export async function syncMembership(membershipData: {
  whop_user_id: string;
  whop_membership_id: string;
  company_id: string;
  plan_id: string;
  status: string;
  expires_at?: string;
}): Promise<MembershipRecord | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('memberships')
      .upsert([{
        ...membershipData,
        last_synced: new Date().toISOString(),
      }], {
        onConflict: 'whop_membership_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error syncing membership:', error);
    return null;
  }
}

export async function getUserMemberships(whopUserId: string): Promise<MembershipRecord[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('memberships')
      .select('*')
      .eq('whop_user_id', whopUserId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching memberships:', error);
    return [];
  }
}

// Webhook event logging
export async function logWebhookEvent(eventData: {
  event_type: string;
  whop_user_id?: string;
  whop_membership_id?: string;
  company_id?: string;
  plan_id?: string;
  payload: any;
}): Promise<WebhookEvent | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('webhook_events')
      .insert([{
        ...eventData,
        processed: false,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error logging webhook event:', error);
    return null;
  }
}

export async function getWebhookEvents(limit: number = 50): Promise<WebhookEvent[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('webhook_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching webhook events:', error);
    return [];
  }
}