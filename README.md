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

The app listens on your computer's network address, for example:

```text
http://YOUR-SERVER-COMPUTER-IP:4173
```

Use the network URL shown by the launcher. Other computers must use your computer's IP address, not their own `localhost`.

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

When the app is started from `outputs\start-allied-erp.ps1` or the installer, shared ERP data is saved on the host computer and all network users read/write the same orders, statuses, chats, customers, and products. Browser local storage is kept as a fallback if the shared host API is unavailable.

For full hosted production, use the hosted deployment guidance and database schema included in this repository.

## Documentation

- `README_INSTALL.md`
- `README_UPDATE.md`
- `README_TROUBLESHOOT_INSTALL.md`
- `TROUBLESHOOTING.md`
- `DEPLOY_HTTPS.md`
- `database/README_DATABASE.md`
