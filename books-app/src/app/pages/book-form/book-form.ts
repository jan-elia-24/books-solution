import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BooksService, BookCreate } from '../../core/books';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './book-form.html',
  styleUrl: './book-form.scss'
})
export class BookFormComponent {
  model: BookCreate = { title: '', author: '', publishedDate: undefined };
  loading = false; error = '';

  constructor(private books: BooksService, private router: Router) {}

  save() {
    this.loading = true; this.error = '';
    this.books.create(this.model).subscribe({
      next: () => this.router.navigateByUrl('/books'),
      error: () => { this.error = 'Failed to save book'; this.loading = false; },
      complete: () => this.loading = false
    });
  }
}
