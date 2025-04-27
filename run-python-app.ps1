# Get the directory of the script
$ScriptDir = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent

# Construct the path to the virtual environment activation script
# Assumes the virtual environment is named '.venv' and is in the script's directory
$VenvActivatePath = Join-Path -Path $ScriptDir -ChildPath ".venv/Scripts/Activate.ps1"

# Activate the virtual environment
# Use Write-Host for feedback, check if activation script exists
if (Test-Path $VenvActivatePath) {
    Write-Host "Activating virtual environment..."
    . $VenvActivatePath
} else {
    Write-Warning "Virtual environment activation script not found at $VenvActivatePath. Skipping activation."
}


# Construct the path to the Python entry point
$PythonAppPath = Join-Path -Path $ScriptDir -ChildPath "Kairos.EmailTriage.Model/app.py"

# Run the Python application
Write-Host "Running Python application: $PythonAppPath"
python $PythonAppPath