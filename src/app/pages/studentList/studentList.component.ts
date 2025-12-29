import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';



@Component({
    selector: 'dashboard-cmp',
    moduleId: module.id,
    templateUrl: 'studentList.component.html'
})



export class StudentListComponent implements OnInit{   
    
    constructor(
    private http: HttpClient,
    private authService: AuthService
    ) {}

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

    students: any[] = [];
    displayedStudents: any[] = [];
    studentCounter: number = 0;
    loadingEleves: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';
    // Filtres & recherche
    searchQuery: string = '';
    filterEtablissement: string ;
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
    newStudent = {
        id: '',
        nom: '',
        prenom: '',
        etablissement: '',
        libStructure: '',
        inscrit: 'non'
    };

    ngOnInit(){
        this.loadEleves();
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
        this.newStudent = {
            id: '',
            nom: '',
            prenom: '',
            etablissement: '',
            libStructure: '',
            inscrit: 'non'
        };
        this.errorMessage = '';
        this.successMessage = '';
    }

    // Ajouter un étudiant
    addStudent() {
        if (!this.newStudent.id || !this.newStudent.nom || 
            !this.newStudent.prenom || !this.newStudent.etablissement) {
            this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
            return;
        }

        this.addingStudent = true;
        this.errorMessage = '';
        this.successMessage = '';

        // Vérifier la présence du token avant l'appel
        const headers = this.getAuthHeaders();
        if (!headers.get('Authorization')) {
            this.errorMessage = 'Authentification requise: token manquant. Veuillez vous reconnecter.';
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
            inscrit: this.newStudent.inscrit === 'oui' ? true : false
        };

        this.http.post<string>('http://localhost:8080/api/admin/eleves',
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
                this.errorMessage = err?.error?.message || 'Erreur lors de l\'ajout de l\'étudiant.';
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



    getAllEleves(): Observable<any[]> {
        return this.http.get<any[]>(
            'http://localhost:8080/api/admin/eleves',
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

        const url = `http://localhost:8080/api/admin/eleves/${encodeURIComponent(id)}`;
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

    // Construire les listes uniques pour les sélecteurs
    private updateMetadata() {
        const etabs = new Set<string>();
        const libs = new Set<string>();
        this.students.forEach(s => {
            if (s.etablissement) etabs.add(String(s.etablissement));
            if (s.libStructure) libs.add(String(s.libStructure));
        });
        this.etablissements = Array.from(etabs).sort();
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
            // Etablissement
            if (filtEt && String(s.etablissement || '').toLowerCase() !== filtEt) return false;
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

        this.http.delete<string>('http://localhost:8080/api/admin/eleves', { headers, responseType: 'text' as 'json' }).subscribe({
            next: (response) => {
                this.successMessage = response || 'Tous les élèves ont été supprimés avec succès.';
                this.students = [];
                this.updateNumbers();
                this.recalcDisplayed();
                setTimeout(() => { this.successMessage = ''; }, 3000);
            },
            error: (err) => {
                console.error('Erreur lors de la suppression de tous les élèves :', err);
                this.errorMessage = (typeof err?.error === 'string' && err.error) || 'Erreur lors de la suppression de tous les élèves.';
            }
        });
    }

    // Importer un fichier Excel
    onFileChange(event: any) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length !== 1) {
            this.errorMessage = 'Veuillez sélectionner un seul fichier Excel (.xlsx ou .xls).';
            return;
        }

        const file: File = input.files[0];

        // Authorization header only (no Content-Type)
        const headers = this.getAuthHeadersForUpload();
        if (!headers.get('Authorization')) {
            this.errorMessage = 'Authentification requise: token manquant. Veuillez vous reconnecter.';
            return;
        }

        const formData = new FormData();
        // Assumes backend expects the field name 'file'
        formData.append('file', file, file.name);

        // Indicate loading and clear messages
        this.loadingEleves = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.http.post<string>('http://localhost:8080/api/admin/eleves/import', formData, { headers, responseType: 'text' as 'json' }).subscribe({
            next: (response) => {
                // Le backend renvoie du texte (plain text), on l'affiche directement
                this.successMessage = response || 'Import réussi. Rafraîchissement de la liste…';
                // clear file input
                input.value = '';
                // reload list from backend
                this.loadEleves();
            },
            error: (err) => {
                console.error('Erreur lors de l\'import du fichier Excel:', err);
                this.errorMessage = (typeof err?.error === 'string' && err.error) || 'Erreur lors de l\'import du fichier.';
                this.loadingEleves = false;
            }
        });
    }
}
