import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastKind = 'success' | 'error' | 'info';
export interface Toast { id: number; kind: ToastKind; text: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 1;
  private _toasts = new BehaviorSubject<Toast[]>([]);
  toasts$ = this._toasts.asObservable();

  show(text: string, kind: ToastKind = 'info', ms = 2500) {
    const t: Toast = { id: this.seq++, kind, text };
    const list = [...this._toasts.value, t];
    this._toasts.next(list);
    setTimeout(() => this.dismiss(t.id), ms);
  }
  success(text: string, ms = 2500) { this.show(text, 'success', ms); }
  error(text: string, ms = 3000) { this.show(text, 'error', ms); }
  dismiss(id: number) {
    this._toasts.next(this._toasts.value.filter(t => t.id !== id));
  }
}