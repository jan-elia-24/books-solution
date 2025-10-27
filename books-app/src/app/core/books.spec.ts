import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { BooksService } from './books';
import { AuthService } from './auth';

class MockAuthService { apiBase = 'http://localhost:5000'; }

describe('BooksService', () => {
  let service: BooksService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: AuthService, useClass: MockAuthService },
        BooksService,
      ],
    });
    service = TestBed.inject(BooksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
