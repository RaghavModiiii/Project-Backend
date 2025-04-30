package com.example.TicketingSystem.services.email;

import jakarta.mail.MessagingException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OtpServiceTest {

    @Mock
    private OtpEmailSender otpEmailSender;

    @InjectMocks
    private OtpService otpService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSendOtp_Success() throws MessagingException {
        String email = "test@example.com";

        otpService.sendOtp(email);

        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(otpEmailSender, times(1)).sendOtpEmail(eq(email), captor.capture());

        Map<String, Object> model = captor.getValue();
        assertNotNull(model.get("otp"));
        assertTrue(model.get("otp").toString().matches("\\d{6}"));
    }

    @Test
    void testSendOtp_ThrowsMessagingException() throws MessagingException {
        String email = "test@example.com";
        doThrow(new MessagingException("Email error")).when(otpEmailSender).sendOtpEmail(eq(email), any());

        MessagingException exception = assertThrows(MessagingException.class, () -> otpService.sendOtp(email));
        assertEquals("Email error", exception.getMessage());
    }

    @Test
    void testVerifyOtp_Success() throws MessagingException {
        String email = "test@example.com";
        String otp = "123456";

        otpService.sendOtp(email);
        Map<String, Object> model = new HashMap<>();
        model.put("otp", otp);
        otpService.otpStore.put(email, otp);

        assertTrue(otpService.verifyOtp(email, otp));
        assertNull(otpService.otpStore.get(email)); // Ensure OTP is removed after verification
    }

    @Test
    void testVerifyOtp_Failure_WrongOtp() throws MessagingException {
        String email = "test@example.com";
        String correctOtp = "123456";
        String wrongOtp = "654321";

        otpService.otpStore.put(email, correctOtp);

        assertFalse(otpService.verifyOtp(email, wrongOtp));
        assertNotNull(otpService.otpStore.get(email)); // Ensure OTP is not removed
    }

    @Test
    void testVerifyOtp_Failure_NoOtpStored() {
        String email = "test@example.com";
        String otp = "123456";

        assertFalse(otpService.verifyOtp(email, otp));
    }
}