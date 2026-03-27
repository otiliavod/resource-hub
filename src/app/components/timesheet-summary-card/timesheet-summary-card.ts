import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timesheet-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timesheet-summary-card.html',
  styleUrl: './timesheet-summary-card.scss',
})
export class TimesheetSummaryCardComponent {
  @Input() title = '';
  @Input() items: Array<{ day: string; hours: number; formattedHours: string }> = [];
}
