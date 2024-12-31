import { Settings, PlusCircle, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  onCreateClick: () => void;
  onSettingsClick: () => void;
}

export default function DashboardHeader({ onCreateClick, onSettingsClick }: DashboardHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Knowledge Bases
            </h1>
            <p className="mt-1 text-gray-500">
              Manage and organize your documentation
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              asChild
              className="hidden sm:flex"
            >
              <Link to="/tickets">
                <Ticket className="h-4 w-4 mr-2" />
                Tickets
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={onSettingsClick}
              className="hidden sm:flex"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button onClick={onCreateClick}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}