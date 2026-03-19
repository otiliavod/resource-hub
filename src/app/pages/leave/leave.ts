import { ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, forkJoin } from 'rxjs';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { DashboardShellComponent } from '../../components/dashboard-shell/dashboard-shell';
import { LeaveBalanceCardComponent } from '../../components/leave-balance-card/leave-balance-card';
import { LeaveRequestFormComponent } from '../../components/leave-request-form/leave-request-form';
import { LeaveRequestsListComponent } from '../../components/leave-requests-list/leave-requests-list';

import { LeaveService } from '../../data/leave.service';
import { CreateLeaveRequestPayload, LeaveBalance, LeaveRequestItem } from '../../data/leave.models';

@Component({
  selector: 'app-leave-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    DashboardShellComponent,
    LeaveBalanceCardComponent,
    LeaveRequestFormComponent,
    LeaveRequestsListComponent,
  ],
  providers: [MessageService],
  templateUrl: './leave.html',
  styleUrl: './leave.scss',
})
export class LeavePage implements OnInit {
  private leaveService = inject(LeaveService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild(LeaveRequestFormComponent) leaveForm?: LeaveRequestFormComponent;

  balance: LeaveBalance | null = null;
  upcomingItems: LeaveRequestItem[] = [];
  deletingId: string | null = null;

  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  loadError = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.loadError = '';
    this.cdr.detectChanges();

    forkJoin({
      balance: this.leaveService.getBalance(),
      upcoming: this.leaveService.getUpcoming(),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: ({ balance, upcoming }) => {
          this.balance = balance;
          this.upcomingItems = upcoming.items;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to load leave data', error);
          this.loadError = 'Unable to load leave data right now.';
          this.cdr.detectChanges();
        },
      });
  }

  submitLeaveRequest(payload: CreateLeaveRequestPayload): void {
    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;
    this.cdr.detectChanges();

    this.leaveService
      .createRequest(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (created) => {
          this.upcomingItems = [created, ...this.upcomingItems].sort(
            (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
          );

          this.leaveForm?.resetForm();

          this.messageService.add({
            severity: 'success',
            summary: 'Request submitted',
            detail: 'Your leave request was submitted successfully.',
          });

          this.cdr.detectChanges();
        },
        error: (error) => {
          const message = error?.error?.message;
          this.errorMessage = Array.isArray(message)
            ? message.join(' ')
            : typeof message === 'string' && message.trim()
              ? message
              : 'Unable to submit leave request right now.';

          this.messageService.add({
            severity: 'error',
            summary: 'Request failed',
            detail: this.errorMessage,
          });

          this.cdr.detectChanges();
        },
      });
  }

  deleteLeaveRequest(id: string): void {
    const confirmed = window.confirm('Delete this leave request?');
    if (!confirmed || this.deletingId) {
      return;
    }

    this.deletingId = id;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.leaveService
      .deleteRequest(id)
      .pipe(
        finalize(() => {
          this.deletingId = null;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.upcomingItems = this.upcomingItems.filter((item) => item.id !== id);

          this.messageService.add({
            severity: 'success',
            summary: 'Request deleted',
            detail: 'Your leave request was deleted.',
          });

          this.cdr.detectChanges();
        },
        error: (error) => {
          const message = error?.error?.message;
          const detail = Array.isArray(message)
            ? message.join(' ')
            : typeof message === 'string' && message.trim()
              ? message
              : 'Unable to delete leave request right now.';

          this.messageService.add({
            severity: 'error',
            summary: 'Delete failed',
            detail,
          });

          this.cdr.detectChanges();
        },
      });
  }
}
