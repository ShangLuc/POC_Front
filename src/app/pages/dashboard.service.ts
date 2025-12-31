import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardGlobal {
  totalEleves: number;
  elevesAvecVoeux: number;
  totalVoeux: number;
  tauxRemplissage: number;
}

export interface DashboardParEtablissement {
  etablissement: string;
  totalEleves: number;
  elevesAvecVoeux: number;
  tauxRemplissage: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) { }

  getGlobal(): Observable<DashboardGlobal> {
    return this.http.get<DashboardGlobal>(`${this.apiUrl}/global`);
  }

  getParEtablissement(): Observable<DashboardParEtablissement[]> {
    return this.http.get<DashboardParEtablissement[]>(`${this.apiUrl}/par-etablissement`);
  }

  // Statistiques pour l'établissement du viewer connecté
  getForViewer(): Observable<DashboardGlobal> {
    return this.http.get<DashboardGlobal>(`${this.apiUrl}/viewer`);
  }
}
