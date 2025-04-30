package com.example.TicketingSystem.controllers;

import com.example.TicketingSystem.dto.EmailRequest;
import com.example.TicketingSystem.dto.OtpRequest;
import com.example.TicketingSystem.services.email.OtpService;
import jakarta.mail.MessagingException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    @InjectMocks
    private AuthController authController;

    @Mock
    private OtpService otpService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRequestOtp_Success() throws MessagingException {
        EmailRequest emailRequest = new EmailRequest();
        emailRequest.setEmail("test@example.com");

        doNothing().when(otpService).sendOtp("test@example.com");

        ResponseEntity<String> response = authController.requestOtp(emailRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("OTP sent to your email.", response.getBody());
        verify(otpService, times(1)).sendOtp("test@example.com");
    }

    @Test
    void testRequestOtp_Exception() throws MessagingException {
        EmailRequest emailRequest = new EmailRequest();
        emailRequest.setEmail("test@example.com");

        doThrow(new MessagingException("Email error")).when(otpService).sendOtp("test@example.com");

        MessagingException exception = null;
        try {
            authController.requestOtp(emailRequest);
        } catch (MessagingException e) {
            exception = e;
        }

        assertEquals("Email error", exception.getMessage());
        verify(otpService, times(1)).sendOtp("test@example.com");
    }

    @Test
    void testVerifyOtp_Success() {
        OtpRequest otpRequest = new OtpRequest();
        otpRequest.setEmail("test@example.com");
        otpRequest.setOtp("123456");

        when(otpService.verifyOtp("test@example.com", "123456")).thenReturn(true);

        ResponseEntity<String> response = authController.verifyOtp(otpRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Sign in successful.", response.getBody());
        verify(otpService, times(1)).verifyOtp("test@example.com", "123456");
    }

    @Test
    void testVerifyOtp_Failure() {
        OtpRequest otpRequest = new OtpRequest();
        otpRequest.setEmail("test@example.com");
        otpRequest.setOtp("123456");

        when(otpService.verifyOtp("test@example.com", "123456")).thenReturn(false);

        ResponseEntity<String> response = authController.verifyOtp(otpRequest);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid OTP.", response.getBody());
        verify(otpService, times(1)).verifyOtp("test@example.com", "123456");
    }
}