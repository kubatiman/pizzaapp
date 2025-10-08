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

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Redirect to login if not authenticated
          router.push('/?redirect=/dashboard');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/?redirect=/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
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

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Profile</h3>
            <p className="text-gray-600">Manage your account settings</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Memberships</h3>
            <p className="text-gray-600">View your active memberships</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Settings</h3>
            <p className="text-gray-600">Configure your preferences</p>
          </div>
        </div>

        <div className="mt-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Your Memberships</h2>
            {user.memberships && user.memberships.length > 0 ? (
              <div className="space-y-3">
                {user.memberships.map((membership) => (
                  <div key={membership.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Company: {membership.company_id}</p>
                        <p className="text-sm text-gray-600">Plan: {membership.plan_id}</p>
                        <p className="text-sm text-gray-600">
                          Created: {new Date(membership.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        membership.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {membership.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No memberships found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}