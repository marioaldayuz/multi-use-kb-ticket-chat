import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTicket, updateTicketStatus } from '@/lib/api/tickets';
import { createComment, fetchComments } from '@/lib/api/tickets/comments';
import type { Ticket, TicketComment } from '@/lib/types/tickets';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadTicket(id);
      loadComments(id);
    }
  }, [id]);

  const loadTicket = async (ticketId: string) => {
    try {
      const data = await fetchTicket(ticketId);
      setTicket(data);
    } catch (err) {
      setError('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (ticketId: string) => {
    try {
      const data = await fetchComments(ticketId);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleStatusChange = async (status: Ticket['status']) => {
    if (!ticket) return;
    try {
      await updateTicketStatus(ticket.id, status);
      loadTicket(ticket.id);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !newComment.trim()) return;

    try {
      await createComment(ticket.id, newComment);
      setNewComment('');
      loadComments(ticket.id);
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !ticket) {
    return <div>Error: {error || 'Ticket not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/tickets')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                  ${ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' : 
                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'}`}>
                  {ticket.priority}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                    ticket.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                    ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {ticket.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {ticket.status !== 'closed' && (
                <>
                  {ticket.status === 'open' && (
                    <Button onClick={() => handleStatusChange('in_progress')}>
                      Start Working
                    </Button>
                  )}
                  {ticket.status === 'in_progress' && (
                    <Button onClick={() => handleStatusChange('resolved')}>
                      Mark Resolved
                    </Button>
                  )}
                  {ticket.status === 'resolved' && (
                    <Button onClick={() => handleStatusChange('closed')}>
                      Close Ticket
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="glass-card rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div className="glass-card rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Comments</h2>
              <div className="space-y-4 mb-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {comment.user?.full_name || comment.user?.email}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleCommentSubmit}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <Button type="submit" disabled={!newComment.trim()}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass-card rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <div className="mt-1 flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-gray-900">
                    {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {ticket.resolved_at && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Resolved</h3>
                  <div className="mt-1 flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-gray-900">
                      {formatDistanceToNow(new Date(ticket.resolved_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              )}

              {ticket.priority === 'urgent' && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-red-800 font-medium">Urgent Priority</span>
                  </div>
                  <p className="mt-1 text-sm text-red-700">
                    This ticket requires immediate attention.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}