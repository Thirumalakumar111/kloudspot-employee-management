package com.kloudspot.employee.service;

import java.util.regex.Pattern;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.kloudspot.employee.model.Employee;
import com.kloudspot.employee.repository.EmployeeRepository;

@Service
public class EmployeeService {

    private final EmployeeRepository repository;
    private final MongoTemplate mongoTemplate;

    public EmployeeService(EmployeeRepository repository,
                           MongoTemplate mongoTemplate) {
        this.repository = repository;
        this.mongoTemplate = mongoTemplate;
    }

    public Page<Employee> list(String search, String department,
                               String status, int page, int size) {

        Query query = new Query();

       
        if (search != null && !search.isBlank()) {
            String searchText = Pattern.quote(search.trim());

            query.addCriteria(new Criteria().orOperator(
                Criteria.where("fullName").regex(searchText, "i"),
                Criteria.where("email").regex(searchText, "i")
            ));
        }

        // Filter by department, ignoring capitalization.
        if (department != null && !department.isBlank()) {
            String departmentText =
                "^" + Pattern.quote(department.trim()) + "$";

            query.addCriteria(
                Criteria.where("department").regex(departmentText, "i")
            );
        }

        
        if (status != null && !status.isBlank()) {
            String statusText =
                "^" + Pattern.quote(status.trim()) + "$";

            query.addCriteria(
                Criteria.where("employmentStatus").regex(statusText, "i")
            );
        }


        long total = mongoTemplate.count(query, Employee.class);

  
        Pageable pageable = PageRequest.of(
            page,
            size,
            Sort.by(Sort.Direction.DESC, "dateOfJoining")
        );

        query.with(pageable);

        return new PageImpl<>(
            mongoTemplate.find(query, Employee.class),
            pageable,
            total
        );
    }

    public Employee get(String id) {
        return repository.findById(id)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Employee not found"
                )
            );
    }

    public Employee create(Employee employee) {
        validateStatus(employee.getEmploymentStatus());

        if (repository.existsByEmployeeId(employee.getEmployeeId())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Employee ID already exists"
            );
        }

        if (repository.existsByEmail(employee.getEmail())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email already exists"
            );
        }

        return repository.save(employee);
    }

    public Employee update(String id, Employee employee) {
        Employee existing = get(id);

        validateStatus(employee.getEmploymentStatus());

        if (repository.existsByEmployeeIdAndIdNot(
                employee.getEmployeeId(), id)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Employee ID already exists"
            );
        }

        if (repository.existsByEmailAndIdNot(
                employee.getEmail(), id)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email already exists"
            );
        }

        employee.setId(existing.getId());

        return repository.save(employee);
    }

    public void delete(String id) {
        repository.delete(get(id));
    }

    private void validateStatus(String status) {
        if (!"Active".equals(status) && !"Inactive".equals(status)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Employment status must be Active or Inactive"
            );
        }
    }
}