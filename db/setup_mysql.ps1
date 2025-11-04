Param(
  [string]$Host = "127.0.0.1",
  [int]$Port = 3306,
  [string]$User = "bamtibam",
  [string]$Password = "bamtibam",
  [string]$RootPassword = "root",
  [string]$Db = "bamtibam"
)

Write-Host "[MySQL] Docker Compose up..."
docker compose up -d mysql

Write-Host "[MySQL] Apply schema..."
mysql -h $Host -P $Port -u $User -p$Password $Db < ./schema.mysql.sql

Write-Host "[MySQL] Apply migration..."
mysql -h $Host -P $Port -u $User -p$Password $Db < ./migrations/001_add_user_block_and_posts_reviews.mysql.sql

Write-Host "[MySQL] Seed (utf8mb4)..."
mysql --default-character-set=utf8mb4 -h $Host -P $Port -u $User -p$Password $Db < ./seed.mysql.sql

Write-Host "[MySQL] Done."


