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

- `components/` components: inputs and outputs only. No services injected.
- `pages/` components: inject the facade, pass data to `components/` components.
- All HTTP calls go through a `services/` API service, called only from a facade.

## Folder structure

Feature-based (`core` / `shared` / `features`):

```
src/app/
  core/            app-wide singletons
    services/      AuthStore, AuthApi (app-wide services)
    guards/        route guards (authGuard)
    interceptors/  HTTP interceptors
    models/        shared domain types
  shared/          reusable across features
    components/    presentational components (inputs/outputs only)
    directives/
    services/      reusable state helpers (e.g. LoadState)
  features/<feature>/
    services/      API client + facade/store — the only place HTTP lives
    components/    feature-local presentational components
    pages/         routed container components (inject the facade)
  layout/          app shell (toolbar + <router-outlet>)
```

`components/` are presentational (no injected services); `services/` hold the API client and the
facade/store (the only place HTTP lives); `pages/` are the containers that inject the facade. Keeping the
facade boundary explicit keeps presentational components trivial to unit-test and to render in Storybook.
