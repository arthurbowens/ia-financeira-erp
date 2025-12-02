import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorService, ErrorMessage } from '../../services/error.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-error-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="error" 
         class="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="flex-1">
          <p class="font-medium">{{ error.message }}</p>
          <p *ngIf="error.code" class="text-xs text-red-600 mt-1">Código: {{ error.code }}</p>
        </div>
        <button 
          (click)="dismiss()"
          class="flex-shrink-0 text-red-600 hover:text-red-800 transition-colors">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  `
})
export class ErrorNotificationComponent implements OnInit, OnDestroy {
  error: ErrorMessage | null = null;
  private subscription?: Subscription;

  constructor(private errorService: ErrorService) {}

  ngOnInit() {
    this.subscription = this.errorService.error$.subscribe(error => {
      this.error = error;
      // Auto-dismiss após 5 segundos
      if (error) {
        setTimeout(() => this.dismiss(), 5000);
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  dismiss() {
    this.errorService.clearError();
  }
}

