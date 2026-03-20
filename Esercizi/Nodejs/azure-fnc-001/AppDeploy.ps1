$resourceGroupName = "BEST0044-GR-B-Servless"
$functionAppName = "best004grbapp001"
$suffix = "$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Creating deployment package for Azure Function App: $($functionAppName) ...."

npm run clean && npm run build

$folderDeploy = "deploy"
$folderDeployTemp = "$($folderDeploy)\deploy-$suffix"
New-Item -ItemType Directory -Path $folderDeployTemp

# Copia i file necessari per il deploy
Copy-Item -Path "dist" -Destination "$($folderDeployTemp)" -Recurse
# Copy-Item -Path "node_modules" -Destination $folderDeployTemp -Recurse
Copy-Item -Path "package.json" -Destination $folderDeployTemp
Copy-Item -Path "host.json" -Destination $folderDeployTemp

Set-Location $folderDeployTemp
npm install --production
Set-Location ..
Set-Location ..

# Crea Zip
$zipPath = "deploy\$($functionAppName)-$suffix.zip"
Compress-Archive -Path "$folderDeployTemp\*" -DestinationPath $zipPath -Force

# az functionapp deployment source config-zip --resource-group $resourceGroupName --name $functionAppName --src $zipPath --build-remote true    

# Remove-Item "$folderDeployTemp" -Recurse -Force

Write-Host "Deployment package created at: $zipPath ($('{0:N2}' -f ((Get-Item $zipPath).Length / 1MB)) MB)"