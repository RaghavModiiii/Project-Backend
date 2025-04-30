import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useTicketForm } from '../api/useTicketForm';
import '@testing-library/jest-dom';
import { getNotificationsByEmail } from '../api/notification';


describe('useTicketForm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-04-26'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });
const setup = () => {
  return renderHook(() => useTicketForm());
};

  it('should initialize with default values', () => {
    const { result } = setup();
    
    expect(result.current.newTicket).toEqual({
      ticketId: '',
      title: '',
      description: '',
      department: '',
      priority: '',
      dueDate: '',
      attachments: null,
    });
  });

  it('should initialize with custom initial state', () => {
    const initialState = {
      ticketId: 'TICKET-123',
      title: 'Test Ticket',
      description: 'Test Description',
      department: 'IT',
      priority: 'High',
      dueDate: '2025-04-29',
      attachments: null,
    };

    const { result } = renderHook(() => useTicketForm(initialState));
    expect(result.current.newTicket).toEqual(initialState);
  });

  describe('handleInputChange', () => {
    it('should update input values', () => {
      const { result } = setup();

      act(() => {
        result.current.handleInputChange({
          target: { name: 'title', value: 'New Ticket' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.newTicket.title).toBe('New Ticket');
    });    it('should set due date to 3 days for High priority', () => {
      const { result } = setup();

      act(() => {
        result.current.handleInputChange({
          target: { name: 'priority', value: 'High' }
        } as React.ChangeEvent<HTMLSelectElement>);
      });

      expect(result.current.newTicket.priority).toBe('High');
      expect(result.current.newTicket.dueDate).toBe('2025-04-29');
    });

    it('should set due date to 5 days for Medium priority', () => {
      const { result } = setup();

      act(() => {
        result.current.handleInputChange({
          target: { name: 'priority', value: 'Medium' }
        } as React.ChangeEvent<HTMLSelectElement>);
      });

      expect(result.current.newTicket.priority).toBe('Medium');
      expect(result.current.newTicket.dueDate).toBe('2025-05-01');
    });

    it('should set due date to 7 days for other priorities', () => {
      const { result } = setup();

      act(() => {
        result.current.handleInputChange({
          target: { name: 'priority', value: 'Low' }
        } as React.ChangeEvent<HTMLSelectElement>);
      });

      expect(result.current.newTicket.priority).toBe('Low');
      expect(result.current.newTicket.dueDate).toBe('2025-05-03');
    });
  });

  describe('handleFileChange', () => {
    it('should handle file attachment', () => {
      const { result } = setup();
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      act(() => {
        const mockEvent = {
          target: {
            files: {
              0: mockFile,
              length: 1,
              item: () => mockFile
            } as unknown as FileList
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        result.current.handleFileChange(mockEvent);
      });

      expect(result.current.newTicket.attachments).toBe(mockFile);
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

    it('should handle null file input', () => {
      const { result } = setup();

      act(() => {
        const mockEvent = {
          target: {
            files: null
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        result.current.handleFileChange(mockEvent);
      });

      expect(result.current.newTicket.attachments).toBeNull();
    });
  });

  describe('resetForm', () => {
    it('should reset form to initial state', () => {
      const { result } = setup();

      act(() => {
        result.current.handleInputChange({
          target: { name: 'title', value: 'Test Title' }
        } as React.ChangeEvent<HTMLInputElement>);

        result.current.handleInputChange({
          target: { name: 'priority', value: 'High' }
        } as React.ChangeEvent<HTMLSelectElement>);
      });

      // Reset the form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.newTicket).toEqual({
        ticketId: '',
        title: '',
        description: '',
        department: '',
        priority: '',
        dueDate: '',
        attachments: null,
      });
    });
  });
});


