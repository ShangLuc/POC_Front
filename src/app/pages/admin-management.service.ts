import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminManagementService {
  private baseUrl = 'http://localhost:8080/api/superadmin';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get authorization headers with Bearer token
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAuthToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Get all admins
  getAllAdmins(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/admins`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Add a new admin (handles text response)
  addAdmin(username: string, password: string): Observable<string> {
    return this.http.post<string>(
      `${this.baseUrl}/create-admin`,
      { username, password },
      { 
        headers: this.getAuthHeaders(),
        responseType: 'text' as 'json'  // Handle text response
      }
    );
  }

  // Delete an admin by ID (handles text response)
  deleteAdmin(adminId: string): Observable<string> {
    return this.http.delete<string>(
      `${this.baseUrl}/admin/${adminId}`,
      { 
        headers: this.getAuthHeaders(),
        responseType: 'text' as 'json'  // Handle text response
      }
    );
  }

  // Get all viewers (référents)
  getAllViewers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/viewers`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Add a new viewer (référent)
  addViewer(  username: string, lycee: string): Observable<string> {
    return this.http.post<string>(
      `${this.baseUrl}/viewers`,
      {  username, etablissement: lycee },
      { 
        headers: this.getAuthHeaders(),
        responseType: 'text' as 'json'
      }
    );
  }

  // Delete a viewer by ID
  deleteViewer(viewerId: string): Observable<string> {
    return this.http.delete<string>(
      `${this.baseUrl}/viewers/${viewerId}`,
      { 
        headers: this.getAuthHeaders(),
        responseType: 'text' as 'json'
      }
    );
  }

  updateViewer(viewerId: string,  username: string, lycee: string): Observable<string> {
    return this.http.put<string>(
      `${this.baseUrl}/viewers/${viewerId}`,
      { username, etablissement: lycee },
      { 
        headers: this.getAuthHeaders(),
        responseType: 'text' as 'json'
      }
    );
  }

  // Change password for admin or superadmin
  changePassword(currentPassword: string, newPassword: string, isSuperAdmin: boolean): Observable<string> {
    const endpoint = isSuperAdmin 
      ? 'http://localhost:8080/api/auth/superadmin/change-password'
      : 'http://localhost:8080/api/auth/admin/change-password';
    
    return this.http.post<string>(
      endpoint,
      { currentPassword, newPassword },
      { 
        headers: this.getAuthHeaders(),
        responseType: 'text' as 'json'
      }
    );
  }

}
