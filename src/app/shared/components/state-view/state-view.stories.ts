import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { StateViewComponent } from './state-view.component';

const meta: Meta<StateViewComponent> = {
  title: 'Shared/StateView',
  component: StateViewComponent,
  tags: ['autodocs'],
  args: {
    testId: 'story',
    retry: fn(),
  },
  argTypes: {
    kind: { control: 'select', options: ['loading', 'empty', 'error', 'forbidden'] },
  },
};
export default meta;

type Story = StoryObj<StateViewComponent>;

export const Loading: Story = {
  args: { kind: 'loading', title: 'Loading users…' },
};

export const Empty: Story = {
  args: {
    kind: 'empty',
    title: 'No users yet',
    description: 'Users you invite will appear here.',
  },
};

export const ErrorWithRetry: Story = {
  args: {
    kind: 'error',
    description: 'We could not load users. Check your connection and try again.',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
    await expect(args.retry).toHaveBeenCalledTimes(1);
  },
};

export const Forbidden: Story = {
  args: { kind: 'forbidden', title: 'You don’t have access to users' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Retrying won't change a permission, so there must be no retry button.
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

export const LongCopy: Story = {
  args: {
    kind: 'error',
    title: 'The synchronisation with the external telephony provider failed unexpectedly',
    description:
      'The provider returned an error while we were importing your contact center configuration. ' +
      'No changes were saved. You can try again now, or contact support if this keeps happening.',
  },
};
