# Boxcha Management System

Professional management system for a children's center / kindergarten.

## Implemented
- Modern responsive dashboard UI
- Login with JWT access and refresh token flow
- Role-based navigation and backend authorization
- ADMIN / DIRECTOR / DOCTOR / TEACHER support
- Children management with profile details
- Groups and group details
- Today's attendance workflow
- Attendance locking after closing
- Backend validation: only today's attendance can be entered
- Teacher group access restriction
- Payment status on children
- Dashboard statistics
- Employee management
- Search and filtering foundation
- Loading, empty, error and toast states
- Responsive desktop/tablet/mobile layout

## Run
1. Create PostgreSQL database: `boxcha`
2. Configure `src/main/resources/application.properties`
3. Run:
   - `./mvnw spring-boot:run` if Maven Wrapper is configured
   - or `mvn spring-boot:run`

Default newly created employee password:
`boxcha001` if no password is provided.

## Main URLs
- `/home.html`
- `/auth/login.html`
- `/cabinet.html`
- `/swagger-ui.html`
