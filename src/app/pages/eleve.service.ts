import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EleveService {
  private baseUrl = 'http://localhost:8080/api'; // TODO: move to environment.ts

  constructor(private http: HttpClient) {}

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
}
