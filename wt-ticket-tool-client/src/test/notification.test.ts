import { describe, it, expect, vi, beforeEach } from 'vitest';
import { markAsRead, getNotificationsByEmail, Notification } from '../api/notification';

describe('Notification API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        global.console.error = vi.fn();
    });

    const mockNotifications: Notification[] = [
        {
            id: 1,
            emailId: 'user@example.com',
            message: 'Test notification 1',
            read: false,
            timestamp: '2025-04-26T10:00:00Z'
        },
        {
            id: 2,
            emailId: 'user@example.com',
            message: 'Test notification 2',
            read: true,
            timestamp: '2025-04-26T11:00:00Z'
        }
    ];

    describe('markAsRead', () => {
        it('should mark notification as read successfully', async () => {
            const mockResponse = {
                ...mockNotifications[0],
                read: true
            };

            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockResponse)
                })
            );

            const result = await markAsRead(1);

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/notifications/read/1',
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ read: true }),
                    credentials: 'include'
                }
            );
        });

        it('should throw error when marking notification fails', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: false,
                    status: 500
                })
            );

            await expect(markAsRead(1))
                .rejects.toThrow('Failed to mark notification as read');
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle network error gracefully', async () => {
            const networkError = new Error('Network error');
            global.fetch = vi.fn().mockRejectedValue(networkError);

            await expect(markAsRead(1)).rejects.toThrow(networkError);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('getNotificationsByEmail', () => {
        it('should fetch notifications successfully', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockNotifications),
                                text: () => Promise.resolve(JSON.stringify(mockNotifications)) 

                })
            );

            const result = await getNotificationsByEmail('user@example.com');

            expect(result).toEqual(mockNotifications);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/notifications/user@example.com',
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                }
            );
        });

        it('should throw error when fetch fails', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: false,
                    status: 500
                })
            );

            await expect(getNotificationsByEmail('user@example.com'))
                .rejects.toThrow('Failed to fetch notifications');
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle network error gracefully', async () => {
            const networkError = new Error('Network error');
            global.fetch = vi.fn().mockRejectedValue(networkError);

            await expect(getNotificationsByEmail('user@example.com'))
                .rejects.toThrow(networkError);
            expect(console.error).toHaveBeenCalled();
        });


                
        

        it('should handle empty notifications array', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                    text: () => Promise.resolve('[]')
                })
            );

            const result = await getNotificationsByEmail('user@example.com');
            expect(result).toEqual([]);
        });
    });
});
