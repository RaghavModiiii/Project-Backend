import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUser, LocalUser } from '../api/getUser';

describe('getUser', () => {
    const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        clear: vi.fn(),
        removeItem: vi.fn(),
        length: 0,
        key: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        global.localStorage = mockLocalStorage;
        global.fetch = vi.fn();
    });

    it('should return user data from localStorage if available', async () => {
        mockLocalStorage.getItem.mockImplementation((key: string) => {
            const storage = {
                name: 'Test User',
                email: 'test@example.com',
                loginMethod: 'manual'
            };
            return storage[key as keyof typeof storage] || null;
        });

        const result = await getUser();

        expect(result).toEqual({
            name: 'Test User',
            email: 'test@example.com',
            loginMethod: 'manual'
        });
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('name');
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('email');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch user data from API if not in localStorage', async () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        const mockApiResponse: LocalUser = {
            name: 'API User',
            email: 'api@example.com',
            loginMethod: 'google'
        };

        global.fetch = vi.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockApiResponse)
            })
        );

        const result = await getUser();

        expect(result).toEqual(mockApiResponse);
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('name', 'API User');
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('email', 'api@example.com');
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('loginMethod', 'google');
    });

    it('should handle API error and return null', async () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        global.fetch = vi.fn().mockImplementation(() =>
            Promise.resolve({
                ok: false,
                status: 500
            })
        );

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const result = await getUser();

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should handle network error and return null', async () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const result = await getUser();

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should set correct loginMethod in localStorage based on API response', async () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        const mockManualUser: LocalUser = {
            name: 'Manual User',
            email: 'manual@example.com',
            loginMethod: 'manual'
        };

        global.fetch = vi.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockManualUser)
            })
        );

        await getUser();

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('loginMethod', 'manual');

        vi.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue(null);

        const mockGoogleUser: LocalUser = {
            name: 'Google User',
            email: 'google@example.com',
            loginMethod: 'google'
        };

        global.fetch = vi.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockGoogleUser)
            })
        );

        await getUser();

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('loginMethod', 'google');
    });
});
