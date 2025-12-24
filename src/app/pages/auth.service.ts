import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api'; // idéalement depuis environment
  private currentUserRole: string = '';

  constructor(private http: HttpClient) {
    this.currentUserRole = localStorage.getItem('userRole') || '';
  }

 loginEleve(id: string) {
  return this.http.post<any>('http://localhost:8080/api/auth/eleve/login', { id }).pipe(
    tap(() => {
      localStorage.setItem('userRole', 'eleve');
      this.currentUserRole = 'eleve';
    })
  );
}

  loginAdmin(username: string, password: string): Observable<any> {
    if (!username || !password) {
      throw new Error('Username and password are required');
    } else {
      if (username == 'superadmin') {
        return this.http.post<any>('http://localhost:8080/api/auth/superadmin/login', { username, password }).pipe(
          tap((response) => {
            localStorage.setItem('userRole', 'superadmin');
            localStorage.setItem('adminUsername', username);
            localStorage.setItem('adminData', JSON.stringify(response));
            localStorage.setItem('authToken', response.token);
            this.currentUserRole = 'superadmin';
          })
        );
      } else {
        return this.http.post<any>('http://localhost:8080/api/auth/admin/login', { username, password }).pipe(
          tap((response) => {
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('adminUsername', username);
            localStorage.setItem('adminData', JSON.stringify(response));
            localStorage.setItem('authToken', response.token);

            this.currentUserRole = 'admin';
          })
        );
      }
    }
  }

  // simple stockage local pour l’ID élève
  setCurrentEleveId(id: string): void {
    localStorage.setItem('eleveId', id);
  }

  getCurrentEleveId(): string | null {
    return localStorage.getItem('eleveId');
  }

  isAdmin(): boolean {
    return this.currentUserRole === 'admin' || this.currentUserRole === 'superadmin';
  }

  isEleve(): boolean {
    return this.currentUserRole === 'eleve';
  }

  getCurrentRole(): string {
    return this.currentUserRole;
  }

  isAuthenticated(): boolean {
    return this.currentUserRole !== '' && (this.isAdmin() || this.isEleve());
  }

  getAdminUsername(): string | null {
    return localStorage.getItem('adminUsername');
  }

  getAdminData(): any {
    const data = localStorage.getItem('adminData');
    return data ? JSON.parse(data) : null;
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  logout(): Observable<any> {
    const username = this.getAdminUsername();
    const role = this.getCurrentRole();

    // Determine which endpoint to use based on role
    let logoutUrl: string;
    if (role === 'superadmin') {
      logoutUrl = 'http://localhost:8080/api/auth/superadmin/logout';
    } else if (role === 'admin') {
      logoutUrl = 'http://localhost:8080/api/auth/admin/logout';
    } else {
      // For eleve or any other role
      logoutUrl = 'http://localhost:8080/api/auth/logout';
    }

    return this.http.post<any>(logoutUrl, {}).pipe(
      tap(() => {
        this.clear();
      })
    );
  }

  clear(): void {
    localStorage.removeItem('eleveId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminData');
    localStorage.removeItem('authToken');
    this.currentUserRole = '';
  }
}