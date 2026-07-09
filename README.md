# Allied ERP MVP

Internal ERP MVP for Allied Industrial Supplies, Inc.

## What This Includes

- Browser-based ERP app for sales orders, customers, products, users, verification workflow, credit workflow, shipping workflow, packing lists, and role-based dashboards.
- Windows launcher for local/network access.
- Windows installer scripts and EXE build process.
- Hosted HTTPS deployment preparation.
- PostgreSQL starter schema for future hosted production.

## Run Locally

Open PowerShell from the project folder and run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File outputs\start-allied-erp.ps1
```

The app listens on:

```text
http://10.41.25.188:4173
```

If your server computer has a different LAN IP address, update `outputs/config.json`.

## Build Installer

Create the ZIP installer:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File installer\Build-Installer.ps1
```

Create the EXE installer:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File installer\Build-ExeInstaller.ps1
```

Generated installer files are placed in `dist`.

## Important Storage Note

The current MVP stores live ERP data in the browser on the computer using the app. For shared hosted production, use the hosted deployment guidance and database schema included in this repository.

## Documentation

- `README_INSTALL.md`
- `README_UPDATE.md`
- `README_TROUBLESHOOT_INSTALL.md`
- `TROUBLESHOOTING.md`
- `DEPLOY_HTTPS.md`
- `database/README_DATABASE.md`
