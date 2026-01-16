import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'dashboard-cmp',
    moduleId: module.id,
    templateUrl: 'accueil.component.html'
})
export class AccueilComponent implements OnInit {

    // Nom/prénom ou identifiant à afficher dans le message d'accueil
    greetingName: string = 'Utilisateur';

    constructor(
        private authService: AuthService,
        private http: HttpClient
    ) {}

    ngOnInit(): void {
        if (this.authService.isEleve()) {
            this.loadEleveName();
        } else if (this.authService.isAdmin()) {
            const adminUsername = this.authService.getAdminUsername();
            this.greetingName = adminUsername || 'Administrateur';
        } else if (this.authService.isViewer()) {
            const viewerUsername = this.authService.getCurrentViewerUsername();
            this.greetingName = viewerUsername || 'Référent';
        } else {
            this.greetingName = 'Utilisateur';
        }
    }

    private loadEleveName(): void {
        const eleveId = this.authService.getCurrentEleveId();
        if (!eleveId) {
            this.greetingName = 'Élève';
            return;
        }

        const token = this.authService.getAuthToken();
        const headers = token
            ? new HttpHeaders({ Authorization: `Bearer ${token}` })
            : new HttpHeaders();

        this.http.get<any>(`${environment.apiUrl}/api/eleves/${eleveId}`, {
            headers,
            withCredentials: true
        }).subscribe({
            next: (eleve) => {
                if (eleve && (eleve.prenom || eleve.nom)) {
                    this.greetingName = `${eleve.prenom || ''} ${eleve.nom || ''}`.trim();
                } else {
                    this.greetingName = eleveId;
                }
            },
            error: (err) => {
                console.error('Erreur lors du chargement des infos élève pour accueil', err);
                this.greetingName = 'Élève';
            }
        });
    }
}
