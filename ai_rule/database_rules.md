# Database Rules

## Never Run `migrate:fresh` on Real Data

**CRITICAL:** NEVER run `php artisan migrate:fresh` or `artisan migrate:refresh` on an environment with real/production data. These commands **drop all tables and data** before re-creating the structure.

```bash
# ✅ Correct — only apply pending migrations
php artisan migrate

# ❌ Incorrect — DESTROYS ALL DATA
php artisan migrate:fresh
php artisan migrate:refresh
```

## Migrations with DROP Index

If a migration needs to drop an index used by a foreign key:

```php
DB::statement('ALTER TABLE table_name DROP INDEX index_name');
```

Or shorten the index name if it exceeds 64 characters:

```php
$table->index(['col1', 'col2'], 'idx_short');
```
