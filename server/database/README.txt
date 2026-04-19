AI Safehouse database setup

Files
- 01_schema.sql: creates the full MySQL schema, triggers, and view.
- 02_seed.sql: inserts demo data, reviews, feedback, chat history, and an admin account.

How to import
1. Create or select a MySQL connection in XAMPP/phpMyAdmin.
2. Run 01_schema.sql.
3. Run 02_seed.sql.
4. Make sure server/.env points to DB_NAME=ai_safehouse and your local MySQL credentials.

Seeded admin account
- username: safehouse_admin
- email: admin@aisafehouse.local
- password: Admin123!

Notes
- The current backend already works with Categories, AI_Models, Reviews, and Users.
- Extra tables were added for admin-ready features such as settings, contact messages, spark ideas, tool usage, and chat history.
- Authentication routes and admin dashboard UI are not implemented yet, but the database is ready for them.
- The EER inheritance is represented by AI_Models as the superclass and Text_Models, Vision_Models, and Code_Models as disjoint subclass tables.
