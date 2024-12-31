import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Article } from '@/lib/types';
import { fetchPublicArticle } from '@/lib/api/articles/public';
import { Book, Loader } from 'lucide-react';

export default function PublicArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadArticle(id);
    }
  }, [id]);

  const loadArticle = async (articleId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading article:', articleId);
      const data = await fetchPublicArticle(articleId);
      console.log('Loaded article:', data);
      setArticle(data);
    } catch (err) {
      const error = err as Error;
      console.error('Error loading article:', error.message);
      setError(error.message || 'Article not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Book className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Article not found</h3>
          <p className="mt-1 text-sm text-gray-500">The article you're looking for doesn't exist or is private.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
            {article.description && (
              <p className="text-lg text-gray-600 mb-8">{article.description}</p>
            )}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content || '' }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}