import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'dashboard-cmp',
    moduleId: module.id,
    templateUrl: 'activity.component.html'
})

export class ActivityComponent implements OnInit{
    
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

    // Données pour les trois types d'activités
    conferences: any[] = [];
    tablesRondes: any[] = [];
    flashsMetiers: any[] = [];
    
    // Compteurs pour les numéros
    conferenceCounter: number = 0;
    tableRondeCounter: number = 0;
    flashMetierCounter: number = 0;
    
    // Modal state
    activeModal: string = '';
    addingActivity: boolean = false;
    isEditMode: boolean = false;
    editActivityId: string = '';
    errorMessage: string = '';
    successMessage: string = '';
    selectedFile: File | null = null;
    importing: boolean = false;
    newActivity = {
        nom: '',
        description: ''
    };

    ngOnInit(){
        this.loadActivities();
    }

    // Charger les activités depuis le backend
    loadActivities() {
        const headers = this.getAuthHeaders();
        if (!headers.get('Authorization')) {
            this.errorMessage = 'Authentification requise: token manquant. Veuillez vous reconnecter.';
            return;
        }

        this.http.get<any[]>(`${environment.apiUrl}/api/admin/events`, { headers })
            .subscribe({
                next: (activities) => {
                    console.log('Activités chargées:', activities); // Debug log
                    // Reset arrays
                    this.conferences = [];
                    this.tablesRondes = [];
                    this.flashsMetiers = [];
                    this.conferenceCounter = 0;
                    this.tableRondeCounter = 0;
                    this.flashMetierCounter = 0;

                    // Sort activities by type
                    activities.forEach(activity => {
                        // Vérifier que l'activité a bien un ID
                        if (!activity.id) {
                            console.warn('Activité sans ID trouvée:', activity);
                        }

                        const localActivity = {
                            id: activity.id,
                            numero: 0,
                            nom: activity.nom,
                            description: activity.description
                        };

                        if (activity.type === 'CONFERENCE') {
                            this.conferenceCounter++;
                            localActivity.numero = this.conferenceCounter;
                            this.conferences.push(localActivity);
                        } else if (activity.type === 'TABLE_RONDE') {
                            this.tableRondeCounter++;
                            localActivity.numero = this.tableRondeCounter;
                            this.tablesRondes.push(localActivity);
                        } else if (activity.type === 'FLASH_METIER') {
                            this.flashMetierCounter++;
                            localActivity.numero = this.flashMetierCounter;
                            this.flashsMetiers.push(localActivity);
                        }
                    });
                },
                error: (err) => {
                    console.error('Erreur lors du chargement des activités:', err);
                    this.errorMessage = 'Erreur lors du chargement des activités.';
                }
            });
    }

    // Ouvrir une modal
    openModal(type: string) {
        this.activeModal = type;
        this.resetForm();
    }

    // Fermer la modal
    closeModal() {
        this.activeModal = '';
        this.isEditMode = false;
        this.editActivityId = '';
        this.resetForm();
    }

    // Réinitialiser le formulaire
    resetForm() {
        this.newActivity = {
            nom: '',
            description: ''
        };
    }

    // Ajouter une activité
    addActivity(type: string) {
        if (!this.newActivity.nom || !this.newActivity.description) {
            this.errorMessage = 'Veuillez remplir tous les champs';
            return;
        }

        // Vérifier la présence du token avant l'appel
        const headers = this.getAuthHeaders();
        if (!headers.get('Authorization')) {
            this.errorMessage = 'Authentification requise: token manquant. Veuillez vous reconnecter.';
            return;
        }

        this.addingActivity = true;
        this.errorMessage = '';
        this.successMessage = '';

        // Map type to TypeEvent enum
        let typeEvent: string;
        if (type === 'conferences') {
            typeEvent = 'CONFERENCE';
        } else if (type === 'tables_rondes') {
            typeEvent = 'TABLE_RONDE';
        } else if (type === 'flashs_metiers') {
            typeEvent = 'FLASH_METIER';
        } else {
            this.errorMessage = 'Type d\'activité invalide.';
            this.addingActivity = false;
            return;
        }

        const activity = {
            type: typeEvent,
            nom: this.newActivity.nom,
            description: this.newActivity.description
        };

        this.http.post<string>(`${environment.apiUrl}/api/admin/events`,
            activity,
            { 
                headers: headers,
                responseType: 'text' as 'json'
            }
        ).subscribe({
            next: (response) => {
                this.successMessage = 'Activité ajoutée avec succès.';
                this.closeModal();
                // Recharger les activités depuis le backend pour avoir les IDs
                this.loadActivities();
                setTimeout(() => { this.successMessage = ''; }, 3000);
            },
            error: (err) => {
                console.error('Erreur lors de l\'ajout de l\'activité:', err);
                this.errorMessage = err?.error?.message || 'Erreur lors de l\'ajout de l\'activité.';
                this.addingActivity = false;
            },
            complete: () => {
                this.addingActivity = false;
            }
        });
    }

    // Ouvrir la modal en mode édition
    openEditModal(type: string, activity: any) {
        // Vérification de l'ID avant toute chose
        if (!activity || !activity.id) {
            this.errorMessage = 'Erreur: Activité invalide. Veuillez recharger la page.';
            console.error('Tentative d\'édition avec activité invalide:', activity);
            return;
        }

        this.activeModal = type;
        this.isEditMode = true;
        this.editActivityId = activity.id;
        this.newActivity = {
            nom: activity.nom,
            description: activity.description
        };
        this.errorMessage = '';
    }

    // Modifier une activité
    updateActivity() {
        if (!this.newActivity.nom || !this.newActivity.description) {
            this.errorMessage = 'Veuillez remplir tous les champs';
            return;
        }

        const headers = this.getAuthHeaders();
        if (!headers.get('Authorization')) {
            this.errorMessage = 'Authentification requise: token manquant. Veuillez vous reconnecter.';
            return;
        }

        this.addingActivity = true;
        this.errorMessage = '';

        // Map type to TypeEvent enum
        let typeEvent: string;
        if (this.activeModal === 'conferences') {
            typeEvent = 'CONFERENCE';
        } else if (this.activeModal === 'tables_rondes') {
            typeEvent = 'TABLE_RONDE';
        } else if (this.activeModal === 'flashs_metiers') {
            typeEvent = 'FLASH_METIER';
        } else {
            this.errorMessage = 'Type d\'activité invalide.';
            this.addingActivity = false;
            return;
        }

        const activity = {
            type: typeEvent,
            nom: this.newActivity.nom,
            description: this.newActivity.description
        };

        this.http.put<string>(`${environment.apiUrl}/api/admin/events/${this.editActivityId}`,
            activity,
            { 
                headers: headers,
                responseType: 'text' as 'json'
            }
        ).subscribe({
            next: (response) => {
                this.successMessage = 'Activité modifiée avec succès.';
                this.closeModal();
                this.loadActivities();
                setTimeout(() => { this.successMessage = ''; }, 3000);
            },
            error: (err) => {
                console.error('Erreur lors de la modification de l\'activité:', err);
                this.errorMessage = err?.error?.message || 'Erreur lors de la modification de l\'activité.';
                this.addingActivity = false;
            },
            complete: () => {
                this.addingActivity = false;
            }
        });
    }

    // Supprimer une activité
    deleteActivity(type: string, id: string) {
        // Vérification de l'ID avant toute chose
        if (!id || id === 'undefined' || id === undefined) {
            this.errorMessage = 'Erreur: ID de l\'activité manquant. Veuillez recharger la page.';
            console.error('Tentative de suppression avec ID invalide:', id);
            return;
        }

        if (!confirm('Voulez-vous vraiment supprimer cette activité ?')) {
            return;
        }

        const headers = this.getAuthHeaders();
        if (!headers.get('Authorization')) {
            this.errorMessage = 'Authentification requise: token manquant. Veuillez vous reconnecter.';
            return;
        }

        this.http.delete<string>(`${environment.apiUrl}/api/admin/events/${id}`,
            { 
                headers: headers,
                responseType: 'text' as 'json'
            }
        ).subscribe({
            next: (response) => {
                this.successMessage = 'Activité supprimée avec succès.';
                this.loadActivities();
                setTimeout(() => { this.successMessage = ''; }, 3000);
            },
            error: (err) => {
                console.error('Erreur lors de la suppression de l\'activité:', err);
                this.errorMessage = err?.error?.message || 'Erreur lors de la suppression de l\'activité.';
            }
        });
    }

    // Mettre à jour les numéros après suppression
    updateNumbers(type: string) {
        let array = type === 'conferences' ? this.conferences : 
                    type === 'tables_rondes' ? this.tablesRondes : 
                    this.flashsMetiers;
        
        array.forEach((activity, index) => {
            activity.numero = index + 1;
        });
    }

    // Handle file selection
    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            if (!allowedTypes.includes(file.type) && !file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
                this.errorMessage = 'Veuillez sélectionner un fichier Excel (.xls ou .xlsx)';
                event.target.value = '';
                return;
            }
            this.selectedFile = file;
            this.errorMessage = '';
        }
    }

    // Import activities from Excel file
    importActivities(type: string) {
        if (!this.selectedFile) {
            this.errorMessage = 'Veuillez sélectionner un fichier Excel';
            return;
        }

        const headers = this.getAuthHeaders();
        if (!headers.get('Authorization')) {
            this.errorMessage = 'Authentification requise: token manquant. Veuillez vous reconnecter.';
            return;
        }

        this.importing = true;
        this.errorMessage = '';
        this.successMessage = '';

        // Map type to endpoint
        let endpoint: string;
        if (type === 'conferences') {
            endpoint = 'conferences';
        } else if (type === 'tables_rondes') {
            endpoint = 'tables-rondes';
        } else if (type === 'flashs_metiers') {
            endpoint = 'flash-metiers';
        } else {
            this.errorMessage = 'Type d\'activité invalide.';
            this.importing = false;
            return;
        }

        const formData = new FormData();
        formData.append('file', this.selectedFile);

        // Create headers without Content-Type (browser will set it with boundary for FormData)
        const token = this.authService.getAuthToken();
        const uploadHeaders = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        this.http.post<string>(`${environment.apiUrl}/api/admin/events/import/${endpoint}`,
            formData,
            { 
                headers: uploadHeaders,
                responseType: 'text' as 'json'
            }
        ).subscribe({
            next: (response) => {
                this.successMessage = 'Activités importées avec succès.';
                this.selectedFile = null;
                this.loadActivities();
                setTimeout(() => { this.successMessage = ''; }, 3000);
            },
            error: (err) => {
                console.error('Erreur lors de l\'importation des activités:', err);
                this.errorMessage = err?.error?.message || 'Erreur lors de l\'importation des activités.';
                this.importing = false;
            },
            complete: () => {
                this.importing = false;
            }
        });
    }

    // Clear selected file
    clearSelectedFile() {
        this.selectedFile = null;
        this.errorMessage = '';
    }

    // New: handle Excel selection and import immediately for given type
    onExcelFileSelected(
        type: 'conferences' | 'tables_rondes' | 'flashs_metiers',
        event: Event
    ) {
        const input = event.target as HTMLInputElement;
        const file = input?.files && input.files.length ? input.files[0] : null;
        if (!file) return;

        const allowedTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (!allowedTypes.includes(file.type) && !file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
            this.errorMessage = 'Veuillez sélectionner un fichier Excel (.xls ou .xlsx)';
            input.value = '';
            return;
        }

        this.selectedFile = file;
        this.errorMessage = '';

        // trigger upload for this activity type
        this.importActivities(type);

        // reset input to allow re-selecting the same file later
        input.value = '';
    }
}
