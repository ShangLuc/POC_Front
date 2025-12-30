import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-viewer-dashboard',
  templateUrl: './viewer-dashboard.component.html',
  styleUrls: ['./viewer-dashboard.component.css']
})
export class ViewerDashboardComponent implements OnInit {
  // Statistiques globales du lycée
  schoolStats: any;

  // Statistiques par classe
  classStats: any[] = [];

  // Tickets des élèves, groupés par classe
  ticketsByClass: any[] = [];

  loading = false;
  error?: string;

  constructor() {}

  ngOnInit(): void {
    // TODO: appeler un service pour charger les stats et tickets
  }
}
