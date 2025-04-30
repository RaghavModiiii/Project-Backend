import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi,beforeEach } from 'vitest';
import { useTicket } from '../api/ticketApi';

describe('useTicket', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with null ticket', () => {
    const { result } = renderHook(() => useTicket());
    expect(result.current.ticket).toBeNull();
  });

  it('should fetch ticket by ID successfully', async () => {
    const mockTicket = {
      ticketId: 'ticket-123',
      title: 'Test Ticket',
      description: 'Test Description',
      department: 'IT',
      createdBy: 'user@example.com',
      priority: 'High',
      status: 'Open',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTicket),
    });

    const { result } = renderHook(() => useTicket());

    await act(async () => {
      await result.current.getTicketById('ticket-123');
    });

    expect(result.current.ticket).toEqual(mockTicket);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/tickets/ticket-123',
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );
  });

  it('should handle error when fetching ticket by ID fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    const { result } = renderHook(() => useTicket());

    await expect(
      act(async () => {
        await result.current.getTicketById('invalid-id');
      })
    ).rejects.toThrow('Ticket not found');

    expect(result.current.ticket).toBeNull();
  });
});
