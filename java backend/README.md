# Chess Backend (Spring Boot)

Quickstart:

1. Run locally with Maven (requires a MySQL DB running at localhost:3306):
   mvn spring-boot:run

2. The API runs on http://localhost:8080
   - Health: GET /health
   - Register: POST /api/auth/register

3. Build locally with Maven:
   mvn -B package

> Default DB connection: jdbc:mysql://localhost:3306/chessdb (username: root, password: password). Update `src/main/resources/application.yml` or set `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` env vars as needed.

Notes:
- Flyway migrations are located under `src/main/resources/db/migration`
- Security: a basic `SecurityConfig` is included—implement JWT filters next
