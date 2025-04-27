# Get the directory of the script
$ScriptDir = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent

# Construct the path to the .sln file
$SolutionPath = Join-Path -Path $ScriptDir -ChildPath "Kairos.EmailTriage\Kairos.EmailTriage.sln"

# Run the solution using Start-Process
Start-Process -FilePath $SolutionPath