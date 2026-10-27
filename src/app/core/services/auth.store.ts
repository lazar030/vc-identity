import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApi } from './auth.api';
import { Capability, CurrentUser } from '../models/identity.models';

const TOKEN_KEY = 'vc.token';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  private readonly _user = signal<CurrentUser | null>(null);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  private readonly capabilities = computed(
    () => new Set<Capability>(this._user()?.capabilities ?? []),
  );

  /** Reactive: reading this inside a computed/effect/template re-runs when the user changes. */
  can(capability: Capability): boolean {
    return this.capabilities().has(capability);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Called once at app startup: if a token exists, load the user behind it. */
  async restoreSession(): Promise<void> {
    if (!this.getToken()) return;
    try {
      this._user.set(await firstValueFrom(this.api.me()));
    } catch {
      this.clear();
    }
  }

  async login(email: string, password: string): Promise<void> {
    const { token } = await firstValueFrom(this.api.login(email, password));
    localStorage.setItem(TOKEN_KEY, token);
    this._user.set(await firstValueFrom(this.api.me()));
  }

  logout(): void {
    this.clear();
    void this.router.navigateByUrl('/login');
  }

  private clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._user.set(null);
  }
}
