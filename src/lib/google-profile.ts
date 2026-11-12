import type { User } from 'firebase/auth';
import type { Level } from './cma';

export function googleStudentProfile(user: Pick<User, 'displayName' | 'email'>, level: Level) {
  if (!user.email) throw new Error('Your Google account must have an email address.');
  return { name: user.displayName?.trim().slice(0, 80) || 'CMA Student', email: user.email, role: 'student' as const, level };
}
