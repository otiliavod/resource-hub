import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { AuthService } from '../../data/auth.service';
import { AuthShellComponent } from '../../components/auth-shell/auth-shell';
import { AuthSwitchComponent } from '../../components/auth-switch/auth-switch';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DividerModule,
    AuthShellComponent,
    AuthSwitchComponent,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class AuthPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  mode: 'signin' | 'signup' = 'signin';
  fullName = '';
  email = '';
  password = '';
  isSubmitting = false;
  errorMessage = '';

  setMode(mode: 'signin' | 'signup') {
    this.mode = mode;
    this.errorMessage = '';
    this.fullName = '';
    this.email = '';
    this.password = '';
    this.isSubmitting = false;
    this.cdr.detectChanges();
  }

  submit() {
    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;
    this.cdr.detectChanges();

    const request$ =
      this.mode === 'signin'
        ? this.auth.login({
          email: this.email,
          password: this.password,
        })
        : this.auth.register({
          fullName: this.fullName,
          email: this.email,
          password: this.password,
        });

    request$
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.router.navigateByUrl('/dashboard');
            return;
          }

          this.errorMessage = result.message ?? 'Something went wrong.';
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Unable to complete the request right now.';
          this.cdr.detectChanges();
        },
      });
  }
}
