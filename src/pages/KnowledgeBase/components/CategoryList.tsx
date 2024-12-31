import { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { DragDropContext, DroppableWrapper } from '@/components/DragDropWrapper';
import { Category, Article } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import { ChevronRight, ChevronDown, Plus, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreateArticleModal from './CreateArticleModal';
import ArticleEditor from './ArticleEditor';
import { fetchArticles } from '@/lib/api/articles';

interface CategoryListProps {
  categories: Category[];
  onCategoryOrderChange: () => void;
}

export default function CategoryList({
  categories,
  onCategoryOrderChange,
}: CategoryListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [articles, setArticles] = useState<Record<string, Article[]>>({});
  const [createArticleModal, setCreateArticleModal] = useState<{
    isOpen: boolean;
    categoryId: string;
  }>({ isOpen: false, categoryId: '' });
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const toggleCategory = async (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (expandedCategories.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
      await loadArticles(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const loadArticles = async (categoryId: string) => {
    try {
      const data = await fetchArticles(categoryId);
      setArticles(prev => ({
        ...prev,
        [categoryId]: data
      }));
    } catch (err) {
      console.error('Failed to load articles:', err);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const updatedCategories = Array.from(categories);
    const [removed] = updatedCategories.splice(sourceIndex, 1);
    updatedCategories.splice(destinationIndex, 0, removed);

    const updates = updatedCategories.map((category, index) => ({
      id: category.id,
      order_index: index,
    }));

    const { error } = await supabase
      .from('categories')
      .upsert(updates);

    if (!error) {
      onCategoryOrderChange();
    }
  };

  const handleArticleCreated = async (categoryId: string) => {
    await loadArticles(categoryId);
    setCreateArticleModal({ isOpen: false, categoryId: '' });
  };

  const handleArticleDeleted = async () => {
    if (selectedArticle) {
      const article = Object.values(articles)
        .flat()
        .find(a => a.id === selectedArticle);
      
      if (article) {
        await loadArticles(article.category_id);
      }
      setSelectedArticle(null);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <Book className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No categories</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <DroppableWrapper droppableId="categories">
            {(provided, snapshot) => (
              <>
                {categories.map((category, index) => (
                  <Draggable
                    key={category.id}
                    draggableId={category.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="border-b last:border-b-0"
                      >
                        <div
                          className="p-4 hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleCategory(category.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {expandedCategories.has(category.id) ? (
                                <ChevronDown className="h-4 w-4 mr-2" />
                              ) : (
                                <ChevronRight className="h-4 w-4 mr-2" />
                              )}
                              <div>
                                <h3 className="font-medium">{category.title}</h3>
                                {category.description && (
                                  <p className="text-sm text-gray-500">
                                    {category.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCreateArticleModal({
                                  isOpen: true,
                                  categoryId: category.id,
                                });
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {expandedCategories.has(category.id) && (
                          <div className="pl-8 pr-4 pb-2">
                            {articles[category.id]?.map((article) => (
                              <div
                                key={article.id}
                                className="py-2 px-4 hover:bg-gray-50 cursor-pointer rounded"
                                onClick={() => setSelectedArticle(article.id)}
                              >
                                <h4 className="text-sm font-medium">
                                  {article.title}
                                </h4>
                                {article.description && (
                                  <p className="text-xs text-gray-500">
                                    {article.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
              </>
            )}
          </DroppableWrapper>
        </DragDropContext>
      </div>

      {selectedArticle && (
        <div className="lg:h-[calc(100vh-12rem)] sticky top-6">
          <ArticleEditor
            articleId={selectedArticle}
            onClose={() => setSelectedArticle(null)}
            onDelete={handleArticleDeleted}
          />
        </div>
      )}

      <CreateArticleModal
        isOpen={createArticleModal.isOpen}
        onClose={() => setCreateArticleModal({ isOpen: false, categoryId: '' })}
        categoryId={createArticleModal.categoryId}
        onCreated={handleArticleCreated}
      />
    </div>
  );
}