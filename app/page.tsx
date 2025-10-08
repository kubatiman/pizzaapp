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

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Whop App
          </h1>
          <p className="text-xl text-gray-600">
            A functional membership-gated experience powered by Whop
          </p>
        </div>

        {user ? (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-semibold mb-4">Welcome back!</h2>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>User ID:</strong> {user.id}</p>
                {user.profile_picture_url && (
                  <img 
                    src={user.profile_picture_url} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full"
                  />
                )}
              </div>
              <button 
                onClick={handleLogout}
                className="btn-secondary mt-4"
              >
                Logout
              </button>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Membership Status</h3>
              {user.memberships && user.memberships.length > 0 ? (
                <div className="space-y-2">
                  {user.memberships.map((membership) => (
                    <div key={membership.id} className="p-3 bg-gray-50 rounded">
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-sm ${
                          membership.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {membership.status}
                        </span>
                      </p>
                      <p><strong>Company ID:</strong> {membership.company_id}</p>
                      <p><strong>Plan ID:</strong> {membership.plan_id}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No active memberships found.</p>
              )}
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Protected Content</h3>
              <p className="text-gray-600 mb-4">
                This content is only accessible to authenticated Whop members.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900">🎉 Exclusive Feature</h4>
                <p className="text-blue-700">
                  You have access to our premium features! This could be anything from 
                  exclusive content to special tools and resources.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card text-center">
            <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
            <p className="text-gray-600 mb-6">
              Sign in with your Whop account to access exclusive content and features.
            </p>
            <button 
              onClick={handleLogin}
              className="btn-primary text-lg px-8 py-3"
            >
              Login with Whop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}