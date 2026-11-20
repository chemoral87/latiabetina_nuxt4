# church-member-manage

Archivos que referencian el permiso `church-member-manage`.

Un solo permiso de escritura: alta, edición y baja de miembros. Reemplaza `church-member-create`, `church-member-update` y `church-member-delete`. El flujo propio sigue en `church-member-my-manage`.

## Files

- `app\pages\consolidation\[id]\details.vue` (botón Nuevo Miembro y columna eliminar, visibilidad condicional)
- `app\components\Consolidation\MemberTable.vue` (botón eliminar, vía prop `can-delete`)
- `app\pages\church-member\[id]\index.vue` (pasa `can-edit` al header)
- `app\components\ChurchMember\Header.vue` (botón Editar Datos y clic en la foto, vía prop `can-edit`)
