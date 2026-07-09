# Allied ERP Troubleshooting

## Installer Must Run As Administrator

The installer writes to Program Files and creates machine-wide shortcuts. If installation fails with an access error, open PowerShell as Administrator and run the installer again.

## Browser Does Not Open

Open this address manually:

```text
http://localhost:4173
```

If you changed the local port during install, use that port instead.

## Port Already In Use

Edit:

```text
C:\Program Files\Allied Industrial Supplies\ERP\config.json
```

Change `localPort` to an unused port, then restart the desktop shortcut.

## App Shows Old Version

The browser may have cached an older service worker.

1. Close all ERP browser tabs.
2. Reopen from the desktop shortcut.
3. If needed, clear site data for `localhost`.

## Login Problems

The sign-in page no longer displays demo accounts. Ask a Super Admin or Admin to reset the password. Only Super Admin can view saved passwords in the MVP user management screen.

## Data Missing On Another Computer

The installed MVP stores data in the browser profile on each computer. Use the hosted HTTPS production deployment for shared company-wide data.

## Assistant Verification Fails

Check:

- Assistant endpoint is entered correctly.
- API key is present where required.
- The employee computer can reach the endpoint.
- The order has a valid preferred phone number.

For hosted production, keep Assistant API keys on the server only.
