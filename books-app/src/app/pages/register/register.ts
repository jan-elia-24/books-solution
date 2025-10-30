import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  model = { username: '', password: '', confirm: '' };
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = '';
    if (!this.model.username || !this.model.password) {
      this.error = 'Username and password are required';
      return;
    }
    if (this.model.password !== this.model.confirm) {
      this.error = 'Passwords do not match';
      return;
    }
    this.loading = true;
    this.auth.register(this.model.username, this.model.password).subscribe({
      next: () => this.router.navigateByUrl('/books'),
      error: (e) => { this.error = 'Registration failed'; this.loading = false; }
    });
  }
}
