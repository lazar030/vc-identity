export type Capability =
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'roles.read';

export type UserStatus = 'active' | 'suspended' | 'invited';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  status: UserStatus;
}

export interface Role {
  id: string;
  name: string;
  capabilities: Capability[];
}

export interface CurrentUser extends User {
  capabilities: Capability[];
}

export interface LoginResponse {
  token: string;
}
