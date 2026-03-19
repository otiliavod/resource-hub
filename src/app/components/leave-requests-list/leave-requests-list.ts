import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeaveRequestItem } from '../../data/leave.models';

@Component({
  selector: 'app-leave-requests-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leave-requests-list.html',
  styleUrl: './leave-requests-list.scss',
})
export class LeaveRequestsListComponent {
  @Input() items: LeaveRequestItem[] = [];
  @Input() deletingId: string | null = null;

  @Output() deleteClicked = new EventEmitter<string>();

  getTypeLabel(type: LeaveRequestItem['type']) {
    switch (type) {
      case 'ANNUAL':
        return 'Annual Leave';
      case 'PERSONAL':
        return 'Personal Leave';
      case 'SICK':
        return 'Sick Leave';
      case 'UNPAID':
        return 'Unpaid Leave';
      default:
        return 'Leave';
    }
  }

  getDateLabel(item: LeaveRequestItem) {
    const start = this.formatShortDate(item.startDate);
    const end = this.formatShortDate(item.endDate);
    return start === end ? start : `${start}–${end}`;
  }

  canDelete(item: LeaveRequestItem) {
    return item.status === 'PENDING';
  }

  requestDelete(id: string) {
    this.deleteClicked.emit(id);
  }

  private formatShortDate(value: string) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  }
}
