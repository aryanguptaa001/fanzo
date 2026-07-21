import type { User } from '@fanzo/database';
import type { Request } from 'express';

export type AuthenticatedRequest = Request & {
  user: User;
  clerkUserId: string;
};
