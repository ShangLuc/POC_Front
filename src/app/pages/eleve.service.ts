import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Eleve } from '../models/eleve.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EleveService {
  private baseUrl = 'http://localhost:8080/api'; // keep host aligned with frontend for cookies

  constructor(private http: HttpClient, private authService: AuthService) {}

  saveVoeux(eleveId: string, eventIds: number[]) {
  return this.http.post(
    `http://localhost:8080/api/eleves/${eleveId}/voeux`,
    { eventIds }  // <-- clé identique à VoeuxRequest
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
