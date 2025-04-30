package com.example.TicketingSystem.controllers;

import com.example.TicketingSystem.dto.TransferTicketRequest;
import com.example.TicketingSystem.models.Tickets;
import com.example.TicketingSystem.repositories.TicketDepartmentRepository;
import com.example.TicketingSystem.repositories.TicketRepository;
import com.example.TicketingSystem.services.email.MainEmailService;
import com.example.TicketingSystem.services.notification.NotificationService;
import com.example.TicketingSystem.services.ticket.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.*;

class TicketControllerTest {

    @InjectMocks
    private TicketController ticketController;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketDepartmentRepository ticketDepartmentRepository;

    @Mock
    private TicketService ticketService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private MainEmailService mainEmailService;

    private Tickets ticket;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        ticket = new Tickets();
        ticket.setTicketId("123");
        ticket.setCreatedBy("user@example.com");
        ticket.setCreatedDate(LocalDateTime.now());
        ticket.setDueDate(LocalDate.now().plusDays(7));
        ticket.setTitle("Test Ticket");
        ticket.setDescription("Test Description");
        ticket.setPriority("High");
        ticket.setStatus("Open");
    }

    @Test
    void testGetTicketById_Success() {
        when(ticketService.getTicketById("123")).thenReturn(Optional.of(ticket));

        ResponseEntity<Tickets> response = ticketController.getTicketById("123");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(ticket, response.getBody());

        verify(ticketService, times(1)).getTicketById("123");
    }

    @Test
    void testGetTicketById_NotFound() {
        when(ticketService.getTicketById("123")).thenReturn(Optional.empty());

        ResponseEntity<Tickets> response = ticketController.getTicketById("123");

        assertEquals(404, response.getStatusCodeValue());

        verify(ticketService, times(1)).getTicketById("123");
    }

    @Test
    void testCreateTicket() {
        when(ticketService.createTicket(ticket)).thenReturn(ticket);
        when(ticketDepartmentRepository.findByDepartment(ticket.getDepartment())).thenReturn(Collections.emptyList());

        ResponseEntity<Tickets> response = ticketController.createTicket(ticket);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(ticket, response.getBody());

        verify(ticketService, times(1)).createTicket(ticket);
        verify(mainEmailService, times(1)).sendThymeleafTicketEmail(
                eq(ticket.getCreatedBy()), eq(ticket.getTicketId()), eq(ticket.getTitle()),
                eq(ticket.getDescription()), anyString(), eq(ticket.getPriority()),
                anyString(), eq(ticket.getStatus()), eq(true), eq("New Ticket Created")
        );
    }

    @Test
    void testTransferTicket_Success() {
        TransferTicketRequest transferRequest = new TransferTicketRequest();
        transferRequest.setEmail("newAssignee@example.com");

        when(ticketRepository.findByTicketId("123")).thenReturn(Optional.of(ticket));

        ResponseEntity<?> response = ticketController.transferTicket("123", transferRequest);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("newAssignee@example.com", ticket.getAssignTo());

        verify(ticketRepository, times(1)).findByTicketId("123");
        verify(ticketRepository, times(1)).save(ticket);
    }

    @Test
    void testTransferTicket_NotFound() {
        TransferTicketRequest transferRequest = new TransferTicketRequest();
        transferRequest.setEmail("newAssignee@example.com");

        when(ticketRepository.findByTicketId("123")).thenReturn(Optional.empty());

        ResponseEntity<?> response = ticketController.transferTicket("123", transferRequest);

        assertEquals(404, response.getStatusCodeValue());

        verify(ticketRepository, times(1)).findByTicketId("123");
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void testCloseTicket_Success() {
        ticket.setStatus("Assigned");
        when(ticketRepository.findByTicketId("123")).thenReturn(Optional.of(ticket));

        ResponseEntity<Tickets> response = ticketController.closeTicket("123");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Closed", ticket.getStatus());

        verify(ticketRepository, times(1)).findByTicketId("123");
        verify(ticketRepository, times(1)).save(ticket);
        verify(mainEmailService, times(1)).sendFeedbackRequestEmail(
                eq(ticket.getCreatedBy()), eq(ticket.getTicketId()), eq(ticket.getTitle()), anyString()
        );
    }

    @Test
    void testCloseTicket_NotAssigned() {
        ticket.setStatus("Open");
        when(ticketRepository.findByTicketId("123")).thenReturn(Optional.of(ticket));

        ResponseEntity<Tickets> response = ticketController.closeTicket("123");

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Open", ticket.getStatus());

        verify(ticketRepository, times(1)).findByTicketId("123");
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void testCloseTicket_NotFound() {
        when(ticketRepository.findByTicketId("123")).thenReturn(Optional.empty());

        ResponseEntity<Tickets> response = ticketController.closeTicket("123");

        assertEquals(404, response.getStatusCodeValue());

        verify(ticketRepository, times(1)).findByTicketId("123");
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void testReopenTicket_Success() {
        ticket.setStatus("Closed");
        when(ticketRepository.findByTicketId("123")).thenReturn(Optional.of(ticket));

        ResponseEntity<Tickets> response = ticketController.reopenTicket("123");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Open", ticket.getStatus());
        assertNull(ticket.getAssignTo());
        assertEquals(LocalDate.now().plusDays(7), ticket.getDueDate());

        verify(ticketRepository, times(1)).findByTicketId("123");
        verify(ticketRepository, times(1)).save(ticket);
        verify(mainEmailService, times(1)).sendPlainTicketEmail(
                eq(ticket.getCreatedBy()), eq(ticket.getTicketId()), eq(ticket.getTitle()), eq(ticket.getDescription()),
                anyString(), eq(ticket.getPriority()), anyString(), eq("Reopened"),
                eq("Your ticket has been reopened"), isNull(), eq(ticket.getCreatedBy())
        );
        verify(notificationService, times(1)).sendNotification(
                eq(ticket.getCreatedBy()), contains("Your Ticket (ID: 123) has been reopened.")
        );
    }

    @Test
    void testReopenTicket_NotClosed() {
        ticket.setStatus("Open");
        when(ticketRepository.findByTicketId("123")).thenReturn(Optional.of(ticket));

        ResponseEntity<Tickets> response = ticketController.reopenTicket("123");

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Open", ticket.getStatus());

        verify(ticketRepository, times(1)).findByTicketId("123");
        verify(ticketRepository, never()).save(any());
        verify(mainEmailService, never()).sendPlainTicketEmail(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any());
        verify(notificationService, never()).sendNotification(any(), any());
    }

    @Test
    void testReopenTicket_NotFound() {
        when(ticketRepository.findByTicketId("123")).thenReturn(Optional.empty());

        ResponseEntity<Tickets> response = ticketController.reopenTicket("123");

        assertEquals(404, response.getStatusCodeValue());

        verify(ticketRepository, times(1)).findByTicketId("123");
        verify(ticketRepository, never()).save(any());
        verify(mainEmailService, never()).sendPlainTicketEmail(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any());
        verify(notificationService, never()).sendNotification(any(), any());
    }


    @Test
    void testGetTicketsByDepartment_Success() {
        List<Tickets> tickets = List.of(ticket);
        when(ticketRepository.findByDepartment("IT")).thenReturn(tickets);

        ResponseEntity<List<Tickets>> response = ticketController.getTicketsByDepartment("IT");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(tickets, response.getBody());

        verify(ticketRepository, times(1)).findByDepartment("IT");
    }

    @Test
    void testGetTicketsByDepartment_Empty() {
        when(ticketRepository.findByDepartment("HR")).thenReturn(Collections.emptyList());

        ResponseEntity<List<Tickets>> response = ticketController.getTicketsByDepartment("HR");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(Collections.emptyList(), response.getBody());

        verify(ticketRepository, times(1)).findByDepartment("HR");
    }

    @Test
    void testGetTicketsByStatus_Success() {
        List<Tickets> tickets = List.of(ticket);
        when(ticketRepository.findByStatus("Open")).thenReturn(tickets);

        ResponseEntity<List<Tickets>> response = ticketController.getTicketsByStatus("Open");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(tickets, response.getBody());

        verify(ticketRepository, times(1)).findByStatus("Open");
    }

    @Test
    void testGetTicketsByStatus_NotFound() {
        when(ticketRepository.findByStatus("Closed")).thenReturn(Collections.emptyList());

        ResponseEntity<List<Tickets>> response = ticketController.getTicketsByStatus("Closed");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(Collections.emptyList(), response.getBody());

        verify(ticketRepository, times(1)).findByStatus("Closed");
    }

    @Test
    void testAssignTicket_Success() {
        when(ticketRepository.findByTicketId("123")).thenReturn(Optional.of(ticket));

        ResponseEntity<Tickets> response = ticketController.assignTicket("123", "assignee@example.com");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("assignee@example.com", ticket.getAssignTo());
        assertEquals("Assigned", ticket.getStatus());

        verify(ticketRepository, times(1)).findByTicketId("123");
        verify(ticketRepository, times(1)).save(ticket);
        verify(mainEmailService, times(1)).sendPlainTicketEmail(
                eq("assignee@example.com"), eq(ticket.getTicketId()), eq(ticket.getTitle()), eq(ticket.getDescription()),
                anyString(), eq(ticket.getPriority()), anyString(), eq("Assigned"), eq("Assigned"),
                eq("assignee@example.com"), eq(ticket.getCreatedBy())
        );
        verify(mainEmailService, times(1)).sendPlainTicketEmail(
                eq(ticket.getCreatedBy()), eq(ticket.getTicketId()), eq(ticket.getTitle()), eq(ticket.getDescription()),
                anyString(), eq(ticket.getPriority()), anyString(), eq("Assigned"), eq("Status Changed to Assigned"),
                eq("assignee@example.com"), eq(ticket.getCreatedBy())
        );
    }

    @Test
    void testAssignTicket_AlreadyAssigned() {
        ticket.setAssignTo("existingAssignee@example.com");
        when(ticketRepository.findByTicketId("123")).thenReturn(Optional.of(ticket));

        ResponseEntity<Tickets> response = ticketController.assignTicket("123", "newAssignee@example.com");

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("existingAssignee@example.com", ticket.getAssignTo());

        verify(ticketRepository, times(1)).findByTicketId("123");
        verify(ticketRepository, never()).save(any());
        verify(mainEmailService, never()).sendPlainTicketEmail(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void testAssignTicket_NotFound() {
        when(ticketRepository.findByTicketId("123")).thenReturn(Optional.empty());

        ResponseEntity<Tickets> response = ticketController.assignTicket("123", "assignee@example.com");

        assertEquals(404, response.getStatusCodeValue());

        verify(ticketRepository, times(1)).findByTicketId("123");
        verify(ticketRepository, never()).save(any());
        verify(mainEmailService, never()).sendPlainTicketEmail(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any());
    }
}