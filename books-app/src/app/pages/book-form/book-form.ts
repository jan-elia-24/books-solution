import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { BooksService, BookCreate } from '../../core/books';
import { ToastService } from '../../core/toast';

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
    private route: ActivatedRoute,
    private toast: ToastService
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
        error: () => { this.error = 'Failed to load book'; this.toast.error('Load failed'); },
        complete: () => this.loading = false
      });
    }
  }

  save() {
  this.error = '';
  const title = (this.model.title || '').trim();
  const author = (this.model.author || '').trim();
  if (!title || !author) {
    this.toast.error('Title and author are required');
    return;
  }

  const payload = {
    title,
    author,
    publishedDate: this.model.publishedDate || null
  };

  this.loading = true;
  const done = () => { this.loading = false; this.router.navigateByUrl('/books'); };
  const fail = () => { this.loading = false; this.toast.error('Save failed'); };

  if (this.isEdit && this.id) {
    this.books.update(this.id, payload).subscribe({
      next: () => { this.toast.success('Book updated'); done(); },
      error: () => { this.error = 'Failed to save'; fail(); }
    });
  } else {
    this.books.create(payload).subscribe({
      next: () => { this.toast.success('Book created'); done(); },
      error: () => { this.error = 'Failed to save'; fail(); }
    });
  }
}
}
