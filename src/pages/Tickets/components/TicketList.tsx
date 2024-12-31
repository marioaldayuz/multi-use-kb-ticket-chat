import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTickets } from '@/lib/api/tickets';
import type { Ticket } from '@/lib/types/tickets';
import TicketCard from './TicketCard';
import { Loader, AlertCircle, Ticket as TicketIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTickets();
      setTickets(data);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError('Unable to load tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Tickets</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={loadTickets}>Try Again</Button>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tickets Found</h3>
        <p className="text-gray-500">Create your first support ticket to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-in">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          onClick={() => navigate(`/tickets/${ticket.id}`)}
          className="cursor-pointer"
        >
          <TicketCard ticket={ticket} />
        </div>
      ))}
    </div>
  );
}