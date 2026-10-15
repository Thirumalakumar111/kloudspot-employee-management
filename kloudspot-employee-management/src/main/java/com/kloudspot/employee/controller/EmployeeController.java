package com.kloudspot.employee.controller;

import com.kloudspot.employee.model.Employee;
import com.kloudspot.employee.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin
public class EmployeeController {
    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @GetMapping
    public Page<Employee> list(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String department,
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        if (page < 0 || size < 1 || size > 100) throw new IllegalArgumentException("Invalid pagination values");
        return service.list(search, department, status, page, size);
    }

    @GetMapping("/{id}")
    public Employee get(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping
    public Employee create(@Valid @RequestBody Employee employee) {
        return service.create(employee);
    }

    @PutMapping("/{id}")
    public Employee update(@PathVariable String id, @Valid @RequestBody Employee employee) {
        return service.update(id, employee);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
