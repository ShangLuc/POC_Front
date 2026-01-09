import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Eleve } from '../models/eleve.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EleveService {
  private baseUrl = `${environment.apiUrl}/api`; // keep host aligned with frontend for cookies

  constructor(private http: HttpClient, private authService: AuthService) {}

  saveVoeux(eleveId: string, eventIds: number[]) {
    const token = this.authService.getAuthToken();
    const headers = token 
      ? { Authorization: `Bearer ${token}` }
      : {};
      
    return this.http.post(
      `${environment.apiUrl}/api/eleves/${eleveId}/voeux`,
      { eventIds },
      { 
        headers,
        responseType: 'text' as 'json'
      }
    );
  }

  confirmerVoeux(eleveId: string): Observable<string> {
    return this.http.put(`${this.baseUrl}/eleves/${eleveId}/voeux/confirmer`, {}, {
      responseType: 'text'
    });
  }

  getEleveById(id: string): Observable<Eleve> {
    const token = this.authService.getAuthToken();
    const options = token
      ? { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      : { withCredentials: true };

    return this.http.get<Eleve>(`${this.baseUrl}/eleves/${id}`, options);
  }
}
