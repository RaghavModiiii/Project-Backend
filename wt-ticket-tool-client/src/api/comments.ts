// Interface representing a ticket comment
export interface TicketComment {
  commentId: number;
  comment: string;
  commentedBy: string;
  commentedDate: string; // ISO date string
  editedDate?: string | null; // Nullable
  isEdited: boolean;
  ticketId: {
    ticketId: string;
  };
}

// Interface for adding a new comment
export interface CommentDto {
  comment: string;
  commentedBy: string;
}

// Interface for editing an existing comment
export interface EditCommentDto {
  newComment: string;
  user: string;
}

// Base URL for the comments API
const API_BASE_URL = 'http://localhost:8080/api/comments';

/**
 * Fetch all comments for a specific ticket.
 * @param ticketId - The ID of the ticket.
 * @returns A promise that resolves to an array of comments.
 * @throws An error if the request fails.
 */
export const fetchCommentsByTicketId = async (ticketId: string): Promise<TicketComment[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${ticketId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to fetch comments. Status:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

/**
 * Add a new comment to a ticket.
 * @param ticketId - The ID of the ticket.
 * @param commentDto - The comment data to be added.
 * @returns A promise that resolves to the added comment.
 * @throws An error if the request fails.
 */
export const addCommentToTicket = async (ticketId: string, commentDto: CommentDto): Promise<TicketComment> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${ticketId}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentDto),
      credentials: 'include',
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to add comment. Status:', response.status);
      throw new Error('Failed to add comment');
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

/**
 * Edit an existing comment.
 * @param commentId - The ID of the comment to edit.
 * @param editCommentDto - The updated comment data.
 * @returns A promise that resolves to the updated comment.
 * @throws An error if the request fails.
 */
export const editTicketComment = async (commentId: string, editCommentDto: EditCommentDto): Promise<TicketComment> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${commentId}/edit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editCommentDto),
      credentials: 'include',
    });

    if (response.ok) {
      return await response.json();
    } else {
      const errorData = await response.json();
      console.error('Error editing comment:', errorData);
      throw new Error(errorData.message || 'Error editing comment');
    }
  } catch (error) {
    console.error('Error editing comment:', error);
    throw error;
  }
};
