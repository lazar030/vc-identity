import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanDirective } from '../../../shared/directives/can.directive';
import { StateViewComponent } from '../../../shared/components/state-view/state-view.component';
import {
  ConfirmDialogComponent, ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UsersTableComponent } from '../components/users-table/users-table.component';
import { UsersFacade } from '../services/users.facade';
import { User } from '../../../core/models/identity.models';

@Component({
  selector: 'vc-users-page',
  imports: [MatButtonModule, CanDirective, StateViewComponent, UsersTableComponent],
  providers: [UsersFacade],
  templateUrl: './users-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPageComponent implements OnInit {
  readonly facade = inject(UsersFacade);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.facade.load();
  }

  onEdit(user: User): void {
    // Edit flow comes in a later step.
    console.log('edit', user.id);
  }

  onSuspend(user: User): void {
    const name = `${user.firstName} ${user.lastName}`;
    this.facade.resetSuspend();

    const data: ConfirmDialogData = {
      title: `Suspend ${name}?`,
      message: 'They won’t be able to sign in until an administrator reactivates their account.',
      confirmLabel: 'Suspend',
      pendingLabel: 'Suspending…',
      testId: 'identity-suspend-dialog',
      state: this.facade.suspendState,
      confirm: () => this.facade.suspend(user),
    };

    this.dialog
      .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
        data,
        width: '28rem',
        maxWidth: 'calc(100vw - 2rem)',
      })
      .afterClosed()
      .subscribe((suspended) => {
        this.facade.resetSuspend();
        if (suspended) {
          this.snackBar.open(`${name} was suspended.`, 'Close', { duration: 5000 });
        }
      });
  }
}
