import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuotesService, Quote } from '../../core/quotes';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quotes.html',
  styleUrl: './quotes.scss'
})
export class QuotesComponent {
  quotes: Quote[] = [];
  loading = false;
  error = '';
  newText = '';

  constructor(private api: QuotesService) {}
  trackById = (_: number, q: Quote) => q.id;


  ngOnInit() { this.load(); }

  load() {
    this.loading = true; this.error = '';
    this.api.list().subscribe({
      next: res => this.quotes = res,
      error: () => { this.error = 'Failed to load quotes'; },
      complete: () => { this.loading = false; }
    });
  }

  add() {
    const text = (this.newText || '').trim();
    if (!text) return;
    this.loading = true; this.error = '';
    this.api.create(text).subscribe({
      next: () => { this.newText = ''; this.load(); },
      error: () => { this.error = 'Failed to add quote'; this.loading = false; }
    });
  }
}
