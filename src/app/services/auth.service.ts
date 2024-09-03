import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthModel } from './auth-model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  signupUser(email: string, password: string): Observable<any> {
    const authData: AuthModel = { email, password };
    return this.http.post("http://localhost:5000/register", authData, { responseType: "text" });
  }
  loginUser(email: string, password: string): Observable<any> {
    const authData: AuthModel = { email, password };
    return this.http.post("http://localhost:5000/login", authData, { responseType: "text" });
  }
}


