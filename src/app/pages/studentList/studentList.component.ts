import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import * as XLSX from 'xlsx';
import { environment } from '../../../environments/environment';



@Component({
    selector: 'dashboard-cmp',
    moduleId: module.id,
    templateUrl: 'studentList.component.html'
})



export class StudentListComponent implements OnInit {

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    // Get authorization headers with Bearer token
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

    // Headers for file upload: only Authorization, let browser set multipart boundary
    private getAuthHeadersForUpload(): HttpHeaders {
        const token = this.authService.getAuthToken();
        if (token) {
            return new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
        }
        return new HttpHeaders();
    }

    // User role info
    isViewer: boolean = false;
    isAdmin: boolean = false;
    viewerLycee: string = '';

    students: any[] = [];
    displayedStudents: any[] = [];
    studentCounter: number = 0;
    loadingEleves: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';
    // Filtres & recherche
    searchQuery: string = '';
    filterEtablissement: string;
    filterLibStructure: string;
    filterInscrit: 'tous' | 'oui' | 'non' = 'tous';
    etablissements: string[] = [];
    libStructures: string[] = [];
    // Pagination
    pageSize: number = 12;
    currentPage: number = 1;
    totalPages: number = 0;

    // Modal state
    showModal: boolean = false;
    addingStudent: boolean = false;
    createErrorMessage: string = '';
    newStudent = {
        id: '',
        nom: '',
        prenom: '',
        etablissement: '',
        libStructure: '',
        inscrit: 'non',
        day: new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        hour: new Date().getHours(),
        minute: new Date().getMinutes()
    };

    // Import modal state
    showImportModal: boolean = false;
    importingFile: boolean = false;
    selectedFile: File | null = null;
    selectedFileName: string = '';
    importErrorMessage: string = '';

    // Date/time selection arrays
    days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
    months: string[] = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    years: number[] = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
    hours: number[] = Array.from({ length: 24 }, (_, i) => i);
    minutes: number[] = Array.from({ length: 60 }, (_, i) => i);

    // Import date object
    importDate = {
        day: new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        hour: new Date().getHours(),
        minute: new Date().getMinutes()
    };

    ngOnInit() {
        this.checkScreenSize();
        this.isViewer = this.authService.isViewer();
        this.isAdmin = this.authService.isAdmin();

        if (this.isViewer) {
            this.loadViewerInfo();
        }
        this.loadEleves();
    }

    loadViewerInfo() {
        const viewerUsername = this.authService.getCurrentViewerUsername();
        if (!viewerUsername) {
            this.errorMessage = 'Erreur: utilisateur non identifié.';
            return;
        }

        this.viewerLycee = JSON.parse(localStorage.getItem('viewerData') || '')?.etablissement || '';
        this.filterEtablissement = this.viewerLycee;
        this.etablissements = [this.viewerLycee];
        this.applyFilters();
    }

    // Ouvrir la modal
    openModal() {
        this.showModal = true;
        this.resetForm();
    }

    // Fermer la modal
    closeModal() {
        this.showModal = false;
        this.resetForm();
    }

    // Réinitialiser le formulaire
    resetForm() {
        const now = new Date();
        this.newStudent = {
            id: '',
            nom: '',
            prenom: '',
            etablissement: '',
            libStructure: '',
            inscrit: 'non',
            day: now.getDate(),
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            hour: now.getHours(),
            minute: now.getMinutes()
        };
        this.createErrorMessage = '';
        this.successMessage = '';
    }

    // Ajouter un étudiant
    addStudent() {
        if (!this.newStudent.id || !this.newStudent.nom ||
            !this.newStudent.prenom || !this.newStudent.etablissement) {
            this.createErrorMessage = 'Veuillez remplir tous les champs obligatoires.';
            return;
        }

        this.addingStudent = true;
        this.createErrorMessage = '';
        this.successMessage = '';

        // Vérifier la présence du token avant l'appel
        const headers = this.getAuthHeaders();
        if (!headers.get('Authorization')) {
            this.createErrorMessage = 'Authentification requise: token manquant. Veuillez vous reconnecter.';
            this.addingStudent = false;
            return;
        }

        const student = {
            id: this.newStudent.id,
            nom: this.newStudent.nom,
            prenom: this.newStudent.prenom,
            etablissement: this.newStudent.etablissement,
            // Valeur par défaut vide si non fournie
            libStructure: this.newStudent.libStructure || '',
            demiJournee: this.formatStudentDate(),
            inscrit: this.newStudent.inscrit === 'oui' ? true : false
        };

        this.http.post<string>(`${environment.apiUrl}/api/admin/eleves`,
            student,
            {
                headers: headers,
                responseType: 'text' as 'json'  // Handle text response
            }
        ).subscribe({
            next: (response) => {
                this.successMessage = 'Étudiant ajouté avec succès.';
                // Add the student to the list locally
                this.students.push({
                    ...student,
                    id: this.newStudent.id
                });
                this.closeModal();
                this.updateNumbers();
                this.updateMetadata();
                this.applyFilters();
                this.recalcDisplayed();
                // Clear success message after 3 seconds
                setTimeout(() => {
                    this.successMessage = '';
                }, 3000);
            },
            error: (err) => {
                console.error('Erreur lors de l\'ajout de l\'étudiant:', err);
                this.createErrorMessage = err?.error?.message || 'Erreur lors de l\'ajout de l\'étudiant.';
                this.addingStudent = false;
            },
            complete: () => {
                this.addingStudent = false;
            }
        });
    }

    loadEleves() {
        this.loadingEleves = true;
        this.errorMessage = '';

        if (this.isAdmin) {
            this.getAllEleves().subscribe({
                next: (response) => {
                    this.students = response;
                    this.updateNumbers();
                    this.updateMetadata();
                    this.applyFilters();
                    this.recalcDisplayed();
                    this.loadingEleves = false;
                },
                error: (err) => {
                    console.error('Error loading Eleves:', err);
                    this.errorMessage = 'Erreur lors du chargement des élèves.';
                    this.loadingEleves = false;
                }
            });
        }
        else if (this.isViewer) {
            this.getAllElevesViewer().subscribe({
                next: (response) => {
                    this.students = response;
                    this.updateNumbers();
                    this.updateMetadata();
                    this.applyFilters();
                    this.recalcDisplayed();
                    this.loadingEleves = false;
                },
                error: (err) => {
                    console.error('Error loading Eleves:', err);
                    this.errorMessage = 'Erreur lors du chargement des élèves.';
                    this.loadingEleves = false;
                }
            });
        }
    }



    getAllEleves(): Observable<any[]> {
        return this.http.get<any[]>(
            `${environment.apiUrl}/api/admin/eleves`,
            { headers: this.getAuthHeaders() }
        );
    }

    getAllElevesViewer(): Observable<any[]> {
        const viewerUsername = this.authService.getCurrentViewerUsername();
        if (!viewerUsername) {
            this.errorMessage = 'Erreur: utilisateur non identifié.';
            return;
        }

        return this.http.get<any[]>(
            `${environment.apiUrl}/api/viewers/by-username/${encodeURIComponent(viewerUsername)}/eleves`,
            { headers: this.getAuthHeaders() }
        );
    }

    // Supprimer un étudiant
    deleteStudent(index: number) {
        const student = this.students[index];
        if (!student) {
            this.errorMessage = 'Élève introuvable dans la liste.';
            return;
        }

        const id = student.id || student.identifiantNational;
        if (!id) {
            this.errorMessage = 'Impossible de déterminer l\'identifiant de l\'élève.';
            return;
        }

        const headers = this.getAuthHeaders();
        if (!headers.get('Authorization')) {
            this.errorMessage = 'Authentification requise: token manquant. Veuillez vous reconnecter.';
            return;
        }

        this.errorMessage = '';
        this.successMessage = '';

        const url = `${environment.apiUrl}/api/admin/eleves/${encodeURIComponent(id)}`;
        this.http.delete<string>(url, { headers, responseType: 'text' as 'json' }).subscribe({
            next: (response) => {
                this.successMessage = response || 'Élève supprimé avec succès.';
                this.students.splice(index, 1);
                this.updateNumbers();
                this.updateMetadata();
                this.applyFilters();
                this.recalcDisplayed();
                setTimeout(() => { this.successMessage = ''; }, 3000);
            },
            error: (err) => {
                console.error('Erreur lors de la suppression de l\'élève:', err);
                this.errorMessage = (typeof err?.error === 'string' && err.error) || 'Erreur lors de la suppression de l\'élève.';
            }
        });
    }

    // Mettre à jour les numéros après suppression
    updateNumbers() {
        this.students.forEach((student, index) => {
            student.numero = index + 1;
        });
    }

    // Recalculer la page affichée
    private recalcDisplayed() {
        const source = this.applyFiltersReturn() || this.students;
        this.totalPages = Math.max(1, Math.ceil(source.length / this.pageSize));
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
        }
        if (this.currentPage < 1) {
            this.currentPage = 1;
        }
        const start = (this.currentPage - 1) * this.pageSize;
        const slice = source.slice(start, start + this.pageSize);
        this.displayedStudents = slice.map((s: any, idx: number) => ({ ...s, numero: start + idx + 1 }));
    }

    setPage(page: number) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.recalcDisplayed();
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage += 1;
            this.recalcDisplayed();
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage -= 1;
            this.recalcDisplayed();
        }
    }

    isMobile: boolean = false;

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.checkScreenSize();
    }

    private checkScreenSize() {
        this.isMobile = window.innerWidth < 768; // Bootstrap md breakpoint
    }

    get visiblePages(): number[] {
        const range = this.isMobile ? 2 : 3;
        const pages: number[] = [];
        const start = Math.max(1, this.currentPage - range);
        const end = Math.min(this.totalPages, this.currentPage + range);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    }

    // Construire les listes uniques pour les sélecteurs
    private updateMetadata() {
        const etabs = new Set<string>();
        const libs = new Set<string>();

        if (this.isViewer && this.viewerLycee) {
            this.students.forEach(s => {
                if (s.libStructure) libs.add(String(s.libStructure));
            });
        }
        else {
            this.students.forEach(s => {
                if (s.etablissement) etabs.add(String(s.etablissement));
                if (s.libStructure) libs.add(String(s.libStructure));
            });
            this.etablissements = Array.from(etabs).sort();
        }

        this.libStructures = Array.from(libs).sort();
    }

    // Appliquer les filtres & recherche (mutuelle)
    private applyFilters() {
        const src = this.students;
        const q = (this.searchQuery || '').toLowerCase().trim();
        const filtEt = (this.filterEtablissement || '').toLowerCase().trim();
        const filtLib = (this.filterLibStructure || '').toLowerCase().trim();
        const filtIns = this.filterInscrit;

        const filtered = src.filter(s => {
            // Etablissement - TOUJOURS filtrer pour les viewers
            if (this.isViewer && filtEt && String(s.etablissement || '').toLowerCase() !== filtEt) return false;
            if (!this.isViewer && filtEt && String(s.etablissement || '').toLowerCase() !== filtEt) return false;
            // Lib Structure
            if (filtLib && String(s.libStructure || '').toLowerCase() !== filtLib) return false;
            // Inscrit
            if (filtIns === 'oui' && !(s.inscrit === true || s.inscrit === 'oui' || s.inscrit === 'true')) return false;
            if (filtIns === 'non' && !(s.inscrit === false || s.inscrit === 'non' || s.inscrit === 'false')) return false;

            // Recherche libre
            if (q) {
                const hay = [
                    s.id,
                    s.identifiantNational,
                    s.nom,
                    s.prenom,
                    s.etablissement,
                    s.libStructure,
                    String(s.inscrit)
                ].map(v => String(v || '').toLowerCase());
                const match = hay.some(v => v.includes(q));
                if (!match) return false;
            }
            return true;
        });

        // Store filtered list on the instance via a helper return accessor
        (this as any)._filtered = filtered;
    }

    private applyFiltersReturn(): any[] {
        const cur = (this as any)._filtered;
        return Array.isArray(cur) ? cur : [];
    }

    onFilterChange() {
        this.applyFilters();
        this.recalcDisplayed();
    }

    // Demander confirmation avant suppression
    confirmDelete(index: number) {
        const student = this.students[index];
        const label = student ? `${student.nom || ''} ${student.prenom || ''}`.trim() : 'cet élève';
        const ok = window.confirm(`Voulez-vous vraiment supprimer ${label} ?`);
        if (ok) {
            this.deleteStudent(index);
        }
    }

    confirmDeleteAllStudents() {
        const ok = window.confirm('Êtes-vous sûr de vouloir supprimer tous les élèves ? Cette action est irréversible.');
        if (ok) {
            this.deleteAllStudents();
        }
    }

    deleteAllStudents() {
        const headers = this.getAuthHeaders();
        if (!headers.get('Authorization')) {
            this.errorMessage = 'Authentification requise: token manquant. Veuillez vous reconnecter.';
            return;
        }

        this.errorMessage = '';
        this.successMessage = '';

        this.http.delete<string>(`${environment.apiUrl}/api/admin/eleves`, { headers, responseType: 'text' as 'json' }).subscribe({
            next: (response) => {
                this.successMessage = response || 'Tous les élèves ont été supprimés avec succès.';
                // Réinitialiser toutes les données
                this.students = [];
                this.displayedStudents = [];
                this.etablissements = [];
                this.libStructures = [];
                this.currentPage = 1;
                this.totalPages = 0;
                // Réinitialiser les filtres
                this.searchQuery = '';
                this.filterEtablissement = '';
                this.filterLibStructure = '';
                this.filterInscrit = 'tous';
                setTimeout(() => { this.successMessage = ''; }, 3000);
            },
            error: (err) => {
                console.error('Erreur lors de la suppression de tous les élèves :', err);
                this.errorMessage = (typeof err?.error === 'string' && err.error) || 'Erreur lors de la suppression de tous les élèves.';
            }
        });
    }

    // Ouvrir la modal d'import
    openImportModal() {
        this.showImportModal = true;
        this.resetImportForm();
    }

    // Fermer la modal d'import
    closeImportModal() {
        this.showImportModal = false;
        this.resetImportForm();
    }

    // Réinitialiser le formulaire d'import
    resetImportForm() {
        this.selectedFile = null;
        this.selectedFileName = '';
        this.importErrorMessage = '';
        this.importingFile = false;
        // Reset date to current
        const now = new Date();
        this.importDate = {
            day: now.getDate(),
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            hour: now.getHours(),
            minute: now.getMinutes()
        };
    }

    // Sélection du fichier
    onImportFileSelect(event: any) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length === 1) {
            this.selectedFile = input.files[0];
            this.selectedFileName = this.selectedFile.name;
            this.importErrorMessage = '';
        } else {
            this.selectedFile = null;
            this.selectedFileName = '';
        }
    }

    // Soumettre l'import avec la date
    submitImport() {
        if (!this.selectedFile) {
            this.importErrorMessage = 'Veuillez sélectionner un fichier Excel.';
            return;
        }

        // Authorization header only (no Content-Type)
        const headers = this.getAuthHeadersForUpload();
        if (!headers.get('Authorization')) {
            this.importErrorMessage = 'Authentification requise: token manquant. Veuillez vous reconnecter.';
            return;
        }

        // Format the date string
        const formattedDate = this.formatImportDate();

        const formData = new FormData();
        formData.append('file', this.selectedFile, this.selectedFile.name);
        formData.append('demiJournee', formattedDate);

        // Indicate loading and clear messages
        this.importingFile = true;
        this.importErrorMessage = '';
        this.errorMessage = '';
        this.successMessage = '';

        this.http.post<string>(`${environment.apiUrl}/api/admin/eleves/import`, formData, { headers, responseType: 'text' as 'json' }).subscribe({
            next: (response) => {
                this.successMessage = response || 'Import réussi. Rafraîchissement de la liste…';
                this.closeImportModal();
                this.loadEleves();
            },
            error: (err) => {
                console.error('Erreur lors de l\'import du fichier Excel:', err);
                this.importErrorMessage = (typeof err?.error === 'string' && err.error) || 'Erreur lors de l\'import du fichier.';
                this.importingFile = false;
            }
        });
    }

    // Formater la date pour l'envoi (import)
    formatImportDate(): string {
        const pad = (n: number) => n < 10 ? '0' + n : String(n);
        return `${pad(this.importDate.day)}/${pad(this.importDate.month)}/${this.importDate.year} ${pad(this.importDate.hour)}:${pad(this.importDate.minute)}`;
    }

    // Formater la date pour l'ajout d'étudiant
    formatStudentDate(): string {
        const pad = (n: number) => n < 10 ? '0' + n : String(n);
        return `${pad(this.newStudent.day)}/${pad(this.newStudent.month)}/${this.newStudent.year} ${pad(this.newStudent.hour)}:${pad(this.newStudent.minute)}`;
    }


    openExportModal() {
        const headers = this.getAuthHeaders();
        if (!headers.get('Authorization')) {
            this.errorMessage = 'Authentification requise: token manquant. Veuillez vous reconnecter.';
            return;
        }

        this.http.get<any[]>(`${environment.apiUrl}/api/admin/eleves/export-data`, { headers })
            .subscribe({
                next: (data) => {
                    // Trier: Etablissement > Nom > Prénom
                    data.sort((a, b) => {
                        const etablissementComparison = (a.etablissement || '').localeCompare(b.etablissement || '');
                        if (etablissementComparison !== 0) return etablissementComparison;

                        const nomComparison = (a.nom || '').localeCompare(b.nom || '');
                        if (nomComparison !== 0) return nomComparison;

                        return (a.prenom || '').localeCompare(b.prenom || '');
                    });

                    // Mapper les données pour Excel
                    const exportData = data.map(eleve => {
                        const row: any = {
                            "Etablissement": eleve.etablissement,
                            "Nom de famille": eleve.nom,
                            "Prenom": eleve.prenom,
                            "ID National": eleve.id,
                            "Lib. Structure": eleve.libStructure
                        };

                        // Ajouter les voeux
                        if (eleve.voeux && Array.isArray(eleve.voeux)) {
                            // Trier par numeroVoeu
                            eleve.voeux.sort((v1: any, v2: any) => v1.numeroVoeu - v2.numeroVoeu);

                            eleve.voeux.forEach((voeu: any) => {
                                row[`Voeu ${voeu.numeroVoeu}`] = voeu.eventNom;
                            });
                        }

                        return row;
                    });

                    // Créer la feuille Excel
                    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

                    // Générer le CSV avec séparateur point-virgule
                    const csvOutput = XLSX.utils.sheet_to_csv(ws, { FS: ";" });

                    // Créer un Blob avec le BOM UTF-8
                    const blob = new Blob(["\uFEFF" + csvOutput], { type: 'text/csv;charset=utf-8;' });

                    // Déclencher le téléchargement
                    const link = document.createElement("a");
                    const url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", "Eleves_Voeux.csv");
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                },
                error: (err) => {
                    console.error('Erreur lors de l\'export:', err);
                    this.errorMessage = 'Erreur lors de la génération du fichier Excel.';
                }
            });
    }
}
