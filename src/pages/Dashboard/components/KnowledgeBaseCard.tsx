import { KnowledgeBase } from '@/lib/types';
import { Book, Globe, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface KnowledgeBaseCardProps {
  knowledgeBase: KnowledgeBase;
  onClick: () => void;
}

export default function KnowledgeBaseCard({ knowledgeBase, onClick }: KnowledgeBaseCardProps) {
  return (
    <div
      className="group glass-card overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {knowledgeBase.name}
              </h3>
            </div>
            {knowledgeBase.description && (
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                {knowledgeBase.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          {knowledgeBase.domain && (
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span>{knowledgeBase.domain}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(knowledgeBase.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
      
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform" />
    </div>
  );
}