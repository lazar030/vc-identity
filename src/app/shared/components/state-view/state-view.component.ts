import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type StateViewKind = 'loading' | 'empty' | 'error' | 'forbidden';

const DEFAULT_COPY: Record<StateViewKind, { title: string; description: string }> = {
  loading: { title: 'Loading…', description: '' },
  empty: { title: 'Nothing here yet', description: '' },
  error: { title: 'Something went wrong', description: 'Please try again.' },
  forbidden: {
    title: 'You don’t have access',
    description: 'Ask an administrator if you need access.',
  },
};

@Component({
  selector: 'vc-state-view',
  imports: [MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './state-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StateViewComponent {
  readonly kind = input.required<StateViewKind>();
  /** Prefix for data-testids, e.g. "identity-users" -> "identity-users-error". */
  readonly testId = input.required<string>();
  readonly title = input<string>();
  readonly description = input<string>();
  readonly retryLabel = input('Try again');

  readonly retry = output<void>();

  readonly resolvedTitle = computed(() => this.title() ?? DEFAULT_COPY[this.kind()].title);
  readonly resolvedDescription = computed(
    () => this.description() ?? DEFAULT_COPY[this.kind()].description,
  );

  /** Screen readers: loading is announced politely, errors immediately. */
  readonly role = computed(() => {
    switch (this.kind()) {
      case 'loading': return 'status';
      case 'error': return 'alert';
      default: return null;
    }
  });
}
