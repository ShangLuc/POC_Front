import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardGlobal, DashboardParEtablissement } from '../dashboard.service';

@Component({
  selector: 'app-viewer-dashboard',
  templateUrl: './viewer-dashboard.component.html',
  styleUrls: []
})
export class ViewerDashboardComponent implements OnInit {
  // Statistiques globales du lycée
  schoolStats: any;

  // Statistiques par classe (ici par établissement)
  classStats: any[] = [];

  // Tickets des élèves, groupés par classe (pas encore implémenté côté back)
  ticketsByClass: any[] = [];

  loading = false;
  error?: string;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loading = true;

    // Charger les stats pour l'établissement du viewer connecté
    this.dashboardService.getForViewer().subscribe({
      next: (global: DashboardGlobal) => {
        this.schoolStats = {
          globalCompletionRate: global.tauxRemplissage,
          totalStudents: global.totalEleves,
          studentsWithChoices: global.elevesAvecVoeux,
          totalChoices: global.totalVoeux
        };

        // Pour l'instant, on n'a qu'un bloc global; classStats peut être dérivé plus tard
        this.classStats = [
          {
            className: 'Établissement du viewer',
            completionRate: global.tauxRemplissage,
            studentCount: global.totalEleves
          }
        ];

        this.loading = false;
      },
      error: () => {
        this.error = "Erreur lors du chargement des statistiques de l'établissement";
        this.loading = false;
      }
    });

    // TODO: quand un endpoint pour les tickets existera, appeler un service ici
  }
}
