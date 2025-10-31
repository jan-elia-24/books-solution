import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../core/toast';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toasts.html',
  styleUrl: './toasts.scss'
})

export class ToastsComponent {
  toasts$; 

  constructor(private toast: ToastService) {
    this.toasts$ = this.toast.toasts$; 
  }
  dismiss(id: number) { this.toast.dismiss(id); }
  css(t: Toast) {
    return {
      'bg-success text-white': t.kind === 'success',
      'bg-danger text-white': t.kind === 'error',
      'bg-secondary text-white': t.kind === 'info'
    };
  }
}
