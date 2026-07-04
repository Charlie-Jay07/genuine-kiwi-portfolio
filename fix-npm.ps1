Write-Host "Fixing npm registry and clearing old install files..." -ForegroundColor Cyan

try { taskkill /f /im node.exe 2>$null | Out-Null } catch {}

npm config set registry https://registry.npmjs.org/
npm config delete proxy 2>$null
npm config delete https-proxy 2>$null

$items = @("node_modules", "package-lock.json", "npm-shrinkwrap.json")
foreach ($item in $items) {
  if (Test-Path $item) {
    Write-Host "Removing $item" -ForegroundColor Yellow
    Remove-Item $item -Recurse -Force
  }
}

Write-Host "Installing from public npm registry..." -ForegroundColor Cyan
npm install --registry=https://registry.npmjs.org/ --cache "$env:TEMP\genuine-kiwi-npm-cache"

Write-Host "Starting dev server..." -ForegroundColor Green
npm run dev
