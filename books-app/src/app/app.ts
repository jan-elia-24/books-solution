import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar';
import { ToastsComponent } from './shared/toasts/toasts';


@Component({
  selector: 'app-root',
  standalone: true,              
  imports: [RouterOutlet, NavbarComponent, ToastsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('books-app');
}
