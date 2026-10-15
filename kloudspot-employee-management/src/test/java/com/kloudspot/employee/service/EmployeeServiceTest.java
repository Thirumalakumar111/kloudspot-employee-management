package com.kloudspot.employee.service;

import com.kloudspot.employee.model.Employee;
import com.kloudspot.employee.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmployeeServiceTest {
    @Test
    void rejectsDuplicateEmployeeId() {
        EmployeeRepository repository = mock(EmployeeRepository.class);
        MongoTemplate template = mock(MongoTemplate.class);
        EmployeeService service = new EmployeeService(repository, template);
        Employee employee = new Employee();
        employee.setEmployeeId("EMP001");
        employee.setEmail("test@example.com");
        employee.setEmploymentStatus("Active");
        when(repository.existsByEmployeeId("EMP001")).thenReturn(true);
        assertThrows(ResponseStatusException.class, () -> service.create(employee));
        verify(repository, never()).save(employee);
    }

    @Test
    void rejectsInvalidEmploymentStatus() {
        EmployeeRepository repository = mock(EmployeeRepository.class);
        MongoTemplate template = mock(MongoTemplate.class);
        EmployeeService service = new EmployeeService(repository, template);
        Employee employee = new Employee();
        employee.setEmploymentStatus("Pending");
        assertThrows(ResponseStatusException.class, () -> service.create(employee));
        verify(repository, never()).save(employee);
    }
}
