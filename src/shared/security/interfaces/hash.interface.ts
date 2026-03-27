export const HASH_SERVICE = 'HASH_SERVICE';

export interface IHashService {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
}
