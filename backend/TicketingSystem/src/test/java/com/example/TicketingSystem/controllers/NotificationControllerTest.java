package com.example.TicketingSystem.controllers;

import com.example.TicketingSystem.models.Notification;
import com.example.TicketingSystem.repositories.NotificationRepository;
import com.example.TicketingSystem.services.notification.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class NotificationControllerTest {

    @InjectMocks
    private NotificationController notificationController;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationService notificationService;

    private Notification notification;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        notification = new Notification();
        notification.setId(1L);
        notification.setEmailId("user@example.com");
        notification.setMessage("Test notification");
        notification.setIsRead(false);
    }

    @Test
    void testGetUnreadNotifications_Success() {
        when(notificationRepository.findByEmailIdAndIsReadFalse("user@example.com"))
                .thenReturn(Collections.singletonList(notification));

        ResponseEntity<List<Notification>> response = notificationController.getUnreadNotifications("user@example.com");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
        assertEquals(notification, response.getBody().get(0));

        verify(notificationRepository, times(1)).findByEmailIdAndIsReadFalse("user@example.com");
    }

    @Test
    void testMarkNotificationAsRead_Success() {
        when(notificationService.markAsRead(1L)).thenReturn(true);

        ResponseEntity<Map<String, String>> response = notificationController.markNotificationAsRead(1L);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Notification marked as read.", response.getBody().get("message"));

        verify(notificationService, times(1)).markAsRead(1L);
    }

    @Test
    void testMarkNotificationAsRead_NotFound() {
        when(notificationService.markAsRead(1L)).thenReturn(false);

        ResponseEntity<Map<String, String>> response = notificationController.markNotificationAsRead(1L);

        assertEquals(404, response.getStatusCodeValue());

        verify(notificationService, times(1)).markAsRead(1L);
    }

    @Test
    void testMarkNotificationsAsRead() {
        List<Notification> notifications = Collections.singletonList(notification);
        when(notificationRepository.findByEmailIdAndIsReadFalse("user@example.com")).thenReturn(notifications);

        notificationController.markNotificationsAsRead("user@example.com");

        assertEquals(true, notification.getIsRead());
        verify(notificationRepository, times(1)).findByEmailIdAndIsReadFalse("user@example.com");
        verify(notificationRepository, times(1)).saveAll(notifications);
    }

    @Test
    void testSendNotification() {
        doNothing().when(notificationService).sendNotification("user@example.com", "Test message");

        notificationController.sendNotification("user@example.com", "Test message");

        verify(notificationService, times(1)).sendNotification("user@example.com", "Test message");
    }
}