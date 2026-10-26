import {
  Directive, TemplateRef, ViewContainerRef,
  computed, effect, inject, input,
} from '@angular/core';
import { AuthStore } from '../../core/auth/auth.store';
import { Capability } from '../../core/models/identity.models';

/**
 * Renders its content only if the current user has the capability (or all of them).
 * Usage:
 *   <button *vcCan="'users.create'">Create</button>
 *   <button *vcCan="'users.update'; else readOnly">Edit</button>
 */
@Directive({ selector: '[vcCan]' })
export class CanDirective {
  private readonly auth = inject(AuthStore);
  private readonly template = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  readonly vcCan = input.required<Capability | Capability[]>();
  readonly vcCanElse = input<TemplateRef<unknown> | null>(null);

  private readonly allowed = computed(() => {
    const required = this.vcCan();
    const list = Array.isArray(required) ? required : [required];
    return list.every((capability) => this.auth.can(capability));
  });

  constructor() {
    effect(() => {
      this.viewContainer.clear();
      if (this.allowed()) {
        this.viewContainer.createEmbeddedView(this.template);
      } else {
        const elseTemplate = this.vcCanElse();
        if (elseTemplate) this.viewContainer.createEmbeddedView(elseTemplate);
      }
    });
  }
}
