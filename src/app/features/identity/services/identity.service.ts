import { Injectable, inject, signal } from '@angular/core';

import { ApiService } from '../../../core/services/api.service';
import { Identity } from '../models/identity.model';

/**
 * Feature-scoped store for the Identity feature. Provided at the feature route
 * (see identity.routes.ts), NOT in root, so its lifetime is tied to the feature.
 * State is exposed as read-only signals; components never mutate it directly.
 */
@Injectable()
export class IdentityService {
  private readonly api = inject(ApiService);

  private readonly _identities = signal<Identity[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly identities = this._identities.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.list<Identity>('identities').subscribe({
      next: (identities) => {
        this._identities.set(identities);
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Failed to load identities.');
        this._loading.set(false);
      },
    });
  }
}
