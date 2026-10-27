/**
 * The lifecycle of any remote data. One value, never contradictory flags.
 */
export type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; data: T }
  | { status: 'error'; message: string }
  | { status: 'forbidden' };

/** What a list screen renders. "empty" is derived, not stored. */
export type ListViewState = 'loading' | 'loaded' | 'empty' | 'error' | 'forbidden';

export function toListViewState<T>(state: LoadState<T[]>): ListViewState {
  switch (state.status) {
    case 'idle':
    case 'loading':
      return 'loading';
    case 'loaded':
      return state.data.length > 0 ? 'loaded' : 'empty';
    default:
      return state.status;
  }
}
