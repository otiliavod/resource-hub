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

  getBalance() {
    return this.http.get<LeaveBalance>('/api/leave/balance', {
      headers: { 'Cache-Control': 'no-cache' },
    });
  }

  getUpcoming() {
    return this.http.get<{ items: LeaveRequestItem[] }>('/api/leave/upcoming', {
      headers: { 'Cache-Control': 'no-cache' },
    });
  }

  createRequest(payload: CreateLeaveRequestPayload): Observable<LeaveRequestItem> {
    return this.http.post<LeaveRequestItem>('/api/leave/request', payload, {
      withCredentials: true,
    });
  }

  deleteRequest(id: string) {
    return this.http.delete<{ ok: true }>(`/api/leave/${id}`, {
      withCredentials: true,
    });
  }
}
