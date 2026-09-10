INSERT INTO users (
    email,
    password,
    first_name,
    last_name,
    phone,
    is_active,
    created_at,
    update_at
)
VALUES (
           'admin@gmail.com',
           '$2a$10$ixMlTnasZbgt5KjlJO3Dv.Us1e4FD9djcEB5LRpFtVyg8EA/t8na.',
           'Admin',
           'Admin',
           NULL,
           TRUE,
           '2026-09-09 00:00:00',
           '2026-09-09 00:00:00'
       );

INSERT INTO users_roles (users_id, roles_id)
SELECT u.id, r.id
FROM users u
         JOIN roles r ON r.role = 'ADMIN'
WHERE u.email = 'admin@gmail.com';