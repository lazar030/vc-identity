import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, catchError, map, of, switchMap, tap } from 'rxjs';

import { UsersApi } from './users.api';
import { AuthStore } from '../../../core/services/auth.store';
import { User } from '../../../core/models/identity.models';
import { LoadState, toListViewState } from '../../../shared/services/load-state';
import { MutationState } from '../../../shared/services/mutation-state';

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

  private readonly _suspendState = signal<MutationState>({ status: 'idle' });
  readonly suspendState = this._suspendState.asReadonly();

  /** Users the current user may suspend right now. The server must re-check all of this. */
  readonly suspendableIds = computed<ReadonlySet<string>>(() => {
    if (!this.auth.can('users.update')) return new Set();
    const selfId = this.auth.user()?.id;
    return new Set(
      this.users()
        .filter((user) => user.status === 'active' && user.id !== selfId)
        .map((user) => user.id),
    );
  });

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

  suspend(user: User): void {
    if (!this.suspendableIds().has(user.id)) return;
    if (this._suspendState().status === 'pending') return; // ignore double clicks

    this._suspendState.set({ status: 'pending' });
    this.api.update(user.id, { status: 'suspended' }).subscribe({
      next: (updated) => {
        this.replaceUser(updated);
        this._suspendState.set({ status: 'success' });
      },
      error: (error: unknown) => this._suspendState.set(this.toMutationError(error)),
    });
  }

  resetSuspend(): void {
    this._suspendState.set({ status: 'idle' });
  }

  /** Update one row in place: no list reload, no loading flash. */
  private replaceUser(updated: User): void {
    this._state.update((state) =>
      state.status === 'loaded'
        ? { ...state, data: state.data.map((u) => (u.id === updated.id ? updated : u)) }
        : state,
    );
  }

  private toMutationError(error: unknown): MutationState {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 403) {
        return { status: 'error', message: 'You no longer have permission to suspend users.' };
      }
      if (error.status === 409 && typeof error.error?.message === 'string') {
        return { status: 'error', message: error.error.message };
      }
    }
    return { status: 'error', message: 'The user could not be suspended. Please try again.' };
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
