import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CanDirective } from '../../../shared/directives/can.directive';
import { UsersFacade } from '../services/users.facade';

@Component({
  selector: 'vc-users-page',
  imports: [MatButtonModule, MatProgressSpinnerModule, CanDirective],
  providers: [UsersFacade],
  templateUrl: './users-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPageComponent implements OnInit {
  readonly facade = inject(UsersFacade);

  ngOnInit(): void {
    this.facade.load();
  }
}
