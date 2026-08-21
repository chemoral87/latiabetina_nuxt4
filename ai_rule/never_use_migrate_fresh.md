# Regla: Nunca ejecutar migrate:fresh

**CRÍTICO:** NUNCA ejecutar `php artisan migrate:fresh` o `artisan migrate:refresh` en un entorno que tenga datos reales/producción.

Estos comandos **eliminan todas las tablas y datos** antes de re-crear la estructura.

## Correcto

```bash
# Solo aplicar migraciones pendientes
php artisan migrate
```

## Incorrecto (DESTRUYE DATOS)

```bash
php artisan migrate:fresh    # ❌ ELIMINA TODAS LAS TABLAS
php artisan migrate:refresh  # ❌ ELIMINA TODAS LAS TABLAS
```

## Migraciones con DROP de índice

Si una migración necesita eliminar un índice que es usado por una foreign key, usar:

```php
DB::statement('ALTER TABLE table_name DROP INDEX index_name');
```

O si el índice es largo, acortar el nombre al crear:

```php
$table->index(['col1', 'col2'], 'idx_corto');
```

## Verificación

Siempre verificar que la migración funciona sin `fresh` ejecutando `php artisan migrate` en un entorno con datos de prueba.
