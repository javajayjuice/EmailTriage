# Get the directory of the script
$ScriptDir = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent

# Navigate to the Next.js app directory
$NextJsAppPath = Join-Path -Path $ScriptDir -ChildPath "Kairos.EmailTriage.UI"
Set-Location -Path $NextJsAppPath

# Run the Next.js app in development mode
npm run dev

# .\start-nextjs.ps1