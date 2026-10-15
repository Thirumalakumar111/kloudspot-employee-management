# Employee Management System

## Technology
- Java 17
- Spring Boot
- Spring Data MongoDB
- HTML, CSS and JavaScript
- JUnit 5 and Mockito
- Swagger/OpenAPI

## Requirements
Install Java 17+, Maven 3.9+, and MongoDB Community Server.

## Run MongoDB
Start the MongoDB service locally. The default connection is `mongodb://localhost:27017/employee_management`.

To use another MongoDB URI, set `MONGODB_URI` before starting the app.

Windows PowerShell:
```powershell
$env:MONGODB_URI="mongodb://localhost:27017/employee_management"
```

## Start application
From the project root:
```bash
mvn clean test
mvn spring-boot:run
```

Open `http://localhost:8080`.

Swagger UI: `http://localhost:8080/swagger-ui/index.html`

## API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/employees?page=0&size=10` | List employees |
| GET | `/api/employees?search=anil` | Search name or email |
| GET | `/api/employees?department=Engineering&status=Active` | Filter |
| GET | `/api/employees/{id}` | Employee details |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/{id}` | Update employee |
| DELETE | `/api/employees/{id}` | Delete employee |

## Sample POST body
```json
{
  "employeeId": "EMP001",
  "fullName": "Anil Kumar",
  "email": "anil@example.com",
  "phoneNumber": "9876543210",
  "department": "Engineering",
  "designation": "Software Engineer",
  "dateOfJoining": "2026-01-15",
  "salary": 450000,
  "employmentStatus": "Active"
}
```

## Submission checklist
- Run `mvn clean test`
- Start MongoDB and run the app
- Test create, view, update, delete, search, filters and pagination
- Capture screenshots of the working UI and Swagger
- Push the project to GitHub or create a ZIP
- Email `manjunatha.v@kloudspot.com` and include `hr.team@kloudspot.com` in To or CC
