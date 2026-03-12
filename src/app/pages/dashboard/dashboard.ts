import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardService } from '../../data/dashboard.service';
import { DashboardSummary } from '../../data/dashboard.models';

import { StatCardComponent } from '../../components/stat-card/stat-card';
import { TimesheetSummaryCardComponent } from '../../components/timesheet-summary-card/timesheet-summary-card';
import { LeaveListCardComponent } from '../../components/leave-list-card/leave-list-card';
import { DashboardShellComponent } from '../../components/dashboard-shell/dashboard-shell';

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
export class DashboardPage implements OnInit {
  private dashboardService = inject(DashboardService);

  summary: DashboardSummary | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.isLoading = true;

    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load dashboard summary', error);
        this.summary = null;
        this.isLoading = false;
      },
    });
  }

  testLeave() {
    fetch('/api/leave/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('rh_access_token'),
      },
      body: JSON.stringify({
        type: 'ANNUAL',
        startDate: '2026-03-16',
        endDate: '2026-03-18',
        reason: 'Testing leave request',
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        console.log(data);
        this.loadSummary();
      })
      .catch((error) => console.error(error));
  }
}
