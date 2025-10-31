import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';
import { Observable } from 'rxjs';

export interface Quote {
  id: number;
  text: string;
  owner: string;
}

export interface QuoteCreate {
  text: string;
}

@Injectable({ providedIn: 'root' })
export class QuotesService {
  constructor(private http: HttpClient, private auth: AuthService) {}
  private get base() {
    return `${this.auth.apiBase}/api/quotes`;
  }

  list(): Observable<Quote[]> {
    return this.http.get<Quote[]>(this.base);
  }
  create(text: string): Observable<Quote> {
    return this.http.post<Quote>(this.base, { text } as QuoteCreate);
  }
  
  // (update, delete)
  update(id: number, text: string): Observable<Quote> {
    return this.http.put<Quote>(`${this.base}/${id}`, { text } as QuoteCreate);
  }
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
