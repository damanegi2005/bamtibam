Param(
  [string]$Conn = "postgresql://bamtibam:bamtibam@localhost:5432/bamtibam"
)

Write-Host "[Postgres] Docker Compose up..."
docker compose up -d postgres

Write-Host "[Postgres] Apply schema..."
psql $Conn -f ./schema.postgres.sql

Write-Host "[Postgres] Apply migration..."
psql $Conn -f ./migrations/001_add_user_block_and_posts_reviews.postgres.sql

Write-Host "[Postgres] Seed..."
psql $Conn -f ./seed.postgres.sql

Write-Host "[Postgres] Done."


