import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { DashboardSummary } from './dashboard.models';
import { DASHBOARD_MOCK } from './dashboard.mock';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  getSummary(): Observable<DashboardSummary> {
    return of(DASHBOARD_MOCK);
  }
}
