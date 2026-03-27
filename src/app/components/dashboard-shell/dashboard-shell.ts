import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { map } from 'rxjs/operators';

import { AuthService } from '../../data/auth.service';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-shell.html',
  styleUrl: './dashboard-shell.scss',
})
export class DashboardShellComponent implements OnInit {
  private auth = inject(AuthService);

  userLabel$ = this.auth.currentUser$.pipe(
    map((user) => user?.fullName || 'User'),
  );

  ngOnInit(): void {
    this.auth.hydrateCurrentUser().subscribe();
  }

  signOut() {
    this.auth.logout().subscribe(() => {
      window.location.href = '/auth';
    });
  }
}
