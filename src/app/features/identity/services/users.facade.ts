import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, catchError, map, of, switchMap, tap } from 'rxjs';

import { UsersApi } from './users.api';
import { AuthStore } from '../../../core/services/auth.store';
import { User } from '../../../core/models/identity.models';
import { LoadState, toListViewState } from '../../../shared/services/load-state';

/** Provided per page (not root): its state lives and dies with the screen. */
@Injectable()
export class UsersFacade {
  private readonly api = inject(UsersApi);
  private readonly auth = inject(AuthStore);

  private readonly _state = signal<LoadState<User[]>>({ status: 'idle' });
  private readonly loadRequests = new Subject<void>();

  // ---- Read model: everything the page needs, nothing it can mutate ----
  readonly viewState = computed(() => toListViewState(this._state()));

  readonly users = computed(() => {
    const state = this._state();
    return state.status === 'loaded' ? state.data : [];
  });

  readonly errorMessage = computed(() => {
    const state = this._state();
    return state.status === 'error' ? state.message : null;
  });

  readonly canCreate = computed(() => this.auth.can('users.create'));
  readonly isReadOnly = computed(() => !this.auth.can('users.update'));

  constructor() {
    this.loadRequests
      .pipe(
        tap(() => this._state.set({ status: 'loading' })),
        // switchMap: a new load cancels an in-flight one (double-click on retry is safe)
        switchMap(() =>
          this.api.list().pipe(
            map((data): LoadState<User[]> => ({ status: 'loaded', data })),
            catchError((error: unknown) => of(this.toFailureState(error))),
          ),
        ),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((state) => this._state.set(state));
  }

  // ---- Commands ----
  load(): void {
    // UX shortcut: don't make a request we already know will be refused.
    // The server still enforces this; see the 403 handling below.
    if (!this.auth.can('users.read')) {
      this._state.set({ status: 'forbidden' });
      return;
    }
    this.loadRequests.next();
  }

  retry(): void {
    this.load();
  }

  private toFailureState(error: unknown): LoadState<User[]> {
    if (error instanceof HttpErrorResponse && error.status === 403) {
      return { status: 'forbidden' };
    }
    return {
      status: 'error',
      message: 'We could not load users. Check your connection and try again.',
    };
  }
}
