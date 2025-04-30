package com.example.TicketingSystem.controllers;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UserControllerTest {

    private final UserController userController = new UserController();

    @Test
    void testUser_WithOAuth2User() {
        OAuth2User oAuth2User = mock(OAuth2User.class);
        when(oAuth2User.getAttribute("name")).thenReturn("John Doe");
        when(oAuth2User.getAttribute("email")).thenReturn("john.doe@example.com");

        Map<String, Object> response = userController.user(oAuth2User);

        assertEquals("John Doe", response.get("name"));
        assertEquals("john.doe@example.com", response.get("email"));
    }

    @Test
    void testUser_WithUserDetails() {
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("jane.doe@example.com");

        Map<String, Object> response = userController.user(userDetails);

        assertEquals("jane.doe@example.com", response.get("username"));
    }

    @Test
    void testUser_NoAuthenticatedUser() {
        Object principal = new Object();

        Map<String, Object> response = userController.user(principal);

        assertEquals("No authenticated user found", response.get("message"));
    }
}