package com.example.TicketingSystem.controllers;

import com.example.TicketingSystem.models.TicketDepartment;
import com.example.TicketingSystem.repositories.TicketDepartmentRepository;
import com.example.TicketingSystem.services.ticket.TicketDepartmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class TicketDepartmentControllerTest {

    @InjectMocks
    private TicketDepartmentController ticketDepartmentController;

    @Mock
    private TicketDepartmentService ticketDepartmentService;

    @Mock
    private TicketDepartmentRepository ticketDepartmentRepository;

    private TicketDepartment ticketDepartment;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        ticketDepartment = new TicketDepartment();
        ticketDepartment.setId(UUID.randomUUID().toString());
        ticketDepartment.setEmailId("user@example.com");
        ticketDepartment.setDepartment("IT");
        ticketDepartment.setIsActive(true);
    }

    @Test
    void testGetAllDepartments_Success() {
        List<TicketDepartment> departments = Collections.singletonList(ticketDepartment);
        when(ticketDepartmentService.getAllDepartments()).thenReturn(departments);

        ResponseEntity<List<TicketDepartment>> response = ticketDepartmentController.getAllDepartments();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
        assertEquals(ticketDepartment, response.getBody().get(0));

        verify(ticketDepartmentService, times(1)).getAllDepartments();
    }

    @Test
    void testGetAllDepartments_NoContent() {
        when(ticketDepartmentService.getAllDepartments()).thenReturn(Collections.emptyList());

        ResponseEntity<List<TicketDepartment>> response = ticketDepartmentController.getAllDepartments();

        assertEquals(204, response.getStatusCodeValue());
        verify(ticketDepartmentService, times(1)).getAllDepartments();
    }

    @Test
    void testGetUniqueDepartments_Success() {
        List<String> uniqueDepartments = Collections.singletonList("IT");
        when(ticketDepartmentService.getUniqueDepartments()).thenReturn(uniqueDepartments);

        ResponseEntity<List<String>> response = ticketDepartmentController.getUniqueDepartments();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
        assertEquals("IT", response.getBody().get(0));

        verify(ticketDepartmentService, times(1)).getUniqueDepartments();
    }

    @Test
    void testGetUniqueDepartments_NoContent() {
        when(ticketDepartmentService.getUniqueDepartments()).thenReturn(Collections.emptyList());

        ResponseEntity<List<String>> response = ticketDepartmentController.getUniqueDepartments();

        assertEquals(204, response.getStatusCodeValue());
        verify(ticketDepartmentService, times(1)).getUniqueDepartments();
    }

    @Test
    void testAddUserToDepartment_NewUser() {
        when(ticketDepartmentRepository.findByEmailId("user@example.com")).thenReturn(Optional.empty());
        when(ticketDepartmentRepository.save(any(TicketDepartment.class))).thenReturn(ticketDepartment);

        ResponseEntity<Map<String, Object>> response = ticketDepartmentController.addUserToDepartment(ticketDepartment);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("User added successfully!", response.getBody().get("msg"));

        verify(ticketDepartmentRepository, times(1)).findByEmailId("user@example.com");
        verify(ticketDepartmentRepository, times(1)).save(any(TicketDepartment.class));
    }

    @Test
    void testAddUserToDepartment_ExistingActiveUser() {
        when(ticketDepartmentRepository.findByEmailId("user@example.com")).thenReturn(Optional.of(ticketDepartment));

        ResponseEntity<Map<String, Object>> response = ticketDepartmentController.addUserToDepartment(ticketDepartment);

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("User is already active in another department.", response.getBody().get("msg"));

        verify(ticketDepartmentRepository, times(1)).findByEmailId("user@example.com");
        verify(ticketDepartmentRepository, never()).save(any());
    }

    @Test
    void testAddUserToDepartment_ExistingInactiveUser() {
        ticketDepartment.setIsActive(false);
        when(ticketDepartmentRepository.findByEmailId("user@example.com")).thenReturn(Optional.of(ticketDepartment));
        when(ticketDepartmentRepository.save(any(TicketDepartment.class))).thenReturn(ticketDepartment);

        ResponseEntity<Map<String, Object>> response = ticketDepartmentController.addUserToDepartment(ticketDepartment);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("User was inactive and has now been added to the new department.", response.getBody().get("msg"));

        verify(ticketDepartmentRepository, times(1)).findByEmailId("user@example.com");
        verify(ticketDepartmentRepository, times(1)).save(any(TicketDepartment.class));
    }

    @Test
    void testGetDepartmentByEmail_Success() {
        when(ticketDepartmentRepository.findByEmailId("user@example.com")).thenReturn(Optional.of(ticketDepartment));

        ResponseEntity<TicketDepartment> response = ticketDepartmentController.getDepartmentByEmail("user@example.com");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(ticketDepartment, response.getBody());

        verify(ticketDepartmentRepository, times(1)).findByEmailId("user@example.com");
    }

    @Test
    void testGetDepartmentByEmail_NotFound() {
        when(ticketDepartmentRepository.findByEmailId("user@example.com")).thenReturn(Optional.empty());

        ResponseEntity<TicketDepartment> response = ticketDepartmentController.getDepartmentByEmail("user@example.com");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(null, response.getBody().getDepartment());

        verify(ticketDepartmentRepository, times(1)).findByEmailId("user@example.com");
    }

    @Test
    void testGetUsersByDepartment_Success() {
        List<TicketDepartment> users = Collections.singletonList(ticketDepartment);
        when(ticketDepartmentRepository.findByDepartment("IT")).thenReturn(users);

        ResponseEntity<List<TicketDepartment>> response = ticketDepartmentController.getUsersByDepartment("IT");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
        assertEquals(ticketDepartment, response.getBody().get(0));

        verify(ticketDepartmentRepository, times(1)).findByDepartment("IT");
    }

    @Test
    void testGetUsersByDepartment_NotFound() {
        when(ticketDepartmentRepository.findByDepartment("IT")).thenReturn(Collections.emptyList());

        ResponseEntity<List<TicketDepartment>> response = ticketDepartmentController.getUsersByDepartment("IT");

        assertEquals(404, response.getStatusCodeValue());
        verify(ticketDepartmentRepository, times(1)).findByDepartment("IT");
    }

    @Test
    void testSaveUserByDepartment() {
        when(ticketDepartmentService.saveUserToDepartment(ticketDepartment)).thenReturn(ticketDepartment);

        ResponseEntity<TicketDepartment> response = ticketDepartmentController.saveUserByDepartment(ticketDepartment);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(ticketDepartment, response.getBody());

        verify(ticketDepartmentService, times(1)).saveUserToDepartment(ticketDepartment);
    }

    @Test
    void testUpdateUserStatus_Success() {
        when(ticketDepartmentService.updateUserStatusByEmail("user@example.com", true))
                .thenReturn(Optional.of(ticketDepartment));

        Map<String, Boolean> requestBody = new HashMap<>();
        requestBody.put("isActive", true);

        ResponseEntity<Map<String, String>> response = ticketDepartmentController.updateUserStatus("user@example.com", requestBody);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("User status updated successfully.", response.getBody().get("success"));

        verify(ticketDepartmentService, times(1)).updateUserStatusByEmail("user@example.com", true);
    }

    @Test
    void testUpdateUserStatus_NotFound() {
        when(ticketDepartmentService.updateUserStatusByEmail("user@example.com", true)).thenReturn(Optional.empty());

        Map<String, Boolean> requestBody = new HashMap<>();
        requestBody.put("isActive", true);

        ResponseEntity<Map<String, String>> response = ticketDepartmentController.updateUserStatus("user@example.com", requestBody);

        assertEquals(404, response.getStatusCodeValue());
        assertEquals("User not found.", response.getBody().get("error"));

        verify(ticketDepartmentService, times(1)).updateUserStatusByEmail("user@example.com", true);
    }

    @Test
    void testUpdateUserStatus_BadRequest() {
        Map<String, Boolean> requestBody = new HashMap<>();

        ResponseEntity<Map<String, String>> response = ticketDepartmentController.updateUserStatus("user@example.com", requestBody);

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Missing 'isActive' value in request body.", response.getBody().get("error"));

        verify(ticketDepartmentService, never()).updateUserStatusByEmail(anyString(), anyBoolean());
    }
}