# Allied ERP Production Data Protection

Allied ERP is a production business system. Customer records, sales orders, products, Vapi notes, verification history, purchase order numbers, account numbers, and unit-of-measure records are permanent business data.

## Production Rules

- Production deployments must never reset, reseed, truncate, or replace business data.
- Seed/demo data is for development only and must not run automatically in production.
- Migrations must be additive and preserve existing values.
- Destructive migrations such as `DROP TABLE`, `TRUNCATE`, `DELETE FROM`, or dropping populated columns require explicit manual approval and a verified backup.
- Customers and products are soft-deleted with `deleted_at` and `deleted_by`; they are hidden from active lists but retained for recovery.
- Sales orders are not deleted automatically. User order removal hides the order for that user and records an audit entry.
- Completed, cancelled, and archived orders must remain searchable.

## Production Storage

Render must run with:

```text
NODE_ENV=production
ALLIED_ERP_DATA_DIR=/var/data/allied-erp
```

`ALLIED_ERP_DATA_DIR` must point to a Render persistent disk. The server refuses to start in production without this setting so it cannot accidentally store live data on an ephemeral deploy filesystem.

## Backups

The server writes `shared-state.json` atomically and keeps backup copies under:

```text
ALLIED_ERP_DATA_DIR/backups/
```

Each write creates a timestamped backup plus `shared-state-latest.json`. Keep at least 7 days of backups; 30 days is preferred. Before major releases, copy the latest backup to external storage.

## Restore

If the primary state file is unreadable, the server attempts to load `backups/shared-state-latest.json`. In production, if neither the state file nor backup can be read, startup fails instead of serving an empty database.

Soft-deleted customers and products can be restored from the Super Admin settings area.

## Deployment Checklist

1. Confirm Render persistent disk is attached.
2. Confirm `ALLIED_ERP_DATA_DIR` points to the persistent disk.
3. Run production build only.
4. Do not run reset, seed, demo, truncate, or cleanup commands.
5. Confirm backups exist before deployment.
6. After deployment, verify existing customers, sales orders, products, Vapi notes, verification history, PO numbers, account numbers, and unit-of-measure records are still present.
