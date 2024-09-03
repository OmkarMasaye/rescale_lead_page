import { Component } from '@angular/core';
import { FormControl, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private router:Router,private authService:AuthService){}

  email =new FormControl("",[
    Validators.required,
    Validators.email
  ])

  password = new FormControl("",[
    Validators.required,
    Validators.minLength(6)
  ])

  loginForm = new FormGroup({
    email:this.email,
    password:this.password
  })

  login() {
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    if (email && password) {
      this.authService.loginUser(email, password)
        .subscribe(
          (response: any) => {
            console.log(response);
            this.router.navigate(['/exploreData']); // Navigate to the desired page upon successful login
          },
          (error) => {
            console.error('Login failed', error);
            alert('Login failed. Please try again.');
          }
        );
    } else {
      console.error('Email or password is missing');
      alert('Please fill in both email and password.');
    }
  }
  reset(){
    this.loginForm.reset()
  }
}
