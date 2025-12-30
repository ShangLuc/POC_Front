import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
    selector: 'dashboard-cmp',
    moduleId: module.id,
    templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit, AfterViewInit {
    
    @ViewChild('inscriptionChart') inscriptionChartRef: ElementRef;
    @ViewChild('activitiesChart') activitiesChartRef: ElementRef;
    @ViewChild('activitiesByLyceeChart') activitiesByLyceeChartRef: ElementRef;

    // Filters
    lycees: string[] = [];
    classes: string[] = [];
    selectedLycee: string = '';
    selectedClasse: string = '';

    // Statistics
    totalEleves: number = 0;
    elevesInscrits: number = 0;
    elevesNonInscrits: number = 0;
    tauxInscription: number = 0;

    // Activity statistics
    totalConferences: number = 0;
    totalTablesRondes: number = 0;
    totalFlashsMetiers: number = 0;

    // Charts
    inscriptionChart: any;
    activitiesChart: any;
    activitiesByLyceeChart: any;

    // Loading states
    isLoading: boolean = true;
    errorMessage: string = '';

    // Data for charts - Map<String, Long> from backend
    activitiesByLycee: { [key: string]: number } = {};

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

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

    ngOnInit() {
        this.loadFilters();
        this.loadStatistics();
    }

    ngAfterViewInit() {
        // Charts will be initialized after data is loaded
    }

    loadFilters() {
        // Load lycées
        this.http.get<string[]>('http://localhost:8080/api/eleves/lycees', { headers: this.getAuthHeaders() })
            .subscribe({
                next: (lycees) => {
                    this.lycees = lycees;
                },
                error: (err) => {
                    console.error('Error loading lycées:', err);
                }
            });

        // Load classes (with optional lycee filter)
        this.loadClasses();
    }

    loadClasses() {
        let classesUrl = 'http://localhost:8080/api/eleves/classes';
        if (this.selectedLycee) {
            classesUrl += `?lycee=${encodeURIComponent(this.selectedLycee)}`;
        }
        
        this.http.get<string[]>(classesUrl, { headers: this.getAuthHeaders() })
            .subscribe({
                next: (classes) => {
                    this.classes = classes;
                    // Reset selected class if it's not in the new list
                    if (this.selectedClasse && !classes.includes(this.selectedClasse)) {
                        this.selectedClasse = '';
                    }
                },
                error: (err) => {
                    console.error('Error loading classes:', err);
                }
            });
    }

    loadStatistics() {
        this.isLoading = true;
        this.errorMessage = '';

        let url = 'http://localhost:8080/api/dashboard/statistics';
        const params: string[] = [];
        
        if (this.selectedLycee) {
            params.push(`lycee=${encodeURIComponent(this.selectedLycee)}`);
        }
        if (this.selectedClasse) {
            params.push(`classe=${encodeURIComponent(this.selectedClasse)}`);
        }
        
        if (params.length > 0) {
            url += '?' + params.join('&');
        }

        this.http.get<any>(url, { headers: this.getAuthHeaders() })
            .subscribe({
                next: (data) => {
                    this.totalEleves = data.totalEleves || 0;
                    this.elevesInscrits = data.elevesInscrits || 0;
                    this.elevesNonInscrits = data.elevesNonInscrits || 0;
                    this.tauxInscription = this.totalEleves > 0 
                        ? Math.round((this.elevesInscrits / this.totalEleves) * 100) 
                        : 0;

                    this.totalConferences = data.totalConferences || 0;
                    this.totalTablesRondes = data.totalTablesRondes || 0;
                    this.totalFlashsMetiers = data.totalFlashsMetiers || 0;

                    // activitiesByLycee is a Map<String, Long> from backend
                    this.activitiesByLycee = data.activitiesByLycee || {};

                    this.isLoading = false;
                    
                    // Wait for Angular to render the DOM before initializing charts
                    setTimeout(() => {
                        this.initCharts();
                    }, 100);
                },
                error: (err) => {
                    console.error('Error loading statistics:', err);
                    this.errorMessage = 'Erreur lors du chargement des statistiques.';
                    this.isLoading = false;
                }
            });
    }

    onLyceeChange() {
        // When lycee changes, reload classes for that lycee
        this.loadClasses();
        this.loadStatistics();
    }

    onClasseChange() {
        this.loadStatistics();
    }

    resetFilters() {
        this.selectedLycee = '';
        this.selectedClasse = '';
        this.loadClasses();
        this.loadStatistics();
    }

    initCharts() {
        this.initInscriptionChart();
        this.initActivitiesChart();
        this.initActivitiesByLyceeChart();
    }

    initInscriptionChart() {
        if (this.inscriptionChart) {
            this.inscriptionChart.destroy();
        }

        const ctx = this.inscriptionChartRef?.nativeElement?.getContext('2d');
        if (!ctx) return;

        this.inscriptionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Inscrits', 'Non inscrits'],
                datasets: [{
                    data: [this.elevesInscrits, this.elevesNonInscrits],
                    backgroundColor: ['#28a745', '#dc3545'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Taux d\'inscription des élèves'
                    }
                }
            }
        });
    }

    initActivitiesChart() {
        if (this.activitiesChart) {
            this.activitiesChart.destroy();
        }

        const ctx = this.activitiesChartRef?.nativeElement?.getContext('2d');
        if (!ctx) return;

        this.activitiesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Conférences', 'Tables Rondes', 'Flash Métiers'],
                datasets: [{
                    label: 'Nombre de choix',
                    data: [this.totalConferences, this.totalTablesRondes, this.totalFlashsMetiers],
                    backgroundColor: ['#007bff', '#17a2b8', '#ffc107'],
                    borderColor: ['#0056b3', '#117a8b', '#d39e00'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Répartition globale des activités choisies'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    initActivitiesByLyceeChart() {
        if (this.activitiesByLyceeChart) {
            this.activitiesByLyceeChart.destroy();
        }

        const ctx = this.activitiesByLyceeChartRef?.nativeElement?.getContext('2d');
        if (!ctx) return;

        // activitiesByLycee is a Map<String, Long> - convert to arrays for chart
        const lyceeLabels = Object.keys(this.activitiesByLycee);
        const lyceeValues = Object.values(this.activitiesByLycee);

        if (lyceeLabels.length === 0) return;

        this.activitiesByLyceeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: lyceeLabels.map(l => l || 'Non spécifié'),
                datasets: [
                    {
                        label: 'Nombre total d\'activités choisies',
                        data: lyceeValues,
                        backgroundColor: '#007bff',
                        borderColor: '#0056b3',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Répartition des activités par lycée'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}
