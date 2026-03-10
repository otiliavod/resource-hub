import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { map, shareReplay } from 'rxjs/operators';

import { AuthService } from '../../data/auth.service';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-shell.html',
  styleUrl: './dashboard-shell.scss',
})
export class DashboardShellComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  userLabel$ = this.auth.me().pipe(
    map((user) => user.fullName || 'User'),
    shareReplay(1),
  );

  signOut() {
    this.auth.logout().subscribe(() => {
      this.router.navigateByUrl('/auth');
    });
  }
}
