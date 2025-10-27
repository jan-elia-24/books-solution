import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  apiBase = 'http://localhost:5000';   
  private key = 'token';

  get token(): string | null {
    return localStorage.getItem(this.key);
  }
  set token(v: string | null) {
    if (v) localStorage.setItem(this.key, v);
    else localStorage.removeItem(this.key);
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }
  logout() {
    this.token = null;
  }
}
