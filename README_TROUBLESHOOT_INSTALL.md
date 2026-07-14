# Allied ERP Installer Troubleshooting

## What Was Fixed

The first EXE installer could fail without enough information because runtime config was written beside the app in Program Files, the app launcher only looked in the install folder for config, and startup failures such as port conflicts were not logged clearly.

The fixed installer now:

- Installs app files into Program Files.
- Stores runtime config in ProgramData and user AppData.
- Writes installer logs to ProgramData.
- Writes app startup logs to user AppData.
- Checks dependencies before install.
- Validates config before launch.
- Checks whether the local port is already in use.
- Creates required folders before writing files.
- Starts the app only after setup succeeds.

## Log Locations

Installer log:

```text
C:\ProgramData\Allied Industrial Supplies\ERP\Logs\installer-error-log.txt
```

App startup log:

```text
%LOCALAPPDATA%\Allied Industrial Supplies\ERP\app-startup-log.txt
```

## Failure Checklist

1. Installer fails to build: run `installer\Build-Installer.ps1`, then `installer\Build-ExeInstaller.ps1`, and confirm `dist\AlliedERP-Setup-1.0.0.exe` exists.
2. Installer opens but fails during installation: run as Administrator and open `installer-error-log.txt`.
3. Install completes but ERP fails to launch: open `app-startup-log.txt` and check if port `4173` is already in use.
4. Dependencies missing: run `Check-Dependencies.ps1`; install Microsoft Edge or Google Chrome if no browser is available.
5. Environment variables missing: the local installed MVP does not require environment variables.
6. Database connection failing: the local installed MVP does not connect to a database.
7. File paths incorrect: app files should be in Program Files, config in ProgramData/AppData.
8. Permissions blocked by Windows: run installer, uninstall, and reinstall scripts as Administrator.
9. App trying to write inside Program Files: the fixed launcher writes logs and user config under AppData.
10. Ports already in use: pick a different port during install, or edit `localPort` in config.
11. Other computers cannot connect: confirm `bindHost` is `0.0.0.0`, confirm Windows Firewall allows TCP port `4173`, and open the network URL shown in the launcher window from the other computer.

## Repair Commands

Dependency check:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Check-Dependencies.ps1
```

Validate config:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Validate-Config.ps1
```

Clean uninstall:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Clean-Uninstall-AlliedERP.ps1
```

Reinstall:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Reinstall-AlliedERP.ps1
```
