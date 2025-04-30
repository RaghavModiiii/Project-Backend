import { useState } from 'react';
// import api from './axios';

// Define types for ticket priorities and statuses
export type Priority = 'Low' | 'Medium' | 'High';
export type TicketStatus = 'Open' | 'Assigned' | 'Closed';

// Define the Ticket interface
export interface Ticket {
  ticketId: string;
  title: string;
  description: string;
  department: string;
  assignTo?: string;
  createdBy: string;
  priority: string;
  dueDate?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
  status: TicketStatus;
}

// Define the request payload for transferring a ticket
export interface TransferTicketRequest {
  email: string;
  comment: string;
}

// Transfer a ticket to another user
export const transferTicket = async (ticketId: string, payload: TransferTicketRequest) => {
  const response = await fetch(`http://localhost:8080/api/tickets/transfer/${ticketId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to transfer ticket');
  }

  return response.json();
};

// Fetch tickets created by a specific user
export const getTicketsByCreatedBy = async (email: string) => {
  try {
    const response = await fetch(`http://localhost:8080/api/tickets/createdBy/${email}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error(`Failed to fetch tickets created by ${email}. Status:`, response.status);
      return [];
    }
  } catch (err) {
    console.error('Error fetching tickets by creator:', err);
    return [];
  }
};

// Fetch tickets in progress for a specific user
export const getTicketsInProgress = async (email: string): Promise<Ticket[]> => {
  const response = await fetch(`http://localhost:8080/api/tickets/search/${email}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching tickets: ${response.status} ${response.statusText}`);
  }

  const data: Ticket[] = await response.json();
  return data;
};


// Fetch tickets by department
export const getTicketsByDepartment = async (department: string | null): Promise<Ticket[]> => {
  if (!department) return [];

  try {
    const response = await fetch(`http://localhost:8080/api/tickets/department/${department}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }
};

// Create a new ticket
export const createTicket = async (ticket: Partial<Ticket>) => {
  try {
    const response = await fetch('http://localhost:8080/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket),
      credentials: 'include',
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Failed to create ticket. Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
};

// Fetch tickets by status
export const fetchTicketByStatus = async (status: string) => {
  try {
    const response = await fetch(`http://localhost:8080/api/tickets/status/${status}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error(`Failed to fetch tickets with status ${status}. Status:`, response.status);
      return [];
    }
  } catch (err) {
    console.error('Error fetching tickets by status:', err);
    return [];
  }
};

// Fetch unique ticket statuses
export const fetchTicketUniqueStatus = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/tickets/unique', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to fetch unique ticket statuses. Status:', response.status);
      return [];
    }
  } catch (err) {
    console.error('Error fetching unique ticket statuses:', err);
    return [];
  }
};

// Assign a ticket to a user
export const assignTicket = async (ticketId: string, assigneeEmail: string): Promise<Ticket> => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/tickets/${ticketId}/assign?assigneeEmail=${encodeURIComponent(assigneeEmail)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to assign ticket. Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error assigning ticket:', error);
    throw error;
  }
};

// Fetch comments for a specific ticket
export const getCommentsByTicketId = async (ticketId: string) => {
  try {
    const response = await fetch(`http://localhost:8080/api/tickets/comments/ticket/${ticketId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to fetch comments by ticket ID. Status:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error fetching comments by ticket ID:', error);
    return [];
  }
};

// Close a ticket
export const closeTicket = async (ticketId: string) => {
  try {
    const response = await fetch(`http://localhost:8080/api/tickets/${ticketId}/close`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to close ticket');
    }
  } catch (error) {
    console.error('Error closing ticket:', error);
    throw error;
  }
};

// Reopen a ticket
export const reopenTicket = async (ticketId: string) => {
  try {
    const response = await fetch(`http://localhost:8080/api/tickets/${ticketId}/reopen`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to reopen ticket');
    }
  } catch (error) {
    console.error('Error reopening ticket:', error);
    throw error;
  }
};

// Fetch a ticket by its ID
export const fetchTicketById = async (ticketId: string): Promise<Ticket> => {
  const response = await fetch(`http://localhost:8080/api/tickets/${ticketId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch ticket');
  }

  return await response.json();
};

// Custom hook to manage ticket state
export const useTicket = () => {
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const getTicketById = async (ticketId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/tickets/${ticketId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Ticket not found');
      }

      const data = await response.json();
      setTicket(data);
    } catch (error) {
      console.error('Error fetching ticket by ID:', error);
      throw error;
    }
  };

  return { ticket, getTicketById };
};

// Fetch tickets assigned to a specific user
export const getTicketsAssignedTo = async (email: string) => {
  try {
    const response = await fetch(`http://localhost:8080/api/tickets/assignTo/${email}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to fetch assigned tickets. Status:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error fetching assigned tickets:', error);
    return [];
  }
};