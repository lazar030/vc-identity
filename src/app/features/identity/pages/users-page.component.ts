import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CanDirective } from '../../../shared/directives/can.directive';

@Component({
  selector: 'vc-users-page',
  imports: [MatButtonModule, CanDirective],
  template: `
    <h2 class="text-xl font-semibold mb-4">Users</h2>

    <button *vcCan="'users.create'; else readOnly" mat-flat-button
            data-testid="identity-users-create-button">
      Create user
    </button>

    <ng-template #readOnly>
      <p data-testid="identity-users-readonly-note">You can view users but not change them.</p>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPageComponent {}
