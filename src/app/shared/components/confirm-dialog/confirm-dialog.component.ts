import {
  ChangeDetectionStrategy, Component, Signal, computed, effect, inject,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MutationState } from '../../services/mutation-state';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel: string;
  pendingLabel: string;
  /** Prefix for data-testids, e.g. "identity-suspend-dialog". */
  testId: string;
  /** Live state of the action. The dialog renders it and closes itself on success. */
  state: Signal<MutationState>;
  confirm: () => void;
}

@Component({
  selector: 'vc-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<ConfirmDialogComponent, boolean>>(MatDialogRef);

  readonly pending = computed(() => this.data.state().status === 'pending');
  readonly errorMessage = computed(() => {
    const state = this.data.state();
    return state.status === 'error' ? state.message : null;
  });

  constructor() {
    effect(() => {
      // Escape and backdrop clicks must not close the dialog mid-request.
      this.dialogRef.disableClose = this.pending();
      if (this.data.state().status === 'success') {
        this.dialogRef.close(true);
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
