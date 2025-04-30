package com.example.TicketingSystem.controllers;

import com.example.TicketingSystem.models.Feedback;
import com.example.TicketingSystem.models.Tickets;
import com.example.TicketingSystem.repositories.FeedbackRepository;
import com.example.TicketingSystem.repositories.TicketRepository;
import com.example.TicketingSystem.services.notification.NotificationService;
import com.example.TicketingSystem.services.ticket.FeedbackService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class FeedbackControllerTest {

    @InjectMocks
    private FeedbackController feedbackController;

    @Mock
    private FeedbackService feedbackService;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private NotificationService notificationService;

    private Tickets ticket;
    private Feedback feedback;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        ticket = new Tickets();
        ticket.setTicketId("123");
        ticket.setCreatedBy("user@example.com");

        feedback = new Feedback();
        feedback.setId(456L);
        feedback.setTicketId(ticket);
        feedback.setComments("Great service!");
    }

    @Test
    void testSubmitFeedback_Success() {
        when(ticketRepository.findById("123")).thenReturn(Optional.of(ticket));
        when(feedbackService.submitFeedback(feedback)).thenReturn(feedback);

        ResponseEntity<Feedback> response = feedbackController.submitFeedback("123", feedback);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(feedback, response.getBody());

        verify(ticketRepository, times(1)).findById("123");
        verify(feedbackService, times(1)).submitFeedback(feedback);
        verify(notificationService, times(1)).sendNotification(
                "user@example.com",
                "New feedback has been added to your ticket (ID: 123)."
        );
    }

    @Test
    void testSubmitFeedback_TicketNotFound() {
        when(ticketRepository.findById("123")).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                feedbackController.submitFeedback("123", feedback));

        assertEquals("Ticket not found", exception.getMessage());

        verify(ticketRepository, times(1)).findById("123");
        verify(feedbackService, never()).submitFeedback(any());
        verify(notificationService, never()).sendNotification(anyString(), anyString());
    }
}