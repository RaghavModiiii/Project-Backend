package com.example.TicketingSystem.controllers;

import com.example.TicketingSystem.models.TicketComments;
import com.example.TicketingSystem.models.Tickets;
import com.example.TicketingSystem.repositories.TicketRepository;
import com.example.TicketingSystem.services.notification.NotificationService;
import com.example.TicketingSystem.services.ticket.TicketCommentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class TicketCommentsControllerTest {

    @InjectMocks
    private TicketCommentsController ticketCommentsController;

    @Mock
    private TicketCommentService ticketCommentService;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private NotificationService notificationService;

    private Tickets ticket;
    private TicketComments comment;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        ticket = new Tickets();
        ticket.setTicketId("123");
        ticket.setUpdatedBy("user@example.com");

        comment = new TicketComments();
        comment.setCommentId(456L);
        comment.setCommentedBy("user@example.com");
        comment.setComment("Test comment");
        comment.setCommentedDate(LocalDateTime.now());
    }

    @Test
    void testAddComment_Success() {
        when(ticketRepository.findByTicketId("123")).thenReturn(Optional.of(ticket));
        when(ticketCommentService.addComment("123", comment)).thenReturn(comment);

        ResponseEntity<TicketComments> response = ticketCommentsController.addComment("123", comment);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(comment, response.getBody());

        verify(ticketRepository, times(1)).findByTicketId("123");
        verify(ticketCommentService, times(1)).addComment("123", comment);
        verify(notificationService, times(1)).sendNotification(
                "user@example.com",
                "You added a new comment on ticket 123"
        );
    }

    @Test
    void testAddComment_TicketNotFound() {
        when(ticketRepository.findByTicketId("123")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                ticketCommentsController.addComment("123", comment));

        assertEquals("Ticket not found for ID: 123", exception.getMessage());

        verify(ticketRepository, times(1)).findByTicketId("123");
        verify(ticketCommentService, never()).addComment(anyString(), any());
        verify(notificationService, never()).sendNotification(anyString(), anyString());
    }

    @Test
    void testGetCommentsByTicketId_Success() {
        when(ticketCommentService.getCommentsByTicket(ticket)).thenReturn(Collections.singletonList(comment));

        ResponseEntity<List<TicketComments>> response = ticketCommentsController.getCommentsByTicketId(ticket);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
        assertEquals(comment, response.getBody().get(0));

        verify(ticketCommentService, times(1)).getCommentsByTicket(ticket);
    }

    @Test
    void testEditComment_Success() {
        when(ticketCommentService.editComment("456", "Updated comment", "user@example.com"))
                .thenReturn(comment);

        comment.setComment("Updated comment");

        ResponseEntity<?> response = ticketCommentsController.editComment("456", comment);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(comment, response.getBody());

        verify(ticketCommentService, times(1)).editComment("456", "Updated comment", "user@example.com");
        verify(notificationService, times(1)).sendNotification(
                "user@example.com",
                "You edited a comment on ticket "
        );
    }

    @Test
    void testEditComment_Failure() {
        when(ticketCommentService.editComment("456", "Updated comment", "user@example.com"))
                .thenThrow(new IllegalArgumentException("Editing time exceeded"));

        comment.setComment("Updated comment");

        ResponseEntity<?> response = ticketCommentsController.editComment("456", comment);

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Editing time exceeded", response.getBody());

        verify(ticketCommentService, times(1)).editComment("456", "Updated comment", "user@example.com");
        verify(notificationService, never()).sendNotification(anyString(), anyString());
    }
}