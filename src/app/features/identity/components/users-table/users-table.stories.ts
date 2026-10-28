import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { UsersTableComponent } from './users-table.component';
import { USERS, USER_WITH_LONG_CONTENT } from '../../testing/user.fixtures';

const meta: Meta<UsersTableComponent> = {
  title: 'Identity/UsersTable',
  component: UsersTableComponent,
  tags: ['autodocs'],
  args: {
    users: USERS,
    readOnly: false,
    suspendableIds: new Set<string>(),
    edit: fn(),
    suspend: fn(),
  },
  argTypes: {
    suspendableIds: { control: false }, // a Set can't be edited in the Controls panel
  },
};
export default meta;

type Story = StoryObj<UsersTableComponent>;

export const Editable: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Ana Admin' }));
    await expect(args.edit).toHaveBeenCalledWith(USERS[0]);
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByRole('button', { name: /^(Edit|Suspend)/ })).toHaveLength(0);
  },
};

export const WithSuspendActions: Story = {
  // Marko (2) and Luca (4) are suspendable; the facade decides that, the table just renders it.
  args: { suspendableIds: new Set(['2', '4']) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('button', { name: /^Suspend/ })).toHaveLength(2);

    await userEvent.click(canvas.getByRole('button', { name: 'Suspend Luca Rossi' }));
    await expect(args.suspend).toHaveBeenCalledWith(USERS[2]);
  },
};

export const SingleUser: Story = {
  args: { users: [USERS[0]] },
};

export const AllStatuses: Story = {
  args: { users: USERS.filter((u, i, all) => all.findIndex((x) => x.status === u.status) === i) },
};

export const LongContent: Story = {
  args: { users: [USER_WITH_LONG_CONTENT, ...USERS.slice(0, 2)] },
};

export const NarrowViewport: Story = {
  args: { users: [USER_WITH_LONG_CONTENT, ...USERS] },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
