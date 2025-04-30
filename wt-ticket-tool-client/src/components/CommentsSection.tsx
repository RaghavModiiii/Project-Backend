import React, { useEffect, useState } from 'react';
import {
  fetchCommentsByTicketId,
  addCommentToTicket,
  editTicketComment,
} from '../api/comments';
import { TicketComment, CommentDto } from '../api/comments';
import { Ticket } from '../api/ticketApi';
import { fetchTicketById } from '../api/ticketApi';

interface CommentsSectionProps {
  ticketId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ ticketId }) => {
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const currentUser = localStorage.getItem('email') || 'testuser@example.com';

  // Loads comments for the given ticket ID
  useEffect(() => {
    loadComments();
  }, [ticketId]);

  // Loads ticket details for the given ticket ID
  useEffect(() => {
    const loadTicket = async () => {
      try {
        const data = await fetchTicketById(ticketId);
        setTicket(data);
      } catch (error) {
        console.error('Error loading ticket:', error);
      }
    };

    loadTicket();
  }, [ticketId]);

  // Fetches comments for the ticket
  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await fetchCommentsByTicketId(ticketId);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments', error);
    } finally {
      setLoading(false);
    }
  };

  // Adds a new comment to the ticket
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const commentDto: CommentDto = {
      comment: newComment,
      commentedBy: currentUser,
    };

    try {
      await addCommentToTicket(ticketId, commentDto);
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  // Checks if a comment is editable (within 15 minutes of creation)
  const isEditable = (commentedDate: string | Date): boolean => {
    const commentTime = new Date(commentedDate).getTime();
    const currentTime = new Date().getTime();
    const diffInMinutes = (currentTime - commentTime) / (1000 * 60);
    return diffInMinutes < 15;
  };

  // Edits an existing comment
  const handleEditComment = async (comment: TicketComment) => {
    const editedComment = prompt('Edit your comment:', comment.comment);
    if (!editedComment || editedComment === comment.comment) return;

    try {
      await editTicketComment(comment.commentId.toString(), {
        newComment: editedComment,
        user: currentUser,
      });
      loadComments();
    } catch (error) {
      alert(error);
      console.error('Failed to edit comment', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      {loading && <div className="text-gray-600">Loading comments...</div>}

      <ul className="space-y-4">
        {comments.length === 0 && !loading && (
          <li className="text-gray-500">No comments yet.</li>
        )}

        {ticket?.status !== 'Closed' ? (
          <div className="flex flex-col space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="border border-gray-300 rounded-md p-3 resize-none focus:ring focus:ring-blue-200 focus:border-blue-500"
              rows={3}
              placeholder="Write your comment..."
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddComment}
                className="text-white px-4 py-2 rounded-md shadow bg-blue-900 transition duration-300 disabled:bg-blue-300"
                disabled={!newComment.trim()}
              >
                Add Comment
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm italic">
            This ticket is closed. No new comments can be added.
          </div>
        )}

        {[...comments]
          .sort(
            (a, b) =>
              new Date(b.commentedDate).getTime() -
              new Date(a.commentedDate).getTime()
          )
          .map((comment) => (
            <li
              key={comment.commentId}
              className="border border-gray-300 rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-end w-full">
                <p className="text-gray-800 whitespace-pre-wrap flex-1 pr-4">
                  {comment.comment}
                </p>
                <div className="flex flex-col items-end text-right text-xs text-gray-500">
                  <span>{comment.commentedBy}</span>
                  <span className="text-[10px]">
                    {new Date(comment.commentedDate).toLocaleString()}
                    {comment.isEdited && (
                      <span className="ml-1 italic">(edited)</span>
                    )}
                  </span>
                </div>
              </div>
              {comment.commentedBy === currentUser &&
                isEditable(comment.commentedDate) && (
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleEditComment(comment)}
                      className="text-blue-600 text-xs hover:underline focus:outline-none"
                    >
                      Edit
                    </button>
                  </div>
                )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default CommentsSection;