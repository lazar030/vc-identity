# Scope: Suspend user

**Design baseline:** none for this practice task. On a real task, the Ready for Dev
Figma frames and their node IDs are listed here.

## Included
- "Suspend" row action for active users, shown only with the `users.update` capability
- No Suspend action on the current user's own row, or on suspended/invited users
- Shared confirm dialog component, reusable for other destructive actions
- Dialog states: idle, pending, error with retry; closes itself on success
- Success snackbar; the row's status updates in place without reloading the list
- Error copy for 403 (permission removed), 409 (business rule, server message shown) and other failures
- Storybook stories for the new table state and every dialog state
- Playwright coverage: happy path, cancel, Escape + focus return, error/retry, 403, 409,
  hidden actions, manager role, API-level permission check
- Visual baselines for the dialog states; list baselines updated where the table changes

## Excluded
- Reactivating a suspended user (separate scope)
- Bulk suspend
- Refreshing the user's capabilities after a 403 (shows an error only)
- Any backend change

## API dependencies
| Endpoint / rule | Status |
|---|---|
| `PATCH /api/users/:id` with `{ status: 'suspended' }`, requires `users.update` | Exists |
| Reject suspending your own account (expected: 409 with a message) | **Backend-blocked**: hidden in the UI, but the server accepts it today |
| Suspended users cannot sign in | **Backend-blocked**: the dialog copy promises this |

## Estimate
| Item | Hours |
|---|---|
| Facade: mutation state, update, error mapping | 1.5 |
| Table action + stories | 1 |
| Confirm dialog + stories | 2 |
| Page wiring, snackbar | 0.5 |
| Playwright behavior tests | 2 |
| Visual baselines (local + CI) | 1 |
| Evidence pack | 0.5 |
| **Total** | **8.5** |
