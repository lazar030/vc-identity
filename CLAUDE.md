# CLAUDE.md — vc-identity

Angular 19 app (standalone APIs, SCSS, selector prefix `vc`). UI: Angular Material 19
(azure-blue prebuilt theme) + Tailwind CSS 3. Development backend: json-server.

## Commands

- `npm start` — dev server at http://localhost:4200 (proxies `/api` → json-server)
- `npm run api` — json-server backend at http://localhost:3000 (run in a separate terminal)
- `npm run build` — production build
- `npm test` — unit tests (Karma/Jasmine)

During development run `npm run api` and `npm start` together (two terminals).

## Folder architecture (feature-based)

```
src/app/
  core/          # app-wide singletons, imported once; provided in root
    models/      # cross-cutting domain types
    services/    # singleton services (e.g. ApiService)
    guards/      # route guards (CanActivate / CanMatch)
    interceptors/# HTTP interceptors
  shared/        # reusable + stateless; no feature knowledge
    components/  # presentational components
    directives/
    pipes/
  features/      # one self-contained folder per feature, lazy-loaded
    identity/
      pages/       # routed container components
      components/  # feature-local presentational components
      services/    # feature-scoped services/stores (provided at the route)
      models/      # feature domain types
      identity.routes.ts
  app.component.* # app shell (header + <router-outlet>)
  app.config.ts   # application providers
  app.routes.ts   # top-level lazy routes
```

Rules:
- Features never import from other features. Cross-feature code moves to `shared/` or `core/`.
- `core/` is imported once (root providers); `shared/` is stateless and reusable.
- Each feature is lazy-loaded via `loadChildren` → its own `*.routes.ts`.
- Feature services/stores are provided at the feature route (`providers: [...]`), not in root.

## Angular conventions (from the referenced best-practice skills)

- **Standalone components only** (default in v19). No NgModules.
- **`ChangeDetectionStrategy.OnPush`** on every component.
- **Signals for state**: `signal()`, `computed()`, `input()`, `output()`. Services expose
  read-only signals via `.asReadonly()`; components never mutate state directly.
- **`inject()`** for DI (not constructor parameters).
- **Built-in control flow**: `@if`, `@for` (always with `track`; never `$index` as the identity
  of real data), `@switch`, `@empty`.
- **No method calls in templates** — use signals/`computed()` or pipes.
- **RxJS cleanup** with `takeUntilDestroyed()` when subscribing inside components.
- **Parallel requests** with `forkJoin`; prefer route resolvers over in-component waterfalls.
- Virtual scrolling (Angular CDK) for large lists.
- Consider **zoneless** (`provideZonelessChangeDetection()`) once the app is signal-first;
  it currently uses zone.js with `provideZoneChangeDetection({ eventCoalescing: true })`.

## HTTP / data

- Flow: component → feature service → `core/ApiService` → HttpClient. Nothing injects
  `HttpClient` directly except `ApiService`.
- Base URL comes from `src/environments/environment.ts` (`apiUrl: '/api'`), proxied to json-server.
- json-server data lives in `db.json`; each top-level key is a REST resource (e.g. `/api/identities`).

## data-testid convention

Every element an automated test targets gets a stable `data-testid`. Format:

```
<feature>-<element>[-<variant>]
```

- kebab-case, lowercase.
- `<feature>`: the feature or shell owning the element (`app`, `identity-list`, `login`, …).
- `<element>`: what it is (`title`, `row`, `submit-button`, `error`).
- `<variant>`: optional disambiguator, often an id (`identity-list-row-1`).

In use: `app-title`, `app-test-button`, `identity-list`, `identity-list-title`,
`identity-list-refresh`, `identity-list-row-1`, `identity-list-error`, `identity-list-empty`.

Rules: never target elements by CSS class or text — `data-testid` is the contract between UI
and tests. Don't reuse the same id for two elements on one screen.

## Naming

- Files: `kebab-case` with role suffix — `*.component.ts`, `*.service.ts`, `*.routes.ts`,
  `*.model.ts`, `*.guard.ts`, `*.pipe.ts`.
- Selectors: `vc` prefix (`vc-identity-list`).
- One public symbol per file; the file name matches it.

## Sources

Conventions synthesized from:
- diegosouzapw "Angular Best Practices" omni-skill
- buildwithclaude "angular-developer" skill
- "Claude Code + Angular: The Setup That Changes Everything" (Angular_With_Awais)
