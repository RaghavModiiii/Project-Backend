package com.example.TicketingSystem.controllers;

import com.example.TicketingSystem.models.Tickets;
import com.example.TicketingSystem.services.attachment.AttachmentsService;
import com.example.TicketingSystem.services.attachment.CloudinaryService;
import com.example.TicketingSystem.models.Attachments;
import com.example.TicketingSystem.services.ticket.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class AttachmentsControllerTest {

    @InjectMocks
    private AttachmentsController attachmentsController;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private AttachmentsService attachmentsService;

    @Mock
    private TicketService ticketService;

    @Mock
    private MultipartFile file;

    private Tickets ticket;
    private Attachments attachment;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        ticket = new Tickets();
        ticket.setTicketId("123");

        attachment = new Attachments();
        attachment.setTicketId(ticket);
        attachment.setFilePath("http://example.com/file");
        attachment.setTypeOfFile("image/png");
        attachment.setFileName("file.png");
    }

    @Test
    void testUploadFile_Success() throws IOException {
        when(ticketService.findByTicketId("123")).thenReturn(ticket);
        when(cloudinaryService.uploadFile(file)).thenReturn("http://example.com/file");
        when(attachmentsService.saveAttachment(any(Attachments.class))).thenReturn(attachment);

        ResponseEntity<?> response = attachmentsController.uploadFile(file, "123");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(attachment, response.getBody());

        verify(ticketService, times(1)).findByTicketId("123");
        verify(cloudinaryService, times(1)).uploadFile(file);
        verify(attachmentsService, times(1)).saveAttachment(any(Attachments.class));
    }

    @Test
    void testUploadFile_Failure() throws IOException {
        when(ticketService.findByTicketId("123")).thenReturn(ticket);
        when(cloudinaryService.uploadFile(file)).thenThrow(new IOException("Upload error"));

        ResponseEntity<?> response = attachmentsController.uploadFile(file, "123");

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("File upload failed: Upload error", response.getBody());

        verify(ticketService, times(1)).findByTicketId("123");
        verify(cloudinaryService, times(1)).uploadFile(file);
        verify(attachmentsService, never()).saveAttachment(any(Attachments.class));
    }

    @Test
    void testGetAttachmentsByTicketId_Success() {
        when(ticketService.findByTicketId("123")).thenReturn(ticket);
        when(attachmentsService.getAttachmentsByTicketId(ticket)).thenReturn(Collections.singletonList(attachment));

        ResponseEntity<List<Attachments>> response = attachmentsController.getAttachmentsByTicketId("123");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
        assertEquals(attachment, response.getBody().get(0));

        verify(ticketService, times(1)).findByTicketId("123");
        verify(attachmentsService, times(1)).getAttachmentsByTicketId(ticket);
    }
}