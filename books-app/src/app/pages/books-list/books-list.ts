import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BooksService, Book } from '../../core/books'; 
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/toast';


@Component({
  selector: 'app-books-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './books-list.html',
  styleUrl: './books-list.scss'
})
export class BooksListComponent {
  books: Book[] = [];
  loading = false;
  error = '';

  constructor(private api: BooksService, private toast: ToastService) {}

  ngOnInit() {
    this.loading = true;
    this.api.list().subscribe({
      next: res => this.books = res,
      error: () => { this.error = 'Failed to load books'; this.toast.error('Load failed'); },
      complete: () => this.loading = false
    });
  }

  private load() {
    this.loading = true; this.error = '';
    this.api.list().subscribe({
      next: res => this.books = res,
      error: () => { this.error = 'Failed to load books'; this.toast.error('Load failed'); },
      complete: () => this.loading = false
    });
  }

  remove(b: Book) {
    if (!confirm(`Delete "${b.title}"?`)) return;
    this.loading = true;
    this.api.remove(b.id).subscribe({
      next: () => {this.load(); this.toast.success('Book deleted'); },
      error: () => { this.loading = false; this.error = 'Failed to delete'; this.toast.error('Delete failed'); }
    });
  }

  trackById = (_: number, b: Book) => b.id;

}
