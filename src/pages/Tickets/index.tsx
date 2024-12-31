import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import TicketList from './components/TicketList';
import CreateTicketModal from './components/CreateTicketModal';
import { Button } from '@/components/ui/button';
import { TicketPlus } from 'lucide-react';

export default function TicketsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header
        title="Support Tickets"
        subtitle="Manage and track support requests"
        showBack
        backTo="/dashboard"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <TicketPlus className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <TicketList />
        
        {isCreateModalOpen && (
          <CreateTicketModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreated={() => {
              setIsCreateModalOpen(false);
            }}
          />
        )}
      </main>
    </div>
  );
}