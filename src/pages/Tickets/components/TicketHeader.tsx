import { TicketPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TicketHeaderProps {
  onCreateClick: () => void;
}

export default function TicketHeader({ onCreateClick }: TicketHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Support Tickets
            </h1>
            <p className="mt-1 text-gray-500">
              Manage and track support requests
            </p>
          </div>
          <Button onClick={onCreateClick}>
            <TicketPlus className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        </div>
      </div>
    </header>
  );
}