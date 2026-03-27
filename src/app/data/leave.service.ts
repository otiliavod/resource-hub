import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CreateLeaveRequestPayload,
  LeaveBalance,
  LeaveRequestItem,
  LeaveUpcomingResponse,
} from './leave.models';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  constructor(private http: HttpClient) {}

  getBalance(): Observable<LeaveBalance> {
    return this.http.get<LeaveBalance>('/api/leave/balance', {
      withCredentials: true,
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });
  }

  getUpcoming(): Observable<LeaveUpcomingResponse> {
    return this.http.get<LeaveUpcomingResponse>('/api/leave/upcoming', {
      withCredentials: true,
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });
  }

  createRequest(payload: CreateLeaveRequestPayload): Observable<LeaveRequestItem> {
    return this.http.post<LeaveRequestItem>('/api/leave/request', payload, {
      withCredentials: true,
    });
  }

  updateRequest(id: string, payload: CreateLeaveRequestPayload): Observable<LeaveRequestItem> {
    return this.http.patch<LeaveRequestItem>(`/api/leave/${id}`, payload, {
      withCredentials: true,
    });
  }

  deleteRequest(id: string): Observable<{ ok: true }> {
    return this.http.delete<{ ok: true }>(`/api/leave/${id}`, {
      withCredentials: true,
    });
  }
}
