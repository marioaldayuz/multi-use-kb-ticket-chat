import { Ticket } from '@/lib/types/tickets';
import { formatDistanceToNow } from 'date-fns';
import { Ticket as TicketIcon, Clock, AlertCircle } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
};

export default function TicketCard({ ticket }: TicketCardProps) {
  return (
    <div className="glass-card rounded-lg hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="rounded-full p-2 bg-blue-100">
            <TicketIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {ticket.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {ticket.description}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
            {ticket.priority}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
            {ticket.status}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
          </div>
          {ticket.priority === 'urgent' && (
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              Urgent
            </div>
          )}
        </div>
      </div>
    </div>
  );
}