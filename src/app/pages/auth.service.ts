import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api'; // idéalement depuis environment

  constructor(private http: HttpClient) {}

 loginEleve(id: string) {
  return this.http.post<any>('http://localhost:8080/api/auth/eleve/login', { id });
}

  loginAdmin(email: string, password:string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/login`,{ email, password });
  }

  // simple stockage local pour l’ID élève
  setCurrentEleveId(id: string): void {
    localStorage.setItem('eleveId', id);
  }

  getCurrentEleveId(): string | null {
    return localStorage.getItem('eleveId');
  }

  clear(): void {
    localStorage.removeItem('eleveId');
  }
}