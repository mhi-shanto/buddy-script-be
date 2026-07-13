import bcrypt from 'bcryptjs';
import { SALT_ROUNDS } from '../constants/auth.constant';

export const hashValue = (value: string): Promise<string> => bcrypt.hash(value, SALT_ROUNDS);

export const compareValue = (value: string, hashed: string): Promise<boolean> =>
  bcrypt.compare(value, hashed);
