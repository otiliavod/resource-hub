import { ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, forkJoin } from 'rxjs';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { DashboardShellComponent } from '../../components/dashboard-shell/dashboard-shell';
import { LeaveBalanceCardComponent } from '../../components/leave-balance-card/leave-balance-card';
import { LeaveRequestFormComponent } from '../../components/leave-request-form/leave-request-form';
import { LeaveRequestsListComponent } from '../../components/leave-requests-list/leave-requests-list';

import { LeaveService } from '../../data/leave.service';
import {
  CreateLeaveRequestPayload,
  LeaveBalance,
  LeaveRequestItem,
  LeaveStatus,
} from '../../data/leave.models';

type LeaveFilter = 'ALL' | LeaveStatus;

@Component({
  selector: 'app-leave-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ConfirmDialogModule,
    DashboardShellComponent,
    LeaveBalanceCardComponent,
    LeaveRequestFormComponent,
    LeaveRequestsListComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './leave.html',
  styleUrl: './leave.scss',
})
export class LeavePage implements OnInit {
  private leaveService = inject(LeaveService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  activeSort: 'ASC' | 'DESC' = 'ASC';

  @ViewChild(LeaveRequestFormComponent) leaveForm?: LeaveRequestFormComponent;

  balance: LeaveBalance | null = null;
  upcomingItems: LeaveRequestItem[] = [];
  deletingId: string | null = null;
  editingItem: LeaveRequestItem | null = null;

  activeFilter: LeaveFilter = 'ALL';

  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  loadError = '';

  ngOnInit(): void {
    this.loadData();
  }

  get filteredItems(): LeaveRequestItem[] {
    if (this.activeFilter === 'ALL') {
      return this.upcomingItems;
    }

    return this.upcomingItems.filter((item) => item.status === this.activeFilter);
  }

  setFilter(filter: LeaveFilter): void {
    this.activeFilter = filter;
    this.cdr.detectChanges();
  }

  get sortedItems(): LeaveRequestItem[] {
    const items = [...this.filteredItems];

    return items.sort((a, b) => {
      const aTime = new Date(a.startDate).getTime();
      const bTime = new Date(b.startDate).getTime();

      return this.activeSort === 'ASC'
        ? aTime - bTime
        : bTime - aTime;
    });
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

    const request$ = this.editingItem
      ? this.leaveService.updateRequest(this.editingItem.id, payload)
      : this.leaveService.createRequest(payload);

    request$
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (result: LeaveRequestItem) => {
          if (this.editingItem) {
            this.upcomingItems = this.upcomingItems.map((item) =>
              item.id === result.id ? result : item,
            );

            this.messageService.add({
              severity: 'success',
              summary: 'Request updated',
              detail: 'Your leave request was updated successfully.',
            });

            this.editingItem = null;
          } else {
            this.upcomingItems = [result, ...this.upcomingItems].sort(
              (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
            );

            this.messageService.add({
              severity: 'success',
              summary: 'Request submitted',
              detail: 'Your leave request was submitted successfully.',
            });

            this.activeFilter = 'ALL';
          }

          this.leaveForm?.resetForm();
          this.cdr.detectChanges();
        },
        error: (error) => {
          const message = error?.error?.message;
          this.errorMessage = Array.isArray(message)
            ? message.join(' ')
            : typeof message === 'string' && message.trim()
              ? message
              : this.editingItem
                ? 'Unable to update leave request right now.'
                : 'Unable to submit leave request right now.';

          this.messageService.add({
            severity: 'error',
            summary: this.editingItem ? 'Update failed' : 'Request failed',
            detail: this.errorMessage,
          });

          this.cdr.detectChanges();
        },
      });
  }

  onEdit(item: LeaveRequestItem): void {
    this.editingItem = item;
    this.errorMessage = '';
    this.leaveForm?.prefill(item);
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.editingItem = null;
    this.errorMessage = '';
    this.leaveForm?.resetForm();
    this.cdr.detectChanges();
  }

  deleteLeaveRequest(id: string): void {
    if (this.deletingId) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Delete leave request?',
      message: 'This will remove the pending leave request.',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
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

              if (this.editingItem?.id === id) {
                this.cancelEdit();
              }

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
      },
    });
  }
}
