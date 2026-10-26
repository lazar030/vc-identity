export type IdentityStatus = 'active' | 'pending' | 'revoked';

export interface Identity {
  id: string;
  name: string;
  email: string;
  /** Decentralized identifier. */
  did: string;
  status: IdentityStatus;
  createdAt: string;
}
