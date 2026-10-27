import { User } from '../../../core/models/identity.models';

export const USERS: User[] = [
  { id: '1', firstName: 'Ana', lastName: 'Admin', email: 'admin@vc.test', roleId: 'admin', status: 'active' },
  { id: '2', firstName: 'Marko', lastName: 'Manager', email: 'manager@vc.test', roleId: 'manager', status: 'active' },
  { id: '4', firstName: 'Luca', lastName: 'Rossi', email: 'luca.rossi@vc.test', roleId: 'agent', status: 'active' },
  { id: '5', firstName: 'Giulia', lastName: 'Bianchi', email: 'giulia.bianchi@vc.test', roleId: 'agent', status: 'suspended' },
  { id: '6', firstName: 'Stefan', lastName: 'Petrović', email: 'stefan.petrovic@vc.test', roleId: 'manager', status: 'invited' },
];

export const USER_WITH_LONG_CONTENT: User = {
  id: '99',
  firstName: 'Maria Francesca Alessandra',
  lastName: 'Della Rovere-Montefeltro',
  email: 'maria.francesca.alessandra.dellarovere-montefeltro@customer-service.example-company.it',
  roleId: 'agent',
  status: 'invited',
};
