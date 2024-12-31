import { useState, useEffect } from 'react';
import { fetchArticle, updateArticle, deleteArticle } from '@/lib/api/articles';
import { Article } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { X, Save, Trash2, AlertCircle, ExternalLink } from 'lucide-react';
import Editor from '@/components/Editor';

interface ArticleEditorProps {
  articleId: string;
  onClose: () => void;
  onDelete: () => void;
}

export default function ArticleEditor({ articleId, onClose, onDelete }: ArticleEditorProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    try {
      const data = await fetchArticle(articleId);
      setArticle(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setContent(data.content || '');
      setError('');
    } catch (err) {
      console.error('Load article error:', err);
      setError('Failed to load article');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      const updatedArticle = await updateArticle(articleId, {
        title: title.trim(),
        description: description.trim() || null,
        content: content.trim() || null,
      });
      setArticle(updatedArticle);
      setError('');
    } catch (err) {
      console.error('Save article error:', err);
      setError('Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteArticle(articleId);
      onDelete();
    } catch (err) {
      console.error('Delete article error:', err);
      setError('Failed to delete article');
    }
  };

  const openPublicView = () => {
    window.open(`/article/${articleId}`, '_blank');
  };

  if (!article) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full"
          placeholder="Article Title"
        />
        <div className="flex items-center gap-2">
          {showDeleteConfirm ? (
            <>
              <span className="text-sm text-red-600">Delete article?</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                Confirm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={openPublicView}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="m-4 p-2 bg-red-50 text-red-600 rounded flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <Editor
            content={content}
            onChange={setContent}
            placeholder="Write your article content here..."
          />
        </div>
      </div>
    </div>
  );
}