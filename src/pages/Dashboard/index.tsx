import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { KnowledgeBase } from '@/lib/types';
import Header from '@/components/Layout/Header';
import CreateKnowledgeBaseModal from './components/CreateKnowledgeBaseModal';
import KnowledgeBaseList from './components/KnowledgeBaseList';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadKnowledgeBases();
    }
  }, [user]);

  const loadKnowledgeBases = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_bases')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setKnowledgeBases(data);
      }
    } catch (err) {
      console.error('Failed to load knowledge bases:', err);
    }
  };

  const handleCreateSuccess = async () => {
    await loadKnowledgeBases();
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header
        title="Knowledge Bases"
        subtitle="Manage and organize your documentation"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in">
          <KnowledgeBaseList 
            knowledgeBases={knowledgeBases}
            onUpdate={loadKnowledgeBases}
          />
        </div>

        {isCreateModalOpen && (
          <CreateKnowledgeBaseModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreated={handleCreateSuccess}
          />
        )}
      </main>
    </div>
  );
}