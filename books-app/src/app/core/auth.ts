import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiBase = environment.apiBase;
  private key = 'token';
  
  constructor(private http: HttpClient) {}  

  get token() { return localStorage.getItem(this.key); }
  set token(v: string | null) { v ? localStorage.setItem(this.key, v) : localStorage.removeItem(this.key); }
  isLoggedIn() { return !!this.token; }
  logout() { this.token = null; }

  register(username: string, password: string) {
    return this.http.post<{ token: string, username: string }>(
      `${this.apiBase}/api/auth/register`,
      { username, password }
    ).pipe(tap(res => {
      localStorage.setItem(this.key, res.token);
    }));
  }
}