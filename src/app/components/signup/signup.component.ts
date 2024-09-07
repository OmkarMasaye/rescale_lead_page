import { Component } from '@angular/core';
import {
  FormControl,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  constructor(private router: Router, private authService: AuthService) {}
  email = new FormControl('', [Validators.required, Validators.email]);

  password = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);

  signupForm = new FormGroup({
    email: this.email,
    password: this.password,
  });

  signup() {
    const email = this.signupForm.value.email;
    const password = this.signupForm.value.password;

    if (email && password) {
      this.authService.signupUser(email, password).subscribe(
        (response: any) => {
          // console.log(response);
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Signup failed', error);
          alert(JSON.parse(error?.error).msg);
          
          if (JSON.parse(error?.error).msg === 'User already exists')
            this.router.navigate(['/login']);
        }
      );
    } else {
      console.error('Email or password is missing');
      alert('Please fill in both email and password.');
    }
  }
  reset() {
    this.signupForm.reset();
  }
}
