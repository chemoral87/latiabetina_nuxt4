# conso-sheet-index

Archivos que referencian el permiso `conso-sheet-index`.

## Files

- `app\components\Consolidation\Dialog.vue`
- `app\components\Consolidation\Table.vue` (oculta la columna "Organización" cuando el usuario tiene una sola org, vía `hasSingleOrgFor`)
- `app\components\Tracking\Table.vue` (ídem: `hasSingleOrgFor`)
- `app\pages\consolidation\index.vue` (meta `permission`)
- `app\pages\consolidation\[id]\details.vue` (meta `permissions: ["conso-sheet-index"]`; la ruta exige `conso-sheet-index` aunque el middleware actual solo lee `permission`)
- `app\pages\tracking\index.vue` (meta `permission`)
- `app\pages\church-member\[id]\index.vue` (meta `permission`)

## Also referenced in

- `app\services\menu-service.ts` (visibilidad en el menú)
