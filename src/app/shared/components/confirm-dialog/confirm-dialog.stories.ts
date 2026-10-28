import { signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';
import { MutationState } from '../../services/mutation-state';

/**
 * In the app the dialog lives inside MatDialog. Here it is rendered directly,
 * so each story provides the two things it injects: its data and a stub dialogRef.
 */
function setup(state: MutationState) {
  const data: ConfirmDialogData = {
    title: 'Suspend Luca Rossi?',
    message: 'They won’t be able to sign in until an administrator reactivates their account.',
    confirmLabel: 'Suspend',
    pendingLabel: 'Suspending…',
    testId: 'story-dialog',
    state: signal(state),
    confirm: fn(),
  };
  const dialogRef = { close: fn(), disableClose: false };

  return {
    data,
    dialogRef,
    decorators: [
      moduleMetadata({
        providers: [
          { provide: MAT_DIALOG_DATA, useValue: data },
          { provide: MatDialogRef, useValue: dialogRef },
        ],
      }),
    ],
  };
}

const meta: Meta<ConfirmDialogComponent> = {
  title: 'Shared/ConfirmDialog',
  component: ConfirmDialogComponent,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<ConfirmDialogComponent>;

const idle = setup({ status: 'idle' });
export const Idle: Story = {
  decorators: idle.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Suspend' }));
    await expect(idle.data.confirm).toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(idle.dialogRef.close).toHaveBeenCalledWith(false);
  },
};

const pending = setup({ status: 'pending' });
export const Pending: Story = {
  decorators: pending.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Suspending…' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await expect(pending.dialogRef.disableClose).toBe(true);
  },
};

const failed = setup({
  status: 'error',
  message: 'The user could not be suspended. Please try again.',
});
export const ErrorWithRetry: Story = {
  decorators: failed.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent('could not be suspended');
    await expect(canvas.getByRole('button', { name: 'Suspend' })).toBeEnabled();
  },
};

const succeeded = setup({ status: 'success' });
export const ClosesOnSuccess: Story = {
  decorators: succeeded.decorators,
  play: async () => {
    await expect(succeeded.dialogRef.close).toHaveBeenCalledWith(true);
  },
};

const longCopy = setup({
  status: 'error',
  message:
    'The account is linked to 3 active queues and 2 scheduled campaigns. Reassign them before ' +
    'suspending this user, or contact support if you need help.',
});
export const LongCopy: Story = {
  decorators: longCopy.decorators,
};
