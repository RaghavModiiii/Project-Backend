package com.example.TicketingSystem.services.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class OtpEmailSenderTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private SpringTemplateEngine templateEngine;

    @InjectMocks
    private OtpEmailSender otpEmailSender;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSendOtpEmail_Success() throws MessagingException {
        MimeMessage mimeMessage = mock(MimeMessage.class);
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage);

        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("otpTemplate"), any(Context.class))).thenReturn("<html>OTP Code</html>");

        Map<String, Object> model = new HashMap<>();
        model.put("otp", "123456");

        otpEmailSender.sendOtpEmail("test@example.com", model);

        verify(mailSender, times(1)).send(mimeMessage);

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(captor.capture());
        MimeMessage sentMessage = captor.getValue();

        // Verify the email content
        assertEquals(mimeMessage, sentMessage);
    }

    @Test
    void testSendOtpEmail_TemplateProcessingFailure() {
        when(templateEngine.process(eq("otpTemplate"), any(Context.class))).thenThrow(new RuntimeException("Template error"));

        Map<String, Object> model = new HashMap<>();
        model.put("otp", "123456");

        assertThrows(RuntimeException.class, () -> otpEmailSender.sendOtpEmail("test@example.com", model));

        verify(mailSender, never()).send(any(MimeMessage.class));
    }

}