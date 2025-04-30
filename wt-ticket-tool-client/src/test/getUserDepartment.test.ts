import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserDepartment, getUsersOfDepartment, fetchDepartments, Department } from '../api/getUserDepartment';

describe('Department API functions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        global.console.error = vi.fn();
        global.console.warn = vi.fn();
    });

    describe('getUserDepartment', () => {
        it('should fetch department successfully', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ department: 'IT' })
                })
            );

            const result = await getUserDepartment('user@example.com');

            expect(result).toEqual({ department: 'IT' });
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/department/by-email/user@example.com',
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                }
            );
        });

        it('should return null department when user not found (404)', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: false,
                    status: 404
                })
            );

            const result = await getUserDepartment('nonexistent@example.com');

            expect(result).toEqual({ department: null });
        });

        it('should return null department when response has no department', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                })
            );

            const result = await getUserDepartment('user@example.com');

            expect(result).toEqual({ department: null });
        });

        it('should handle network error gracefully', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

            const result = await getUserDepartment('user@example.com');

            expect(result).toEqual({ department: null });
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('getUsersOfDepartment', () => {
        const mockUsers: Department[] = [
            { id: '1', department: 'IT', emailId: 'user1@example.com', isActive: true },
            { id: '2', department: 'IT', emailId: 'user2@example.com', isActive: false }
        ];

        it('should fetch users successfully', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockUsers)
                })
            );

            const result = await getUsersOfDepartment('IT');

            expect(result).toEqual(mockUsers);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/department/by-department/IT',
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                }
            );
        });

        it('should return empty array when no users found', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: false
                })
            );

            const result = await getUsersOfDepartment('EmptyDept');

            expect(result).toEqual([]);
            expect(console.warn).toHaveBeenCalled();
        });

        it('should handle network error gracefully', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

            const result = await getUsersOfDepartment('IT');

            expect(result).toEqual([]);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('fetchDepartments', () => {
        const mockDepartments = [
            { id: '1', name: 'IT' },
            { id: '2', name: 'HR' }
        ];

        it('should fetch all departments successfully', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockDepartments)
                })
            );

            const result = await fetchDepartments();

            expect(result).toEqual(mockDepartments);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/department',
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                }
            );
        });

        it('should return empty array on failed fetch', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: false,
                    status: 500
                })
            );

            const result = await fetchDepartments();

            expect(result).toEqual([]);
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle network error gracefully', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

            const result = await fetchDepartments();

            expect(result).toEqual([]);
            expect(console.error).toHaveBeenCalled();
        });
    });
});
