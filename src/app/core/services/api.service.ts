import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

/**
 * Thin, typed wrapper around HttpClient scoped to the configured API base URL.
 * Feature services depend on this instead of injecting HttpClient directly, so
 * the base URL and transport concerns live in one place.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  list<T>(resource: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${resource}`);
  }

  get<T>(resource: string, id: string | number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${resource}/${id}`);
  }

  create<T>(resource: string, payload: Partial<T>): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${resource}`, payload);
  }

  update<T>(resource: string, id: string | number, payload: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${resource}/${id}`, payload);
  }

  remove(resource: string, id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${resource}/${id}`);
  }
}
