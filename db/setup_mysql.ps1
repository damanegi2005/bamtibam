Param(
  [string]$Host = "127.0.0.1",
  [int]$Port = 3307,  # Docker MySQL 포트로 변경
  [string]$User = "bamtibam",
  [string]$Password = "bamtibam",
  [string]$RootPassword = "root",
  [string]$Db = "bamtibam"
)

Write-Host "[MySQL] Docker Compose up..."
docker compose up -d mysql

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "[MySQL] Apply schema..."
Get-Content .\schema.mysql.sql | mysql -h $Host -P $Port -u $User -p$Password $Db

Write-Host "[MySQL] Apply migrations..."
Get-Content .\migrations\000_add_is_admin_to_users.mysql.sql | mysql -h $Host -P $Port -u $User -p$Password $Db
Get-Content .\migrations\001_add_user_block_and_posts_reviews.mysql.sql | mysql -h $Host -P $Port -u $User -p$Password $Db
Get-Content .\migrations\002_create_user_roles_view.mysql.sql | mysql -h $Host -P $Port -u $User -p$Password $Db

Write-Host "[MySQL] Seed (utf8mb4)..."
Get-Content .\seed.mysql.sql | mysql --default-character-set=utf8mb4 -h $Host -P $Port -u $User -p$Password $Db

Write-Host "[MySQL] Done."



