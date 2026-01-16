import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

interface ActivityStat {
    id: string;
    titre: string;
    count: number;
}

@Component({
    selector: 'dashboard-cmp',
    moduleId: module.id,
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
    private subscriptions = new Subscription();

    @ViewChild('inscriptionChart') inscriptionChartRef: ElementRef;
    @ViewChild('conferencesChart') conferencesChartRef: ElementRef;
    @ViewChild('tablesRondesChart') tablesRondesChartRef: ElementRef;
    @ViewChild('flashsMetiersChart') flashsMetiersChartRef: ElementRef;

    // Math for template
    Math = Math;

    // Active tab
    activeTab: string = 'conferences';

    // User role info
    isViewer: boolean = false;
    isAdmin: boolean = false;
    viewerLycee: string = '';

    // Filters
    lycees: string[] = [];
    classes: string[] = [];
    selectedLycee: string = '';
    selectedClasse: string = '';
    
    // Day and hour filters
    jours: string[] = [];
    heures: string[] = [];
    selectedJour: string = '';
    selectedHeure: string = '';

    // Statistics
    totalEleves: number = 0;
    elevesInscrits: number = 0;
    elevesNonInscrits: number = 0;
    tauxInscription: number = 0;

    // Activity statistics - detailed by activity
    conferencesStats: ActivityStat[] = [];
    tablesRondesStats: ActivityStat[] = [];
    flashsMetiersStats: ActivityStat[] = [];

    // Charts
    inscriptionChart: any;
    conferencesChart: any;
    tablesRondesChart: any;
    flashsMetiersChart: any;

    // Loading states
    isLoading: boolean = true;
    errorMessage: string = '';

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

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
        this.isViewer = this.authService.isViewer();
        this.isAdmin = this.authService.isAdmin();

        if (this.isViewer) {
            // Load viewer's lycee first, then load data
            this.loadViewerInfo();
        } else {
            this.loadFilters();
            this.loadStatistics();
        }
    }

    ngAfterViewInit() {
        // Charts will be initialized after data is loaded
    }

    loadViewerInfo() {
        const viewerUsername = this.authService.getCurrentViewerUsername();
        if (!viewerUsername) {
            this.errorMessage = 'Erreur: utilisateur non identifié.';
            this.isLoading = false;
            return;
        }

        this.viewerLycee = JSON.parse(localStorage.getItem('viewerData') || '')?.etablissement || '';
        this.selectedLycee = this.viewerLycee;
        this.loadClasses();
        this.loadJours();
        this.loadHeures();
        this.loadStatistics();
    }

    loadFilters() {
        // Load lycées
        this.http.get<string[]>(`${environment.apiUrl}/api/eleves/lycees`, { headers: this.getAuthHeaders() })
            .subscribe({
                next: (lycees) => {
                    this.lycees = lycees;
                },
                error: (err) => {
                    console.error('Error loading lycées:', err);
                }
            });

        // Load classes, jours, heures
        this.loadClasses();
        this.loadJours();
        this.loadHeures();
    }

    loadClasses() {
        let classesUrl = `${environment.apiUrl}/api/eleves/classes`;
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

    loadJours() {
        let joursUrl = `${environment.apiUrl}/api/eleves/jours`;
        if (this.selectedLycee) {
            joursUrl += `?lycee=${encodeURIComponent(this.selectedLycee)}`;
        }

        this.http.get<string[]>(joursUrl, { headers: this.getAuthHeaders() })
            .subscribe({
                next: (jours) => {
                    this.jours = jours;
                    // Reset selected jour if it's not in the new list
                    if (this.selectedJour && !jours.includes(this.selectedJour)) {
                        this.selectedJour = '';
                        this.selectedHeure = '';
                    }
                },
                error: (err) => {
                    console.error('Error loading jours:', err);
                }
            });
    }

    loadHeures() {
        let heuresUrl = `${environment.apiUrl}/api/eleves/heures`;
        const params: string[] = [];
        
        if (this.selectedLycee) {
            params.push(`lycee=${encodeURIComponent(this.selectedLycee)}`);
        }
        if (this.selectedJour) {
            params.push(`jour=${encodeURIComponent(this.selectedJour)}`);
        }
        
        if (params.length > 0) {
            heuresUrl += '?' + params.join('&');
        }

        this.http.get<string[]>(heuresUrl, { headers: this.getAuthHeaders() })
            .subscribe({
                next: (heures) => {
                    this.heures = heures;
                    // Reset selected heure if it's not in the new list
                    if (this.selectedHeure && !heures.includes(this.selectedHeure)) {
                        this.selectedHeure = '';
                    }
                },
                error: (err) => {
                    console.error('Error loading heures:', err);
                }
            });
    }

    loadStatistics() {
        this.isLoading = true;
        this.errorMessage = '';

        let url = `${environment.apiUrl}/api/dashboard/statistics`;
        const params: string[] = [];

        if (this.selectedLycee) {
            params.push(`lycee=${encodeURIComponent(this.selectedLycee)}`);
        }
        if (this.selectedClasse) {
            params.push(`classe=${encodeURIComponent(this.selectedClasse)}`);
        }
        if (this.selectedJour) {
            params.push(`jour=${encodeURIComponent(this.selectedJour)}`);
        }
        if (this.selectedHeure) {
            params.push(`heure=${encodeURIComponent(this.selectedHeure)}`);
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

                    // Detailed activity statistics
                    this.conferencesStats = this.mapToActivityStats(data.conferencesStats || {});
                    this.tablesRondesStats = this.mapToActivityStats(data.tablesRondesStats || {});
                    this.flashsMetiersStats = this.mapToActivityStats(data.flashsMetiersStats || {});

                    this.isLoading = false;
                    this.cdr.markForCheck(); // Marquer pour la détection de changements

                    // Wait for Angular to render the DOM before initializing charts
                    setTimeout(() => {
                        this.initCharts();
                    }, 100);
                },
                error: (err) => {
                    console.error('Error loading statistics:', err);
                    this.errorMessage = 'Erreur lors du chargement des statistiques.';
                    this.isLoading = false;
                    this.cdr.markForCheck(); // Marquer pour la détection de changements
                }
            });
    }

    // Convert Map<String, Long> to ActivityStat array
    mapToActivityStats(map: { [key: string]: number }): ActivityStat[] {
        return Object.entries(map).map(([titre, count]) => ({
            id: titre,
            titre: titre,
            count: count
        })).sort((a, b) => b.count - a.count); // Sort by count descending
    }

    onLyceeChange() {
        // When lycee changes, reload classes, jours, heures for that lycee
        this.loadClasses();
        this.loadJours();
        this.loadHeures();
        this.loadStatistics();
    }

    onClasseChange() {
        this.loadStatistics();
    }

    onJourChange() {
        // Reset hour and reload heures when day changes
        this.selectedHeure = '';
        this.loadHeures();
        this.loadStatistics();
    }

    onHeureChange() {
        this.loadStatistics();
    }

    resetFilters() {
        this.selectedClasse = '';
        this.selectedJour = '';
        this.selectedHeure = '';
        // Reset lycee only if not a viewer (viewers are locked to their lycee)
        if (!this.isViewer) {
            this.selectedLycee = '';
        }
        this.loadClasses();
        this.loadJours();
        this.loadHeures();
        this.loadStatistics();
    }

    initCharts() {
        this.initInscriptionChart();
        this.initConferencesChart();
        this.initTablesRondesChart();
        this.initFlashsMetiersChart();
    }

    onTabChange(tab: string) {
        this.activeTab = tab;
        // Wait for Angular to render the DOM before initializing the chart
        setTimeout(() => {
            switch (tab) {
                case 'conferences':
                    this.initConferencesChart();
                    break;
                case 'tables-rondes':
                    this.initTablesRondesChart();
                    break;
                case 'flashs-metiers':
                    this.initFlashsMetiersChart();
                    break;
            }
        }, 50);
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

    initConferencesChart() {
        if (this.conferencesChart) {
            this.conferencesChart.destroy();
        }

        const ctx = this.conferencesChartRef?.nativeElement?.getContext('2d');
        if (!ctx || this.conferencesStats.length === 0) return;

        this.conferencesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.conferencesStats.map(s => this.truncateLabel(s.titre, 30)),
                datasets: [{
                    data: this.conferencesStats.map(s => s.count),
                    backgroundColor: this.generateColors(this.conferencesStats.length, 'blue'),
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            font: {
                                size: 11
                            },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: (items) => {
                                const index = items[0].dataIndex;
                                return this.conferencesStats[index].titre;
                            },
                            label: (item) => ` ${item.raw} élève(s) inscrit(s)`
                        }
                    }
                }
            }
        });
    }

    initTablesRondesChart() {
        if (this.tablesRondesChart) {
            this.tablesRondesChart.destroy();
        }

        const ctx = this.tablesRondesChartRef?.nativeElement?.getContext('2d');
        if (!ctx || this.tablesRondesStats.length === 0) return;

        this.tablesRondesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.tablesRondesStats.map(s => this.truncateLabel(s.titre, 30)),
                datasets: [{
                    data: this.tablesRondesStats.map(s => s.count),
                    backgroundColor: this.generateColors(this.tablesRondesStats.length, 'teal'),
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            font: {
                                size: 11
                            },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: (items) => {
                                const index = items[0].dataIndex;
                                return this.tablesRondesStats[index].titre;
                            },
                            label: (item) => ` ${item.raw} élève(s) inscrit(s)`
                        }
                    }
                }
            }
        });
    }

    initFlashsMetiersChart() {
        if (this.flashsMetiersChart) {
            this.flashsMetiersChart.destroy();
        }

        const ctx = this.flashsMetiersChartRef?.nativeElement?.getContext('2d');
        if (!ctx || this.flashsMetiersStats.length === 0) return;

        this.flashsMetiersChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.flashsMetiersStats.map(s => this.truncateLabel(s.titre, 30)),
                datasets: [{
                    data: this.flashsMetiersStats.map(s => s.count),
                    backgroundColor: this.generateColors(this.flashsMetiersStats.length, 'orange'),
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            font: {
                                size: 11
                            },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: (items) => {
                                const index = items[0].dataIndex;
                                return this.flashsMetiersStats[index].titre;
                            },
                            label: (item) => ` ${item.raw} élève(s) inscrit(s)`
                        }
                    }
                }
            }
        });
    }

    // Generate colors for pie/doughnut charts
    generateColors(count: number, baseColor: string): string[] {
        const colors: string[] = [];
        const colorPalettes: { [key: string]: string[] } = {
            blue: [
                'rgba(0, 123, 255, 0.9)',
                'rgba(0, 86, 179, 0.9)',
                'rgba(52, 152, 219, 0.9)',
                'rgba(41, 128, 185, 0.9)',
                'rgba(26, 82, 118, 0.9)',
                'rgba(93, 173, 226, 0.9)',
                'rgba(133, 193, 233, 0.9)',
                'rgba(174, 214, 241, 0.9)',
                'rgba(46, 134, 193, 0.9)',
                'rgba(33, 97, 140, 0.9)',
                'rgba(23, 165, 137, 0.9)',
                'rgba(72, 201, 176, 0.9)',
                'rgba(69, 179, 157, 0.9)',
                'rgba(22, 160, 133, 0.9)',
                'rgba(17, 122, 101, 0.9)',
                'rgba(125, 206, 160, 0.9)',
                'rgba(88, 214, 141, 0.9)',
                'rgba(46, 204, 113, 0.9)',
                'rgba(39, 174, 96, 0.9)',
                'rgba(30, 132, 73, 0.9)'
            ],
            teal: [
                'rgba(23, 162, 184, 0.9)',
                'rgba(17, 122, 139, 0.9)',
                'rgba(32, 201, 151, 0.9)',
                'rgba(26, 188, 156, 0.9)',
                'rgba(22, 160, 133, 0.9)',
                'rgba(72, 201, 176, 0.9)',
                'rgba(115, 198, 182, 0.9)',
                'rgba(69, 179, 157, 0.9)',
                'rgba(17, 122, 101, 0.9)',
                'rgba(11, 83, 69, 0.9)',
                'rgba(52, 152, 219, 0.9)',
                'rgba(93, 173, 226, 0.9)',
                'rgba(41, 128, 185, 0.9)',
                'rgba(26, 82, 118, 0.9)',
                'rgba(133, 193, 233, 0.9)',
                'rgba(46, 134, 193, 0.9)',
                'rgba(33, 97, 140, 0.9)',
                'rgba(23, 67, 101, 0.9)',
                'rgba(44, 62, 80, 0.9)',
                'rgba(52, 73, 94, 0.9)'
            ],
            orange: [
                'rgba(255, 193, 7, 0.9)',
                'rgba(211, 158, 0, 0.9)',
                'rgba(255, 159, 64, 0.9)',
                'rgba(243, 156, 18, 0.9)',
                'rgba(230, 126, 34, 0.9)',
                'rgba(211, 84, 0, 0.9)',
                'rgba(255, 195, 113, 0.9)',
                'rgba(248, 196, 113, 0.9)',
                'rgba(245, 176, 65, 0.9)',
                'rgba(235, 152, 78, 0.9)',
                'rgba(220, 118, 51, 0.9)',
                'rgba(186, 74, 0, 0.9)',
                'rgba(231, 76, 60, 0.9)',
                'rgba(192, 57, 43, 0.9)',
                'rgba(169, 50, 38, 0.9)',
                'rgba(146, 43, 33, 0.9)',
                'rgba(241, 148, 138, 0.9)',
                'rgba(236, 112, 99, 0.9)',
                'rgba(205, 97, 85, 0.9)',
                'rgba(176, 58, 46, 0.9)'
            ]
        };

        const palette = colorPalettes[baseColor] || colorPalettes['blue'];
        for (let i = 0; i < count; i++) {
            colors.push(palette[i % palette.length]);
        }
        return colors;
    }

    // Truncate long labels for better display
    truncateLabel(label: string, maxLength: number): string {
        if (label.length <= maxLength) {
            return label;
        }
        return label.substring(0, maxLength - 3) + '...';
    }

    // Calculate total inscriptions for an activity type
    getTotalInscriptions(stats: ActivityStat[]): number {
        return stats.reduce((total, stat) => total + stat.count, 0);
    }
    ngOnDestroy() {
        // Détruire tous les graphiques pour libérer la mémoire
        if (this.inscriptionChart) {
            this.inscriptionChart.destroy();
        }
        if (this.conferencesChart) {
            this.conferencesChart.destroy();
        }
        if (this.tablesRondesChart) {
            this.tablesRondesChart.destroy();
        }
        if (this.flashsMetiersChart) {
            this.flashsMetiersChart.destroy();
        }
        // Désabonner toutes les subscriptions
        this.subscriptions.unsubscribe();
    }}
