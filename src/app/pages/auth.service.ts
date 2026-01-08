import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api'; // keep host consistent with frontend to share cookies
  private readonly eleveIdKey = 'eleveId';
  private readonly viewerUsernameKey = 'viewerUsername';
  private currentUserRole: string = '';

  constructor(private http: HttpClient) {
    this.currentUserRole = localStorage.getItem('userRole') || '';
  }

  loginEleve(id: string) {
    return this.http.post<any>(`${this.baseUrl}/auth/eleve/login`, { id }, { withCredentials: true }).pipe(
      tap((response) => {
        const storedId = response?.id || id;
        this.setCurrentEleveId(storedId);
        if (response?.token) {
          this.setAuthToken(response.token);
        }
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
        return this.http.post<any>(`${this.baseUrl}/auth/superadmin/login`, { username, password }).pipe(
          tap((response) => {
            localStorage.setItem('userRole', 'superadmin');
            localStorage.setItem('adminUsername', username);
            localStorage.setItem('adminData', JSON.stringify(response));
            localStorage.setItem('authToken', response.token);
            this.currentUserRole = 'superadmin';
          })
        );
      } else {
        return this.http.post<any>(`${this.baseUrl}/auth/admin/login`, { username, password }).pipe(
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

  loginViewer(username: string, password: string): Observable<any> {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    return this.http.post<any>(`${this.baseUrl}/auth/viewers/login`, { username, password }).pipe(
      tap((response) => {
        localStorage.setItem('userRole', 'viewer');
        localStorage.setItem('viewerUsername', username);
        localStorage.setItem('viewerData', JSON.stringify(response));
        localStorage.setItem('authToken', response.token);

        this.currentUserRole = 'viewer';
      })
    );
  }



  // simple stockage local pour l’ID élève
  setCurrentEleveId(id: string): void {
    localStorage.setItem(this.eleveIdKey, id);
  }

  getCurrentEleveId(): string | null {
    return localStorage.getItem(this.eleveIdKey);
  }

  setCurrentViewerUsername(username: string): void {
    localStorage.setItem('viewerUsername', username);
  }

  getCurrentViewerUsername(): string | null {
    return localStorage.getItem('viewerUsername');
  }

  isAdmin(): boolean {
    return this.currentUserRole === 'admin' || this.currentUserRole === 'superadmin';
  }

  isEleve(): boolean {
    return this.currentUserRole === 'eleve';
  }

  isViewer(): boolean {
    return this.currentUserRole === 'viewer';
  }

  getCurrentRole(): string {
    return this.currentUserRole;
  }

  isAuthenticated(): boolean {
    return this.currentUserRole !== '' && (this.isAdmin() || this.isEleve() || this.isViewer());
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

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  logout(): Observable<void> {
    // Frontend-only logout: remove local credentials and resolve
    this.clear();
    return of(void 0);
  }

  clear(): void {
    localStorage.removeItem(this.eleveIdKey);
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminData');
    localStorage.removeItem('authToken');
    localStorage.removeItem(this.viewerUsernameKey);
    this.currentUserRole = '';
  }
}