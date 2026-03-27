import { type JwtPayload } from 'src/modules/auth/types/jwt-payload.type';

export const APP_JWT_SERVICE = 'APP_JWT_SERVICE';

export interface IAppJwtService {
  signAccessToken(payload: JwtPayload): Promise<string>;
  // signRefreshToken(payload: JwtPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<JwtPayload>;
  // verifyRefreshToken(token: string): Promise<JwtPayload>;
  // getAccessTtlSeconds(): number;
}
