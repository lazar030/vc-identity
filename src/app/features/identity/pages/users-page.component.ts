import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CanDirective } from '../../../shared/directives/can.directive';
import { StateViewComponent } from '../../../shared/components/state-view/state-view.component';
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

  ngOnInit(): void {
    this.facade.load();
  }

  onEdit(user: User): void {
    // Edit flow comes in a later step.
    console.log('edit', user.id);
  }
}
