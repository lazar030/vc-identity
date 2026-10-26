# Conventions

## data-testid

Format: `{feature}-{component}-{element}[-{qualifier}]`, kebab-case.

- `identity-users-table` — the component root
- `identity-users-table-row` — repeated elements share one id; select by index or content
- `identity-users-list-retry-button` — interactive elements end with their role
- `shared-state-view-error` — shared components use the `shared` prefix

Rules:
- Every interactive element and every UI state root gets a test id.
- Test ids never change for styling reasons; they are part of the component's contract.
- Tests select by data-testid first, then by role/label. Never by CSS class or layout.

## Folder rules

- `ui/` components: inputs and outputs only. No services injected.
- `pages/` components: inject the facade, pass data to `ui/` components.
- All HTTP calls go through a `data-access/` API service, called only from a facade.
