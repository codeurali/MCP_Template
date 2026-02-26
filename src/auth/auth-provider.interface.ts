export interface AuthProvider {
  getAccessToken(): Promise<string>;
  isAuthenticated(): boolean;
}