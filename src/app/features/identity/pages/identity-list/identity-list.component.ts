import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { IdentityService } from '../../services/identity.service';

@Component({
  selector: 'vc-identity-list',
  imports: [MatButtonModule],
  templateUrl: './identity-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdentityListComponent implements OnInit {
  private readonly identityService = inject(IdentityService);

  readonly identities = this.identityService.identities;
  readonly loading = this.identityService.loading;
  readonly error = this.identityService.error;

  ngOnInit(): void {
    this.identityService.load();
  }

  reload(): void {
    this.identityService.load();
  }
}
