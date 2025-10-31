import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';

export interface Book { id: number; title: string; author: string; publishedDate?: string; }
export interface BookCreate { title: string; author: string; publishedDate?: string | null; }

@Injectable({ providedIn: 'root' })
export class BooksService {
  constructor(private http: HttpClient, private auth: AuthService) {}
  private get base() { return `${this.auth.apiBase}/api/books`; }

  list() { return this.http.get<Book[]>(this.base); }
  get(id: number) { return this.http.get<Book>(`${this.base}/${id}`); }
  create(dto: BookCreate) { return this.http.post<Book>(this.base, dto); }
  update(id: number, dto: BookCreate) { return this.http.put<Book>(`${this.base}/${id}`, dto); }
  remove(id: number) { return this.http.delete(`${this.base}/${id}`); }
}
