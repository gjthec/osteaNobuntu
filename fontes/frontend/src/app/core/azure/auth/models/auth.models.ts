export interface IAuthUser {
  UID: string;
  name: string;
  email: string;
  roles: string[];
  // outros dados do usuário
}

export interface IAuthResult {
  success: boolean;
  user?: IAuthUser;
  error?: string;
  token?: string;
}

export interface IAuthService {
  login(): Promise<IAuthResult>;
  logout(): Promise<void>;
  getUser(): IAuthUser | null;
  isAuthenticated(): boolean;
  getAccessToken(scopes?: string[]): Promise<string | null>;
}