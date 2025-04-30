import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
    transferTicket, 
    getTicketsByCreatedBy, 
    getTicketsByDepartment,
    createTicket,
    fetchTicketByStatus,
    assignTicket,
    closeTicket,
    reopenTicket,
    fetchTicketById,
    getTicketsAssignedTo
} from '../api/ticketApi';
import { Ticket } from "../api/ticketApi";

describe('Ticket API Functions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        global.console.error = vi.fn();
    });

    const mockTicket: Ticket = {
        ticketId: 'ticket-123',
        title: 'Test Ticket',
        description: 'Test Description',
        status: 'Open',
        priority: 'High',
        department: 'IT',
        createdBy: 'user@example.com',
        assignTo: 'assignee@example.com',
        createdDate: '2025-04-26T10:00:00Z',
        updatedDate: '2025-04-26T10:00:00Z'
    };

    describe('transferTicket', () => {
        const transferPayload = {
            email: 'newuser@example.com',
            comment: 'Transfer reason'
        };

        it('should transfer ticket successfully', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ ...mockTicket, assignTo: 'newuser@example.com' })
                })
            );

            const result = await transferTicket('ticket-123', transferPayload);

            expect(result.assignTo).toBe('newuser@example.com');
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/tickets/transfer/ticket-123',
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(transferPayload)
                }
            );
        });

        it('should throw error on transfer failure', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({ ok: false })
            );

            await expect(transferTicket('ticket-123', transferPayload))
                .rejects.toThrow('Failed to transfer ticket');
        });
    });

    describe('getTicketsByCreatedBy', () => {
        it('should fetch tickets by creator successfully', async () => {
            const mockTickets = [mockTicket];
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockTickets)
                })
            );

            const result = await getTicketsByCreatedBy('user@example.com');

            expect(result).toEqual(mockTickets);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/tickets/createdBy/user@example.com',
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                }
            );
        });

        it('should return empty array on fetch failure', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({ ok: false })
            );

            const result = await getTicketsByCreatedBy('user@example.com');
            expect(result).toEqual([]);
        });
    });

    describe('getTicketsByDepartment', () => {
        it('should return empty array for null department', async () => {
            const result = await getTicketsByDepartment(null);
            expect(result).toEqual([]);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should return empty array for undefined department', async () => {
            const result = await getTicketsByDepartment(null);
            expect(result).toEqual([]);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should fetch tickets by department successfully', async () => {
            const mockTickets = [mockTicket];
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockTickets)
                })
            );

            const result = await getTicketsByDepartment('IT');
            expect(result).toEqual(mockTickets);
        });

        it('should return empty array on 404', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: false,
                    status: 404
                })
            );

            const result = await getTicketsByDepartment('NonExistent');
            expect(result).toEqual([]);
        });
    });

    describe('createTicket', () => {
        const newTicket: Partial<Ticket> = {
            title: 'New Ticket',
            description: 'New Description',
            priority: 'High',
            department: 'IT'
        };

        it('should create ticket successfully', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ ...newTicket, ticketId: 'new-123' })
                })
            );

            const result = await createTicket(newTicket);
            expect(result.ticketId).toBe('new-123');
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/tickets',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTicket),
                    credentials: 'include'
                }
            );
        });

        it('should throw error on creation failure', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({ ok: false, status: 500 })
            );

            await expect(createTicket(newTicket))
                .rejects.toThrow('Failed to create ticket');
        });
    });

    describe('fetchTicketByStatus', () => {
        it('should fetch tickets by status successfully', async () => {
            const mockTickets = [mockTicket];
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockTickets)
                })
            );

            const result = await fetchTicketByStatus('Open');
            expect(result).toEqual(mockTickets);
        });

        it('should return empty array on failure', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({ ok: false })
            );

            const result = await fetchTicketByStatus('InvalidStatus');
            expect(result).toEqual([]);
        });
    });

    describe('assignTicket', () => {
        it('should assign ticket successfully', async () => {
            const updatedTicket = { ...mockTicket, assignTo: 'newassignee@example.com' };
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(updatedTicket)
                })
            );

            const result = await assignTicket('ticket-123', 'newassignee@example.com');
            expect(result.assignTo).toBe('newassignee@example.com');
        });

        it('should throw error on assignment failure', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({ ok: false })
            );

            await expect(assignTicket('ticket-123', 'invalid@example.com'))
                .rejects.toThrow('Failed to assign ticket');
        });
    });

    describe('closeTicket', () => {
        it('should close ticket successfully', async () => {
            const closedTicket = { ...mockTicket, status: 'Closed' };
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(closedTicket)
                })
            );

            const result = await closeTicket('ticket-123');
            expect(result.status).toBe('Closed');
        });

        it('should throw error on close failure', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({ ok: false })
            );

            await expect(closeTicket('ticket-123'))
                .rejects.toThrow('Failed to close ticket');
        });
    });

    describe('reopenTicket', () => {
        it('should reopen ticket successfully', async () => {
            const reopenedTicket = { ...mockTicket, status: 'Open' };
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(reopenedTicket)
                })
            );

            const result = await reopenTicket('ticket-123');
            expect(result.status).toBe('Open');
        });

        it('should throw error on reopen failure', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({ ok: false })
            );

            await expect(reopenTicket('ticket-123'))
                .rejects.toThrow('Failed to reopen ticket');
        });
    });

    describe('fetchTicketById', () => {
        it('should fetch single ticket successfully', async () => {
            const mockTicket = {
                ticketId: 'ticket-123',
                title: 'Test Ticket',
                description: 'Test Description',
                department: 'IT',
                createdBy: 'user@example.com',
                priority: 'High',
                status: 'Open',
            };

            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockTicket),
                })
            );

            const result = await fetchTicketById('ticket-123');
            expect(result).toEqual(mockTicket);
        });

        it('should throw error when ticket not found', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({ ok: false })
            );

            await expect(fetchTicketById('non-existent'))
                .rejects.toThrow('Failed to fetch ticket');
        });

        it('should throw error for empty ticket ID', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({ ok: false })
            );

            await expect(fetchTicketById(''))
                .rejects.toThrow('Failed to fetch ticket');
        });
    });

    describe('getTicketsAssignedTo', () => {
        it('should fetch assigned tickets successfully', async () => {
            const mockTickets = [
                {
                    ticketId: 'ticket-123',
                    title: 'Test Ticket',
                    description: 'Test Description',
                    department: 'IT',
                    createdBy: 'user@example.com',
                    priority: 'High',
                    status: 'Open',
                },
            ];

            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockTickets),
                })
            );

            const result = await getTicketsAssignedTo('assignee@example.com');
            expect(result).toEqual(mockTickets);
        });

        it('should return empty array on fetch failure', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({ ok: false })
            );

            const result = await getTicketsAssignedTo('invalid@example.com');
            expect(result).toEqual([]);
        });

        it('should return empty array for invalid assignee', async () => {
            global.fetch = vi.fn().mockImplementation(() =>
                Promise.resolve({ ok: false })
            );

            const result = await getTicketsAssignedTo('invalid@example.com');
            expect(result).toEqual([]);
        });
    });
});
