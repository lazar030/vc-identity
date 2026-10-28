/**
 * The lifecycle of a single change (create, update, delete).
 * Separate from LoadState: a mutation has no data to show and no "forbidden page".
 */
export type MutationState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'success' }
  | { status: 'error'; message: string };
