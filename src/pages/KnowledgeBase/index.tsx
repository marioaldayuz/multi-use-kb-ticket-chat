import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { KnowledgeBase as KnowledgeBaseType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Header from '@/components/Layout/Header';
import CategoryList from './components/CategoryList';
import CreateCategoryModal from './components/CreateCategoryModal';
import { fetchCategories } from '@/lib/api/categories';

export default function KnowledgeBase() {
  const { id } = useParams();
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseType | null>(null);
  const [categories, setCategories] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadKnowledgeBase();
      loadCategories();
    }
  }, [id]);

  const loadKnowledgeBase = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('knowledge_bases')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      setKnowledgeBase(data);
    }
  };

  const loadCategories = async () => {
    if (!id) return;
    try {
      const data = await fetchCategories(id);
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleCreateSuccess = async () => {
    await loadCategories();
    setIsCreateModalOpen(false);
  };

  if (!knowledgeBase) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header
        title={knowledgeBase.name}
        subtitle={knowledgeBase.description}
        showBack
        backTo="/dashboard"
        backLabel="Back to Dashboard"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <CategoryList 
          categories={categories}
          onCategoryOrderChange={loadCategories}
        />

        {isCreateModalOpen && (
          <CreateCategoryModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            knowledgeBaseId={id!}
            onCreated={handleCreateSuccess}
          />
        )}
      </main>
    </div>
  );
}