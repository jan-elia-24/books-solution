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

  // edit-state
  editingId: number | null = null;
  editText = '';

  constructor(private api: QuotesService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true; this.error = '';
    this.api.list().subscribe({
      next: res => this.quotes = res,
      error: () => this.error = 'Failed to load quotes',
      complete: () => this.loading = false
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

  startEdit(q: Quote) {
    this.editingId = q.id;
    this.editText = q.text;
  }
  cancelEdit() {
    this.editingId = null;
    this.editText = '';
  }
  saveEdit(q: Quote) {
    const text = (this.editText || '').trim();
    if (!text) return;
    this.loading = true; this.error = '';
    this.api.update(q.id, text).subscribe({
      next: () => { this.editingId = null; this.editText = ''; this.load(); },
      error: () => { this.error = 'Failed to update quote'; this.loading = false; }
    });
  }
  delete(q: Quote) {
    if (!confirm('Delete this quote?')) return;
    this.loading = true; this.error = '';
    this.api.remove(q.id).subscribe({
      next: () => this.load(),
      error: () => { this.error = 'Failed to delete quote'; this.loading = false; }
    });
  }

  trackById = (_: number, q: Quote) => q.id;
}
