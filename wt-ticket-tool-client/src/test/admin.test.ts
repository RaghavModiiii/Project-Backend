import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchUsers, getAllDepartments, updateDepartmentStatus } from '../api/admin';
import { Department } from '../api/getUserDepartment';

describe('admin API functions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });    describe('fetchUsers', () => {
        it('should fetch users for a department successfully', async () => {
            const mockDepartmentUsers: Department[] = [
                { id: '1', emailId: 'user1@example.com', department: 'IT', isActive: true },
                { id: '2', emailId: 'user2@example.com', department: 'IT', isActive: false }
            ];

            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockDepartmentUsers)
                })
            );

            const result = await fetchUsers('IT');

            expect(result).toEqual(mockDepartmentUsers);
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

        it('should throw error when fetch fails', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: false,
                    status: 500
                })
            );

            await expect(fetchUsers('IT')).rejects.toThrow('Failed to fetch users for department');
        });

        it('should throw error on network failure', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

            await expect(fetchUsers('IT')).rejects.toThrow();
        });
    });

    describe('getAllDepartments', () => {
        it('should fetch all departments successfully', async () => {
            const mockDepartments = ['IT', 'HR', 'Finance'];

            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockDepartments)
                })
            );

            const result = await getAllDepartments();

            expect(result).toEqual(mockDepartments);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/department/unique',
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

            await expect(getAllDepartments()).rejects.toThrow('Failed to fetch departments');
        });

        it('should throw error on network failure', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

            await expect(getAllDepartments()).rejects.toThrow();
        });

        it('should return empty array when no departments exist', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([])
                })
            );

            const result = await getAllDepartments();
            expect(result).toEqual([]);
        });
    });

    describe('updateDepartmentStatus', () => {
        it('should update department status successfully', async () => {
            const mockResponse = { success: true };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await updateDepartmentStatus('john.doe@example.com', true);
            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/department/status/john.doe@example.com',
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: true }),
                    credentials: 'include',
                }
            );
        });

        it('should throw an error when the response is not ok', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
            });

            await expect(updateDepartmentStatus('john.doe@example.com', true)).rejects.toThrow('Failed to update department status');
        });
    });
});
