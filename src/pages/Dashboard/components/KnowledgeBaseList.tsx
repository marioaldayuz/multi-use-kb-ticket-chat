import { KnowledgeBase } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import KnowledgeBaseCard from './KnowledgeBaseCard';

interface KnowledgeBaseListProps {
  knowledgeBases: KnowledgeBase[];
  onUpdate: () => void;
}

export default function KnowledgeBaseList({ knowledgeBases }: KnowledgeBaseListProps) {
  const navigate = useNavigate();

  return (
    <>
      {knowledgeBases.map((kb) => (
        <KnowledgeBaseCard
          key={kb.id}
          knowledgeBase={kb}
          onClick={() => navigate(`/kb/${kb.id}`)}
        />
      ))}
    </>
  );
}