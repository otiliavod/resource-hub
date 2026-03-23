import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SelectModule } from 'primeng/select';

import { LeaveRequestItem, LeaveStatus } from '../../data/leave.models';

type LeaveFilter = 'ALL' | LeaveStatus;

@Component({
  selector: 'app-leave-requests-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './leave-requests-list.html',
  styleUrl: './leave-requests-list.scss',
})
export class LeaveRequestsListComponent {
  @Input() items: LeaveRequestItem[] = [];
  @Input() deletingId: string | null = null;
  @Input() activeFilter: LeaveFilter = 'ALL';

  @Output() deleteClicked = new EventEmitter<string>();
  @Output() editClicked = new EventEmitter<LeaveRequestItem>();
  @Output() filterChanged = new EventEmitter<LeaveFilter>();

  filters: Array<{ label: string; value: LeaveFilter }> = [
    { label: 'All requests', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  @Input() activeSort: 'ASC' | 'DESC' = 'ASC';
  @Output() sortChanged = new EventEmitter<'ASC' | 'DESC'>();

  sortOptions = [
    { label: 'Earliest first', value: 'ASC' },
    { label: 'Latest first', value: 'DESC' },
  ];

  onSortChange(value: 'ASC' | 'DESC') {
    this.sortChanged.emit(value);
  }

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

  requestDelete(id: string) {
    this.deleteClicked.emit(id);
  }

  requestEdit(item: LeaveRequestItem) {
    this.editClicked.emit(item);
  }

  onFilterChange(filter: LeaveFilter) {
    this.filterChanged.emit(filter);
  }

  private formatShortDate(value: string) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  }
}
