export type UserRole = 'ADMIN' | 'CLIENT';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  token?: string;
}
