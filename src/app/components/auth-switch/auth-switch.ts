import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

export type AuthMode = 'signin' | 'signup';

@Component({
  selector: 'app-auth-switch',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './auth-switch.html',
  styleUrl: './auth-switch.scss',
})
export class AuthSwitchComponent {
  @Input({ required: true }) mode!: AuthMode;
  @Output() modeChange = new EventEmitter<AuthMode>();

  setMode(next: AuthMode) {
    if (next !== this.mode) this.modeChange.emit(next);
  }
}
