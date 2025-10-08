'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username: string;
  profile_picture_url?: string;
  memberships: Array<{
    id: string;
    user_id: string;
    company_id: string;
    plan_id: string;
    status: string;
    created_at: string;
    expires_at?: string;
  }>;
}

export default function Premium() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveMembership, setHasActiveMembership] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndMembership = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          
          // Check if user has any active membership
          const hasActive = userData.memberships && 
            userData.memberships.some((m: { status: string }) => m.status === 'active');
          setHasActiveMembership(hasActive);
          
          if (!hasActive) {
            // Redirect to upgrade page or show upgrade prompt
            setTimeout(() => {
              router.push('/?upgrade=true');
            }, 2000);
          }
        } else {
          router.push('/?redirect=/premium');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/?redirect=/premium');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndMembership();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (!hasActiveMembership) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Premium Access Required
            </h1>
            <p className="text-gray-600 mb-6">
              You need an active Whop membership to access this premium content.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                Redirecting you to upgrade your membership...
              </p>
            </div>
            <button 
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Premium Content</h1>
        
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">🎉 Welcome to Premium!</h2>
            <p className="text-gray-600 mb-4">
              You have access to our exclusive premium features and content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Exclusive Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Advanced analytics dashboard</li>
                <li>• Priority customer support</li>
                <li>• Early access to new features</li>
                <li>• Custom integrations</li>
              </ul>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Premium Resources</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Exclusive tutorials and guides</li>
                <li>• Private community access</li>
                <li>• Monthly expert sessions</li>
                <li>• Premium templates and tools</li>
              </ul>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-xl font-semibold mb-3">Your Membership Benefits</h3>
            <div className="space-y-2">
              {user.memberships
                .filter((m) => m.status === 'active')
                .map((membership) => (
                  <div key={membership.id} className="p-3 bg-white rounded border">
                    <p><strong>Company:</strong> {membership.company_id}</p>
                    <p><strong>Plan:</strong> {membership.plan_id}</p>
                    <p><strong>Status:</strong> 
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        {membership.status}
                      </span>
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}