# Playwright E2E Test Rule

## Required structure

Every multi-action E2E workflow must use `test.describe.serial()` with one `test()` block per user-visible task.

Required task boundaries:

1. Login
2. Permission verification
3. Create
4. Open details or navigate to the created record
5. Edit or manage related data
6. Delete related data
7. Return to the parent list
8. Delete the parent record

Each task must produce its own terminal checkmark through the configured step reporter or its own Playwright test result.

## State

Use serial tests when later tasks depend on records created by earlier tasks. Store only the minimum IDs and names needed by later tests in variables declared in the enclosing `describe` block.

Do not run dependent CRUD tests in parallel. Keep Playwright configured with `fullyParallel: false` and `workers: 1` for shared test accounts and databases.

## Authentication

Use `E2E_EMAIL` and `E2E_PASSWORD`. Never hard-code credentials.

Each test suite must:

- Navigate to `/login`.
- Wait for Vue hydration with `networkidle`.
- Log in using accessible textbox names.
- Assert `/dashboard` before continuing.

## Permissions

After login, navigate to `/account` and assert the required permission before performing the operation. Skip only when the permission is intentionally unavailable:

```ts
const account = page.locator('#acc-permissions-card')
await expect(account).toBeVisible()
const canDelete = await account.getByText('resource-delete', { exact: true }).isVisible()
```

## Selectors

Prefer, in order:

1. Stable IDs already present in the application.
2. `getByRole()` with accessible names.
3. `getByTitle()` for icon-only action buttons.

Do not use positional selectors when a row-specific ID or title exists. Scope row actions to the row containing the unique test record name or ID.

## Test data

Use unique values based on `Date.now()`:

```ts
const name = `E2E Entity ${Date.now()}`
```

Use random or future dates when the API enforces unique dates. Clean up created records even when a permission prevents UI deletion by using an authenticated API request only when that endpoint is part of the intended test setup.

## Verification

Run the focused spec first:

```bash
npx playwright test tests/e2e/<feature>.spec.ts --reporter=./reporters/steps.ts
```

Then run all E2E tests:

```bash
npx playwright test tests/e2e --reporter=./reporters/steps.ts
```

A test is complete only when the focused test passes and no dependent test data remains.
