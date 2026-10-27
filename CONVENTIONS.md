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

## Folder structure

Feature-based, using intent-revealing names (the Nx `feature` / `ui` / `data-access` taxonomy):

```
src/app/
  core/            app-wide singletons, grouped by domain
    auth/          AuthStore, AuthApi, authGuard
    http/          HTTP interceptors
    models/        shared domain types
  shared/          reusable across features
    ui/            presentational components (inputs/outputs only)
    directives/
    data-access/   reusable state helpers (e.g. LoadState)
  features/<feature>/
    data-access/   API services + facade/store — the only place HTTP lives
    ui/            feature-local presentational components
    pages/         routed container components (inject the facade)
  layout/          app shell (toolbar + <router-outlet>)
```

This is the same `core` / `shared` / `features` pattern as the common Angular layout; the names are
deliberately more specific. The usual `components` → here `ui` (presentational only); the usual
`services` → here `data-access` (the API + facade/store layer); `pages` are the containers that inject
the facade. Naming the layers this way makes the Store/Facade boundary explicit and keeps presentational
components trivial to unit-test and to render in Storybook.
