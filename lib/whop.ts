import axios from 'axios';

// Whop API configuration
const WHOP_API_BASE = 'https://api.whop.com/api/v2';

export interface WhopUser {
  id: string;
  email: string;
  username: string;
  profile_picture_url?: string;
  created_at: string;
}

export interface WhopMembership {
  id: string;
  user_id: string;
  company_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  created_at: string;
  expires_at?: string;
}

export interface WhopCompany {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
}

export interface WhopPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly' | 'one_time';
}

class WhopAPI {
  private apiKey: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.apiKey = process.env.WHOP_API_KEY || '';
    this.clientId = process.env.WHOP_CLIENT_ID || '';
    this.clientSecret = process.env.WHOP_CLIENT_SECRET || '';
  }

  // Get OAuth authorization URL
  getAuthUrl(redirectUri: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'read:user read:memberships',
      ...(state && { state }),
    });

    return `https://whop.com/oauth/authorize?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
    try {
      const response = await axios.post('https://whop.com/oauth/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      return response.data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to exchange authorization code for access token');
    }
  }

  // Get user information
  async getUser(accessToken: string): Promise<WhopUser> {
    try {
      const response = await axios.get(`${WHOP_API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user information');
    }
  }

  // Get user memberships
  async getUserMemberships(accessToken: string): Promise<WhopMembership[]> {
    try {
      const response = await axios.get(`${WHOP_API_BASE}/me/memberships`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching memberships:', error);
      throw new Error('Failed to fetch user memberships');
    }
  }

  // Check if user has active membership for a specific company
  async hasActiveMembership(accessToken: string, companyId: string): Promise<boolean> {
    try {
      const memberships = await this.getUserMemberships(accessToken);
      return memberships.some(
        membership => 
          membership.company_id === companyId && 
          membership.status === 'active'
      );
    } catch (error) {
      console.error('Error checking membership:', error);
      return false;
    }
  }

  // Get company information
  async getCompany(companyId: string): Promise<WhopCompany> {
    try {
      const response = await axios.get(`${WHOP_API_BASE}/companies/${companyId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw new Error('Failed to fetch company information');
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const webhookSecret = process.env.WHOP_WEBHOOK_SECRET || '';
    
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }
}

export const whopAPI = new WhopAPI();