import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchCommentsByTicketId, addCommentToTicket, editTicketComment, TicketComment, CommentDto, EditCommentDto } from '../api/comments';

describe('Comments API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        global.console.error = vi.fn();
    });

    const mockComments: TicketComment[] = [
        {
            commentId: 1,
            comment: 'Test comment 1',
            commentedBy: 'user@example.com',
            commentedDate: '2025-04-26T10:00:00Z',
            isEdited: false,
            ticketId: { ticketId: 'ticket-123' }
        },
        {
            commentId: 2,
            comment: 'Test comment 2',
            commentedBy: 'user@example.com',
            commentedDate: '2025-04-26T11:00:00Z',
            editedDate: '2025-04-26T11:30:00Z',
            isEdited: true,
            ticketId: { ticketId: 'ticket-123' }
        }
    ];

    describe('fetchCommentsByTicketId', () => {
        it('should fetch comments successfully', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockComments)
                })
            );

            const result = await fetchCommentsByTicketId('ticket-123');

            expect(result).toEqual(mockComments);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/comments/ticket-123',
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                }
            );
        });

        it('should return empty array on non-ok response', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: false,
                    status: 404
                })
            );

            const result = await fetchCommentsByTicketId('non-existent');

            expect(result).toEqual([]);
            expect(console.error).toHaveBeenCalled();
        });

        it('should throw error on network failure', async () => {
            const networkError = new Error('Network error');
            global.fetch = vi.fn().mockRejectedValue(networkError);

            await expect(fetchCommentsByTicketId('ticket-123')).rejects.toThrow(networkError);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('addCommentToTicket', () => {
        const newComment: CommentDto = {
            comment: 'New test comment',
            commentedBy: 'user@example.com'
        };

        it('should add comment successfully', async () => {
            const mockResponse = {
                commentId: 3,
                ...newComment,
                commentedDate: '2025-04-26T12:00:00Z',
                isEdited: false,
                ticketId: { ticketId: 'ticket-123' }
            };

            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockResponse)
                })
            );

            const result = await addCommentToTicket('ticket-123', newComment);

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/comments/ticket-123/add',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newComment),
                    credentials: 'include'
                }
            );
        });

        it('should throw error on failed comment addition', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: false,
                    status: 500
                })
            );

            await expect(addCommentToTicket('ticket-123', newComment))
                .rejects.toThrow('Failed to add comment');
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('editTicketComment', () => {
        const editComment: EditCommentDto = {
            newComment: 'Updated comment',
            user: 'user@example.com'
        };

        it('should edit comment successfully', async () => {
            const mockResponse = {
                commentId: 1,
                comment: editComment.newComment,
                commentedBy: editComment.user,
                commentedDate: '2025-04-26T10:00:00Z',
                editedDate: '2025-04-26T12:00:00Z',
                isEdited: true,
                ticketId: { ticketId: 'ticket-123' }
            };

            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockResponse)
                })
            );

            const result = await editTicketComment('1', editComment);

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/comments/1/edit',
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(editComment),
                    credentials: 'include'
                }
            );
        });

        it('should throw error when editing after time limit', async () => {
            const errorMessage = 'Comment can only be edited within 15 minutes of creation';
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: false,
                    json: () => Promise.resolve({ message: errorMessage })
                })
            );

            await expect(editTicketComment('1', editComment))
                .rejects.toThrow(errorMessage);
            expect(console.error).toHaveBeenCalled();
        });

        it('should throw error on network failure', async () => {
            const networkError = new Error('Network error');
            global.fetch = vi.fn().mockRejectedValue(networkError);

            await expect(editTicketComment('1', editComment))
                .rejects.toThrow(networkError);
            expect(console.error).toHaveBeenCalled();
        });
    });
});
