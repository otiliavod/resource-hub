import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leave-balance-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leave-balance-card.html',
  styleUrl: './leave-balance-card.scss',
})
export class LeaveBalanceCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() hint = '';
  @Input() icon = '';
}
