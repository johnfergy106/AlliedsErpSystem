# Allied ERP Update Guide

## Version Support

The app version is stored in:

```text
outputs\version.json
```

Before a release:

1. Update `version`.
2. Update `releaseDate`.
3. Bump the service worker cache name in `outputs\service-worker.js`.
4. Rebuild the installer package.

## Build A New Release

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File installer\Build-Installer.ps1
```

## Employee Computer Update Process

1. Back up any important order records by printing or downloading them.
2. Run the new installer as Administrator.
3. Install to the same location.
4. Open the ERP and confirm the displayed version number changed.

The current MVP stores data in each browser profile. Installing a new app version does not automatically merge data between computers.

## Hosted Update Process

For a hosted HTTPS release:

1. Back up the database.
2. Deploy the new app build to a staging slot.
3. Run database migrations.
4. Verify login, roles, order entry, verification, credit, and shipping flows.
5. Switch traffic to the new release.
6. Keep the previous release package available for rollback.

## Rollback

Installed MVP rollback:

1. Uninstall the current version.
2. Reinstall the previous installer package.
3. Open the app and confirm the version.

Hosted rollback:

1. Restore the previous app package.
2. Restore the database backup only if the new migration cannot be safely reversed.
3. Confirm employee login and role access.
