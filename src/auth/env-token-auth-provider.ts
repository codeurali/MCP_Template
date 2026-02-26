import type { AuthProvider } from "./auth-provider.interface.js";

export class EnvTokenAuthProvider implements AuthProvider {
  private readonly token: string;

  public constructor(token: string) {
    this.token = token;
  }

  public async getAccessToken(): Promise<string> {
    return this.token;
  }

  public isAuthenticated(): boolean {
    return this.token.length > 0;
  }
}