import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';

import { AuthShellComponent } from '../../components/auth-shell/auth-shell';
import { AuthSwitchComponent, AuthMode } from '../../components/auth-switch/auth-switch';
import { AuthService } from '../../data/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AuthShellComponent,
    AuthSwitchComponent,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    DividerModule,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class AuthPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  mode: AuthMode = 'signin';

  // sign in
  signInEmail = '';
  signInPassword = '';

  // sign up
  signUpName = '';
  signUpEmail = '';
  signUpPassword = '';

  loading = false;
  error: string | null = null;

  setMode(mode: AuthMode) {
    this.mode = mode;
    this.error = null;
    this.loading = false;
  }

  submit() {
    this.error = null;

    if (this.mode === 'signin') return this.submitSignIn();
    return this.submitSignUp();
  }

  private submitSignIn() {
    this.loading = true;

    this.auth.login({ email: this.signInEmail.trim(), password: this.signInPassword }).subscribe((ok) => {
      this.loading = false;

      if (!ok) {
        this.error = 'Invalid email or password.';
        return;
      }

      this.router.navigateByUrl('/');
    });
  }

  private submitSignUp() {
    this.loading = true;

    // You’ll wire this once backend has POST /auth/register (or similar)
    // For now, friendly placeholder:
    setTimeout(() => {
      this.loading = false;
      this.error = 'Sign up endpoint not connected yet (backend register not implemented).';
    }, 400);
  }
}
