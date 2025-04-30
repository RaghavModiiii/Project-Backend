import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAttachmentsByTicketId, uploadAttachment, Attachment } from '../api/attachment';

describe('Attachment API functions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        global.console.error = vi.fn();
    });

    describe('getAttachmentsByTicketId', () => {
        const mockAttachments: Attachment[] = [
            {
                id: '1',
                ticketId: 'ticket-123',
                filePath: '/files/doc1.pdf',
                typeOfFile: 'application/pdf',
                fileName: 'doc1.pdf'
            },
            {
                id: '2',
                ticketId: 'ticket-123',
                filePath: '/files/image.png',
                typeOfFile: 'image/png',
                fileName: 'image.png'
            }
        ];

        it('should fetch attachments successfully', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockAttachments)
                })
            );

            const result = await getAttachmentsByTicketId('ticket-123');

            expect(result).toEqual(mockAttachments);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/attachments/ticket-123',
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

            const result = await getAttachmentsByTicketId('non-existent');

            expect(result).toEqual([]);
            expect(console.error).toHaveBeenCalled();
        });

        it('should throw error on network failure', async () => {
            const networkError = new Error('Network error');
            global.fetch = vi.fn().mockRejectedValue(networkError);

            await expect(getAttachmentsByTicketId('ticket-123')).rejects.toThrow(networkError);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('uploadAttachment', () => {
        it('should upload file successfully', async () => {
            const mockResponse = { id: '1', fileName: 'test.pdf' };
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockResponse)
                })
            );

            const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
            const result = await uploadAttachment('ticket-123', file);

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/attachments/upload',
                {
                    method: 'POST',
                    body: expect.any(FormData),
                    credentials: 'include'
                }
            );            // Verify FormData contents
            const mockedFetch = global.fetch as ReturnType<typeof vi.fn>;
            const calledFormData = mockedFetch.mock.calls[0][1].body;
            expect(calledFormData.get('file')).toEqual(file);
            expect(calledFormData.get('ticketId')).toBe('ticket-123');
        });

        it('should throw error on upload failure', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: false,
                    status: 500
                })
            );

            const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
            await expect(uploadAttachment('ticket-123', file))
                .rejects.toThrow('Failed to upload file');
            expect(console.error).toHaveBeenCalled();
        });

        it('should throw error on network failure', async () => {
            const networkError = new Error('Network error');
            global.fetch = vi.fn().mockRejectedValue(networkError);

            const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
            await expect(uploadAttachment('ticket-123', file))
                .rejects.toThrow();
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle large files', async () => {
            const mockResponse = { id: '1', fileName: 'large.pdf' };
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockResponse)
                })
            );

            // Create a 5MB file
            const largeArray = new Uint8Array(5 * 1024 * 1024);
            const file = new File([largeArray], 'large.pdf', { type: 'application/pdf' });
            
            const result = await uploadAttachment('ticket-123', file);
            expect(result).toEqual(mockResponse);
        });
    });
});
