import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { CreateLeaveRequestPayload, LeaveType } from '../../data/leave.models';

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

  @Output() submitted = new EventEmitter<CreateLeaveRequestPayload>();

  type: LeaveType = 'ANNUAL';
  startDate = '';
  endDate = '';
  reason = '';

  leaveTypeOptions = [
    { label: 'Annual Leave', value: 'ANNUAL' },
    { label: 'Personal Leave', value: 'PERSONAL' },
    { label: 'Sick Leave', value: 'SICK' },
    { label: 'Unpaid Leave', value: 'UNPAID' },
  ];

  submit() {
    if (this.isSubmitting || !this.startDate || !this.endDate) {
      return;
    }

    this.submitted.emit({
      type: this.type,
      startDate: this.startDate,
      endDate: this.endDate,
      reason: this.reason.trim() || undefined,
    });
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
  }
}
