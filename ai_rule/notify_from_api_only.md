# Notification from API Only

Do not call `notify.notify()` manually for success or error messages after API calls. The `withNotify` wrapper in the repository layer already handles notifications automatically.

## How it works

The `withNotify` function (in `repositories/factory/withNotify.ts`) intercepts every API response:

- **Success**: If the response contains `success`, `warning`, or `error` fields (sent by Laravel controllers), it shows the notification automatically.
- **Error**: For status codes 401, 403, 404, 405, it shows the error message from the API.
- **Validation (422)**: Extracts field-level errors for inline display via `useValidationErrors()`.

## Rule

```ts
// ❌ WRONG — causes duplicate notifications
try {
  await Resource.update(id, payload)
  notify.notify({ success: 'Updated successfully' }) // duplicate!
  closeDialog()
} catch (error) {
  notify.notify({ error: 'Error' }) // duplicate!
}

// ✅ CORRECT — let withNotify handle notifications
try {
  await Resource.update(id, payload)
  closeDialog()
} catch (error) {
  extractFromError(error) // for 422 validation errors only
}
```

## When to use manual notifications

Only call `notify.notify()` manually for:

1. **Non-API actions**: Local operations that don't go through the repository layer
2. **Custom messages**: When you need a different message than what the API returns
3. **Pre-validation warnings**: Warnings before an API call (e.g., "Are you sure?")

## Backend convention

Laravel controllers should return:

```php
return response()->json(['success' => __('messa.assistance_update')]);
```

The `withNotify` layer will automatically show this message as a success snackbar.
