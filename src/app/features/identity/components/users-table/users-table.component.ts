import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { User, UserStatus } from '../../../../core/models/identity.models';

const STATUS_CLASSES: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800',
  invited: 'bg-blue-100 text-blue-800',
  suspended: 'bg-gray-200 text-gray-800',
};

@Component({
  selector: 'vc-users-table',
  imports: [MatTableModule, MatButtonModule],
  templateUrl: './users-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersTableComponent {
  readonly users = input.required<User[]>();
  readonly readOnly = input(false);
  /** Ids of rows that get a Suspend action. Decided by the facade, not here. */
  readonly suspendableIds = input<ReadonlySet<string>>(new Set());

  readonly edit = output<User>();
  readonly suspend = output<User>();

  readonly columns = computed(() =>
    this.readOnly()
      ? ['name', 'email', 'role', 'status']
      : ['name', 'email', 'role', 'status', 'actions'],
  );

  statusClass(status: UserStatus): string {
    return STATUS_CLASSES[status];
  }
}
