'use client';

import { useState, useEffect } from 'react';

interface WebhookEvent {
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

export default function WebhookEvents() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/webhooks/events?limit=100');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      } else {
        setError('Failed to fetch webhook events');
      }
    } catch (err) {
      setError('Error fetching webhook events');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getEventTypeColor = (eventType: string) => {
    if (eventType.includes('membership')) return 'bg-blue-100 text-blue-800';
    if (eventType.includes('user')) return 'bg-green-100 text-green-800';
    if (eventType.includes('payment')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={fetchEvents}
              className="btn-primary mt-4"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Webhook Events</h1>
          <button 
            onClick={fetchEvents}
            className="btn-secondary"
          >
            Refresh
          </button>
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membership ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.event_type)}`}>
                        {event.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.whop_user_id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.whop_membership_id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.company_id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        event.processed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {event.processed ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(event.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => {
                          const modal = document.getElementById(`modal-${event.id}`);
                          if (modal) {
                            (modal as any).showModal();
                          }
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {events.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No webhook events found.</p>
            </div>
          )}
        </div>

        {/* Event Detail Modals */}
        {events.map((event) => (
          <dialog key={event.id} id={`modal-${event.id}`} className="modal">
            <div className="modal-box max-w-4xl">
              <h3 className="font-bold text-lg mb-4">Event Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Event Type:</h4>
                  <p className="text-gray-600">{event.event_type}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Created At:</h4>
                  <p className="text-gray-600">{formatDate(event.created_at)}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Processed:</h4>
                  <p className="text-gray-600">{event.processed ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Payload:</h4>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </div>
              </div>
              <div className="modal-action">
                <form method="dialog">
                  <button className="btn-secondary">Close</button>
                </form>
              </div>
            </div>
          </dialog>
        ))}
      </div>
    </div>
  );
}