import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeaveItem } from '../../data/dashboard.models';

@Component({
  selector: 'app-leave-list-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leave-list-card.html',
  styleUrl: './leave-list-card.scss',
})
export class LeaveListCardComponent {
  @Input() title = '';
  @Input() items: LeaveItem[] = [];
}
