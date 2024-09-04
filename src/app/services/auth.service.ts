import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, catchError, of, tap } from 'rxjs';
import { AuthModel } from './auth-model';
import { Router } from '@angular/router'; 


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  
  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('token');
    this.tokenSubject.next(token);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenSubject.value;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  setToken(token: string): void {
    this.tokenSubject.next(token);
    localStorage.setItem('token', token);
  }

  signupUser(email: string, password: string): Observable<any> {
    const authData: AuthModel = { email, password };
    return this.http.post("http://localhost:5000/register", authData, { responseType: "text" });
  }
  loginUser(email: string, password: string): Observable<any> {
    const authData: AuthModel = { email, password };
    return this.http.post<{ token: string }>("http://localhost:5000/login", authData)
      .pipe(
        tap(response => {
          const token = response.token;
          this.tokenSubject.next(token);
          localStorage.setItem('token', token);
        }),
        catchError(error => {
          console.error('Login error', error);
          return of('Login failed');
        })
      );
  }
  
  
  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  } 

  getUid(): string | null {
    // Assuming the token contains the user ID encoded in it
    const token = this.tokenSubject.value;
    if (token) {
      // Decode the token to get the user ID (you might need a library for decoding JWT)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub; // or however you store the user ID in the payload
    }
    return null;
  }

  logout(): void {
    const token = this.tokenSubject.value;
    if (!token) {
      console.error('No token found for logout');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post(`http://localhost:5000/logout`, {}, { headers: headers, responseType: 'text' })
      .pipe(
        tap(() => {
          this.tokenSubject.next(null); // Clear the token in BehaviorSubject
          localStorage.removeItem('token'); // Remove token from local storage
          this.router.navigate(['/login']); // Redirect to login page after logout
        }),
        catchError(error => {
          console.error('Logout error', error);
          return of('Logout failed');
        })
      ).subscribe(response => {
        console.log('Logout response:', response);
      });
  }
}


