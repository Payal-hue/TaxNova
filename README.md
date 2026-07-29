# TaxNova registration

The flows are:

- `POST /api/auth/register → AuthController → AuthService → BCrypt → MySQL users → JWT response`
- `POST /api/auth/login → AuthController → AuthService → BCrypt comparison → JWT response`

`js/apiClient.js` attaches logged-in requests as `Authorization: Bearer JWT_TOKEN`.
`GET /api/auth/me` is included as a protected example endpoint; it rejects absent, invalid, or expired tokens.

1. Install Node.js LTS and MySQL Server.
2. Run `database/schema.sql` in MySQL Workbench.
3. Copy `.env.example` to `.env`, then set your MySQL password and a strong JWT secret.
4. Run `npm install`, then `npm start`.
5. Serve this folder with VS Code Live Server on port 8080 and open `http://localhost:8080/register.html`.
