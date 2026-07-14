#define MyAppName "Allied ERP"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Allied Industrial Supplies, Inc."

[Setup]
AppId={{D51966E2-1C49-4C81-92D7-0D37C15A2E9D}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\Allied Industrial Supplies\ERP
DefaultGroupName=Allied Industrial Supplies
DisableProgramGroupPage=yes
OutputDir=..\dist
OutputBaseFilename=AlliedERP-Setup-{#MyAppVersion}
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin

[Files]
Source: "..\outputs\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs; Excludes: "Allied-ERP-Application.zip,Allied-ERP-Application"
Source: "Uninstall-AlliedERP.ps1"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{commondesktop}\Allied ERP"; Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\start-allied-erp.ps1"""; WorkingDir: "{app}"; IconFilename: "{app}\allied-logo.jpg"
Name: "{group}\Allied ERP"; Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\start-allied-erp.ps1"""; WorkingDir: "{app}"; IconFilename: "{app}\allied-logo.jpg"

[Run]
Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\start-allied-erp.ps1"""; Description: "Start Allied ERP"; Flags: postinstall nowait skipifsilent

[UninstallRun]
Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\Uninstall-AlliedERP.ps1"""; Flags: runhidden
