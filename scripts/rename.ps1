$files = Get-ChildItem -Path "c:\ViralMind" -Recurse -Include "*.ts","*.tsx","*.json","*.md" | Where-Object { $_.FullName -notmatch "\.next|node_modules|package-lock" }
foreach ($f in $files) {
  $content = Get-Content -Raw $f.FullName
  if ($content -match "ViralMind") {
    $updated = $content -replace "ViralMind", "Creatorly"
    Set-Content -Path $f.FullName -Value $updated -NoNewline
    Write-Host "Updated: $($f.Name)"
  }
}
Write-Host "Done."
