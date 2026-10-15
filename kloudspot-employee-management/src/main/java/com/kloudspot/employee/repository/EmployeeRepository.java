package com.kloudspot.employee.repository;

import com.kloudspot.employee.model.Employee;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EmployeeRepository extends MongoRepository<Employee, String> {
    boolean existsByEmployeeId(String employeeId);
    boolean existsByEmail(String email);
    boolean existsByEmployeeIdAndIdNot(String employeeId, String id);
    boolean existsByEmailAndIdNot(String email, String id);
}
