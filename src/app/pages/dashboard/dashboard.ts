import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardService } from '../../data/dashboard.service';
import { DashboardSummary } from '../../data/dashboard.models';

import { StatCardComponent } from '../../components/stat-card/stat-card';
import { TimesheetSummaryCardComponent } from '../../components/timesheet-summary-card/timesheet-summary-card';
import { LeaveListCardComponent } from '../../components/leave-list-card/leave-list-card';
import {DashboardShellComponent} from '../../components/dashboard-shell/dashboard-shell';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    StatCardComponent,
    TimesheetSummaryCardComponent,
    LeaveListCardComponent,
    DashboardShellComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardPage {
  private dashboardService = inject(DashboardService);

  summary: DashboardSummary | null = null;

  ngOnInit() {
    this.dashboardService.getSummary().subscribe((summary) => {
      this.summary = summary;
    });
  }
}
