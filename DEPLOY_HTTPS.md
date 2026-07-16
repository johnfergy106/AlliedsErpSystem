# Hosted HTTPS Deployment Guide

## Goal

Deploy Allied ERP as a private employee-only HTTPS application with central authentication, role-based permissions, secure configuration, backups, and a future update path.

## Important Current-State Note

The current MVP is a browser app served by a Node server. Browser `localStorage` is only a fallback cache; shared hosted ERP data is stored by the server in `ALLIED_ERP_DATA_DIR`.

The included Render setup mounts a persistent disk at `/var/data/allied-erp` and stores `shared-state.json` there. Do not use a temporary deploy folder for `ALLIED_ERP_DATA_DIR`.

## Recommended Production Architecture

- Frontend: existing static ERP app served over HTTPS
- Backend API: Node.js, .NET, or another server framework
- Database: PostgreSQL 15 or newer
- Reverse proxy: Nginx, Caddy, IIS, or managed hosting load balancer
- TLS certificate: Let's Encrypt or managed certificate
- Authentication: server-side sessions or OIDC/Microsoft Entra ID
- Password storage: Argon2id or bcrypt hashes, never plain text
- Secrets: environment variables or a managed secret vault
- Backups: persistent-disk JSON backups for the MVP; automated daily database backups after PostgreSQL migration

## Role-Based Permissions

Keep these permissions on the server, not only in the browser:

- Super Admin: all features, can assign Super Admin users
- Admin: all submitted orders, manual verification, user management except Super Admin assignment
- Sales: own customers and own sales orders only
- Credit Dept.: verified and credit workflow orders, can assign order numbers and change credit statuses
- Shipping: sent-to-shipping workflow orders, packing lists, tracking, partial ship, shipped, cancelled

## Secure Environment Configuration

Use:

```text
deployment\.env.production.sample
```

Production requirements:

- `FORCE_HTTPS=true`
- Strong `SESSION_SECRET`
- Persistent `ALLIED_ERP_DATA_DIR` for the MVP, or real `DATABASE_URL` after PostgreSQL migration
- Assistant API key stored server-side only
- Database SSL enabled when hosted remotely

## HTTPS Deployment Steps

1. Provision a private DNS name, for example `erp.alliedsupplies.net`.
2. Provision a Linux or Windows server, or a managed app hosting service.
3. Install PostgreSQL or create a managed PostgreSQL database.
4. Apply `database/hosted-postgresql-schema.sql`.
5. Deploy the frontend files from `outputs`.
6. Deploy the backend API when built.
7. Configure HTTPS certificate.
8. Redirect HTTP to HTTPS.
9. Configure private employee login.
10. Disable default/demo passwords before production use.
11. Verify each role with a test user.

## Backup Guidance

Minimum backup schedule:

- Daily full data backup
- 30 day retention
- Weekly restore test
- Keep one encrypted offsite copy

Example PostgreSQL backup command:

```bash
pg_dump "$DATABASE_URL" --format=custom --file="/var/backups/allied-erp/allied-erp-$(date +%F).dump"
```

Example restore command:

```bash
pg_restore --clean --if-exists --dbname "$DATABASE_URL" "/var/backups/allied-erp/allied-erp-YYYY-MM-DD.dump"
```

Current Render MVP backup location:

```text
/var/data/allied-erp/shared-state.json
/var/data/allied-erp/backups/shared-state-latest.json
```

## Future Release Process

1. Update `outputs/version.json`.
2. Run tests and role workflow checks.
3. Back up the database.
4. Deploy to staging.
5. Run migrations.
6. Verify staging.
7. Deploy to production.
8. Monitor login, order entry, status changes, and Assistant Verification.

## Security Checklist Before Public Internet Exposure

- No plain-text passwords in the database
- No Assistant API key in browser JavaScript
- HTTPS enforced
- Secure cookies enabled
- CSRF protection enabled for form/API writes
- Server-side role checks on every API route
- Audit log for order status changes
- Database backups tested
- Admin account passwords changed from defaults
