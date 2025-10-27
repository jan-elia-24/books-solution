import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { BooksListComponent } from './pages/books-list/books-list';
import { BookFormComponent } from './pages/book-form/book-form';
import { QuotesComponent } from './pages/quotes/quotes';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'books', component: BooksListComponent },
  { path: 'books/new', component: BookFormComponent },
  { path: 'books/:id/edit', component: BookFormComponent },
  { path: 'quotes', component: QuotesComponent },
  { path: '', pathMatch: 'full', redirectTo: 'books' },
  { path: '**', redirectTo: 'books' },
];
