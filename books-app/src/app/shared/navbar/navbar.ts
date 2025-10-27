import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  ngOnInit() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', saved);
  }
  toggleTheme() {
    const root = document.documentElement;
    const curr = root.getAttribute('data-bs-theme') || 'light';
    const next = curr === 'light' ? 'dark' : 'light';
    root.setAttribute('data-bs-theme', next);
    localStorage.setItem('theme', next);
  }
}
