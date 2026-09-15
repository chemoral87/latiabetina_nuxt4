# Update Payload Rules

When updating records via API, certain fields must be excluded from the payload to prevent unintended side effects.

## Rule: Remove immutable fields on update

Always delete fields that should not be changed after creation before sending the update payload.

```ts
async function saveEditAssistance(item: Record<string, unknown>) {
  const payload = { ...item }
  delete payload.org_id // org_id is immutable on update
  // ... rest of the save logic
}
```

## Common immutable fields

| Field        | Reason                                      |
| ------------ | ------------------------------------------- |
| `org_id`     | Organization cannot be changed after creation |
| `created_by` | Creator is set on store, never updated      |
| `created_at` | Timestamp is set on store, never updated    |

## Backend validation

The backend should also enforce this by making the field `nullable` instead of `required` on update:

```php
'org_id' => $ignoreId ? 'nullable|exists:organizations,id' : 'required|exists:organizations,id',
```

## Why

- Prevents accidental reassignment of ownership/organization
- Keeps audit trail integrity
- Avoids unnecessary validation errors on the backend
