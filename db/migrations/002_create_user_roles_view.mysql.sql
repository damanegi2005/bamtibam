-- MySQL: View to provide role string from is_admin
CREATE OR REPLACE VIEW user_roles AS
SELECT
  id,
  name,
  email,
  CASE WHEN is_admin = 1 THEN 'admin' ELSE 'customer' END AS role
FROM users;


