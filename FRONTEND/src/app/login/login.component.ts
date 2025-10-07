import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthServiceService } from '../service/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api-response';
import { ButtonComponent } from "../components/button/button.component";

@Component({
  selector: 'app-login',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule, RouterLink, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  hide = signal(false);

  email!: string;
  password!: string;
  //private aurhService = inject(AuthServiceService);
 aurhService = inject(AuthServiceService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);


  login() {
    this.aurhService.isLoading.set(true);
    this.aurhService.login(this.email, this.password).subscribe({
      next: () => {
        this.aurhService.me().subscribe();
        this.snackBar.open('connexion avec succès !', 'Close',{
          duration:500,
        });
        this.aurhService.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        let error = err.error as ApiResponse<string>;
        this.snackBar.open(error.error, "Close", {
          duration: 1000,
        });
        this.aurhService.isLoading.set(false);
      },
      complete: () => {
        this.router.navigate(['/']);
        this.aurhService.isLoading.set(false);
      },
    })
  }

  togglePassword(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

}
