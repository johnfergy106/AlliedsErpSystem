# Allied ERP Installation Guide

## Project Inspection Summary

App framework and language:

- Static browser application
- HTML, CSS, and vanilla JavaScript
- Progressive Web App manifest and service worker
- Windows PowerShell local launcher

Required runtime/dependencies:

- Windows 10 or newer for the packaged employee install
- PowerShell 5.1 or newer
- Microsoft Edge, Google Chrome, or another modern browser
- No Node.js runtime is required for the installed MVP
- Optional: Inno Setup 6 if you want to build a formal `.exe` installer

Database requirements:

- Current MVP: no external database
- Current data storage: browser `localStorage` on each employee computer
- Hosted production recommendation: PostgreSQL 15 or newer

Environment variables:

- Current installed MVP: none required
- Hosted production: see `deployment/.env.production.sample`

Build commands:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File installer\Build-Installer.ps1
```

Startup commands:

```powershell
outputs\start-allied-erp.bat
```

Installed startup command:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Program Files\Allied Industrial Supplies\ERP\Launch-AlliedERP.ps1"
```

Required ports:

- Default local install port: `4173`
- The installer can save a different local port in `config.json`
- The installed launcher binds to `0.0.0.0` so other computers on the same network can connect
- Environment overrides are available: `ALLIED_ERP_PORT`, `ALLIED_ERP_HOST`, and `ALLIED_ERP_PUBLIC_HOST`
- Hosted HTTPS deployment should use `443`

Files to include:

- `index.html`
- `styles.css`
- `app.js`
- `manifest.json`
- `config.json`
- `version.json`
- `allied-logo.jpg`
- `service-worker.js`
- `start-allied-erp.bat`
- `start-allied-erp.ps1`
- `README.txt`

Files to exclude from employee app payload:

- Source control folders
- `work`
- `dist`
- installer source files, except the installer package itself
- old ZIP packages

## Build The Installer Package

1. Open PowerShell in the project folder.
2. Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File installer\Build-Installer.ps1
```

3. The build creates:

```text
dist\AlliedERP-Installer-1.0.0.zip
```

If Inno Setup is installed, the script also attempts to create a formal setup executable from `installer\AlliedERP.iss`.

To build the Windows self-extracting `.exe` installer with the built-in Windows IExpress tool, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File installer\Build-ExeInstaller.ps1
```

That creates:

```text
dist\AlliedERP-Setup-1.0.0.exe
```

## Install On An Employee Computer

1. Run `AlliedERP-Setup-1.0.0.exe` as Administrator, or extract `AlliedERP-Installer-1.0.0.zip`.
2. Right-click PowerShell and choose Run as Administrator.
3. Go to the extracted installer folder.
4. Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Install-AlliedERP.ps1
```

5. Enter the company settings when prompted.
   - Use `0.0.0.0` for the network bind host.
   - Use the server computer's LAN IP for the network address employees will use. The installer tries to detect it automatically.
6. The installer copies the ERP to:

```text
C:\Program Files\Allied Industrial Supplies\ERP
```

7. The installer creates:

- Desktop shortcut
- Start menu shortcut
- Windows uninstall entry
- Company config file
- Local app launcher
- Installer log in ProgramData
- App startup log in user AppData

8. The installer starts the ERP after installation.

Runtime config is stored outside Program Files:

```text
C:\ProgramData\Allied Industrial Supplies\ERP\config.json
%LOCALAPPDATA%\Allied Industrial Supplies\ERP\config.json
```

Logs are stored outside Program Files:

```text
C:\ProgramData\Allied Industrial Supplies\ERP\Logs\installer-error-log.txt
%LOCALAPPDATA%\Allied Industrial Supplies\ERP\app-startup-log.txt
```

## First Run

The installed MVP opens in the browser at:

```text
http://YOUR-SERVER-COMPUTER-IP:4173
```

Use the network URL shown in the launcher window. Other computers must use your computer's IP address, not their own `localhost`.

When employees connect to the ERP through the host computer URL, the installed launcher stores shared ERP data on the host computer so all roles see the same order updates, chats, statuses, customers, and product changes. Browser local storage is kept only as a fallback if the shared host API is unavailable.

For a full hosted production database, use the hosted HTTPS deployment plan in `DEPLOY_HTTPS.md`.

## Uninstall

Use Windows Apps and Features, or run as Administrator:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Program Files\Allied Industrial Supplies\ERP\Uninstall-AlliedERP.ps1"
```

The uninstall removes app files and shortcuts. The ProgramData config folder is left in place for audit and reinstall reference.
