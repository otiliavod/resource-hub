import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './auth-shell.html',
  styleUrl: './auth-shell.scss',
})
export class AuthShellComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
