# Allied ERP Database Setup

## Current MVP Storage

The current ERP MVP is a static browser application. It stores orders, users, products, customers, and settings in browser `localStorage` on the employee computer.

This means the current installed MVP does not require SQL Server, PostgreSQL, or a network database. Each computer keeps its own local copy of data.

## Installed MVP Migration Process

The local app normalizes saved browser data each time it starts. The current schema migration rules live in `outputs/app.js` in `normalizeState`.

For employee computers:

1. Install the application.
2. Open the ERP once.
3. The browser data is upgraded automatically if older fields are missing.
4. Use the browser export/print/download tools for order records.

## Hosted Production Recommendation

For a shared company ERP with private employee login, use PostgreSQL on the hosted server. Do not use browser `localStorage` as the system of record for a multi-user production deployment.

Recommended database:

- PostgreSQL 15 or newer
- Daily automated backups
- Point-in-time restore if available from the hosting provider
- Encrypted disk storage
- Separate database user with least-privilege access

See `database/hosted-postgresql-schema.sql` for a starter production schema.
