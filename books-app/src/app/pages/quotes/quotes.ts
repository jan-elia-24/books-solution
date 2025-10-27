import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quotes.html',
  styleUrl: './quotes.scss'
})
export class QuotesComponent {
  quotes = [
    'Simplicity is the soul of efficiency. — Austin Freeman',
    'Programs must be written for people to read. — Harold Abelson',
    'Premature optimization is the root of all evil. — Donald Knuth',
    'Talk is cheap. Show me the code. — Linus Torvalds',
    'First, solve the problem. Then, write the code. — John Johnson'
  ];
}
