import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { CreateLeaveRequestPayload, LeaveRequestItem, LeaveType } from '../../data/leave.models';

@Component({
  selector: 'app-leave-request-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './leave-request-form.html',
  styleUrl: './leave-request-form.scss',
})
export class LeaveRequestFormComponent {
  @ViewChild('leaveRequestNgForm') leaveRequestNgForm?: NgForm;

  @Input() isSubmitting = false;
  @Input() errorMessage = '';
  @Input() submitLabel = 'Submit Request';

  @Output() submitted = new EventEmitter<CreateLeaveRequestPayload>();

  type: LeaveType = 'ANNUAL';
  startDate = '';
  endDate = '';
  reason = '';
  touched = false;

  leaveTypeOptions = [
    { label: 'Annual Leave', value: 'ANNUAL' },
    { label: 'Personal Leave', value: 'PERSONAL' },
    { label: 'Sick Leave', value: 'SICK' },
    { label: 'Unpaid Leave', value: 'UNPAID' },
  ];

  get hasInvalidDateRange(): boolean {
    if (!this.startDate || !this.endDate) {
      return false;
    }

    return new Date(this.endDate).getTime() < new Date(this.startDate).getTime();
  }

  submit() {
    this.touched = true;

    if (this.isSubmitting || !this.startDate || !this.endDate || this.hasInvalidDateRange) {
      return;
    }

    this.submitted.emit({
      type: this.type,
      startDate: this.startDate,
      endDate: this.endDate,
      reason: this.reason.trim() || undefined,
    });
  }

  prefill(item: LeaveRequestItem) {
    this.type = item.type;
    this.startDate = item.startDate.slice(0, 10);
    this.endDate = item.endDate.slice(0, 10);
    this.reason = item.reason || '';
    this.touched = false;
  }

  resetForm() {
    this.leaveRequestNgForm?.resetForm({
      type: 'ANNUAL',
      startDate: '',
      endDate: '',
      reason: '',
    });

    this.type = 'ANNUAL';
    this.startDate = '';
    this.endDate = '';
    this.reason = '';
    this.touched = false;
  }
}
