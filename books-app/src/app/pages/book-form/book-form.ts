import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
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
  loading = false;
  error = '';
  isEdit = false;
  id?: number;

  constructor(
    private books: BooksService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      this.isEdit = true;
      this.id = +param;
      this.loading = true;
      this.books.get(this.id).subscribe({
        next: b => this.model = {
          title: b.title, author: b.author, publishedDate: b.publishedDate ?? undefined
        },
        error: () => this.error = 'Failed to load book',
        complete: () => this.loading = false
      });
    }
  }

  save() {
    this.loading = true; this.error = '';
    const done = () => this.router.navigateByUrl('/books');
    if (this.isEdit && this.id) {
      this.books.update(this.id, this.model).subscribe({
        next: done, error: () => { this.error = 'Failed to save'; this.loading = false; },
        complete: () => this.loading = false
      });
    } else {
      this.books.create(this.model).subscribe({
        next: done, error: () => { this.error = 'Failed to save'; this.loading = false; },
        complete: () => this.loading = false
      });
    }
  }
}
