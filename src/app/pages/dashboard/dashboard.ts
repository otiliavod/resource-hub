import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  summary: DashboardSummary | null = null;
  isLoading = true;
  loadError = '';

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.isLoading = true;
    this.loadError = '';
    this.summary = null;
    this.cdr.detectChanges();

    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        console.log('dashboard summary', summary);
        this.summary = summary;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load dashboard summary', error);
        this.summary = null;
        this.loadError = 'Unable to load dashboard data.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
