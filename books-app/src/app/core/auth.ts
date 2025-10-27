import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiBase = environment.apiBase;
  private key = 'token';
  get token() { return localStorage.getItem(this.key); }
  set token(v: string | null) { v ? localStorage.setItem(this.key, v) : localStorage.removeItem(this.key); }
  isLoggedIn() { return !!this.token; }
  logout() { this.token = null; }
}

