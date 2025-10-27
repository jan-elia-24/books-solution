import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BooksService, Book } from '../../core/books';
import { RouterLink } from '@angular/router';

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

  constructor(private api: BooksService) {}

  ngOnInit() {
    this.loading = true;
    this.api.list().subscribe({
      next: res => this.books = res,
      error: () => this.error = 'Failed to load books',
      complete: () => this.loading = false
    });
  }
}
