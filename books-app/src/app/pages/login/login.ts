import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {}

  login() {
    this.loading = true; this.error = '';
    this.http.post<{token:string}>(`${this.auth.apiBase}/api/auth/login`, {
      username: this.username, password: this.password
    }).subscribe({
      next: res => { this.auth.token = res.token; this.router.navigateByUrl('/books'); },
      error: () => this.error = 'Invalid username or password',
      complete: () => this.loading = false
    });
  }
}
