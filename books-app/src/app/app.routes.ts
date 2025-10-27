import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { BooksListComponent } from './pages/books-list/books-list';
import { BookFormComponent } from './pages/book-form/book-form';
import { QuotesComponent } from './pages/quotes/quotes';
import { authGuard } from './core/auth-guard';
import { NotFoundComponent } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'books', component: BooksListComponent, canActivate: [authGuard] },
  { path: 'books/new', component: BookFormComponent, canActivate: [authGuard] },
  { path: 'books/:id/edit', component: BookFormComponent, canActivate: [authGuard] },
  { path: 'quotes', component: QuotesComponent },
  { path: '', pathMatch: 'full', redirectTo: 'books' },
  { path: '**', redirectTo: 'books' },
  { path: '**', component: NotFoundComponent },
];
