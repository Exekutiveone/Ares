# PostgreSQL Server Configuration

This document outlines how the backend database server was set up and how to connect from a Java client.

## Server (Ubuntu)
1. Install PostgreSQL:
   ```bash
   sudo apt update
   sudo apt install postgresql -y
   ```

2. Edit configuration files:
   - `/etc/postgresql/16/main/postgresql.conf`
     ```
     listen_addresses = '*'
     ```
   - `/etc/postgresql/16/main/pg_hba.conf`
     ```
     host    all    all    0.0.0.0/0    md5
     ```

3. Restart the service:
   ```bash
   sudo systemctl restart postgresql
   ```

4. Create user and database:
   ```sql
   CREATE USER ares WITH PASSWORD 'ares';
   CREATE DATABASE ares;
   GRANT ALL PRIVILEGES ON DATABASE ares TO ares;
   ```

   If you later see `permission denied for table assets`, grant the user
   privileges to all tables and sequences:

   ```sql
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ares;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ares;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ares;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ares;
   ```

5. Allow port 5432 through the firewall (if active):
   ```bash
   sudo ufw allow 5432/tcp
   ```

## Java Client
1. Download the JDBC driver `postgresql-42.7.6.jar` from [jdbc.postgresql.org](https://jdbc.postgresql.org/) and include it on your project's classpath.

2. Remove `module-info.java` if present.

3. Test the connection using the following code snippet:
   ```java
   String url = "jdbc:postgresql://192.168.178.147:5432/ares";
   String user = "ares";
   String password = "ares";

   Connection conn = DriverManager.getConnection(url, user, password);
   ```
