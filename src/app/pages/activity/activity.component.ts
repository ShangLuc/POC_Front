import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';


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
    newActivity = {
        nom: '',
        description: '',
        capacite: ''
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

        this.http.get<any[]>('http://localhost:8080/api/admin/events', { headers })
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
                            description: activity.description,
                            capacite: activity.capacite
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
            description: '',
            capacite: ''
        };
    }

    // Ajouter une activité
    addActivity(type: string) {
        if (!this.newActivity.nom || !this.newActivity.capacite || !this.newActivity.description) {
            this.errorMessage = 'Veuillez remplir tous les champs';
            return;
        }

        // Valider la capacité : doit être un entier positif > 0
        const capacite = Number(this.newActivity.capacite);
        if (isNaN(capacite) || capacite <= 0 || !Number.isInteger(capacite)) {
            this.errorMessage = 'La capacité doit être un nombre entier positif supérieur à 0';
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
            description: this.newActivity.description,
            capacite: this.newActivity.capacite
        };

        this.http.post<string>('http://localhost:8080/api/admin/events',
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
            description: activity.description,
            capacite: activity.capacite
        };
        this.errorMessage = '';
    }

    // Modifier une activité
    updateActivity() {
        if (!this.newActivity.nom || !this.newActivity.capacite || !this.newActivity.description) {
            this.errorMessage = 'Veuillez remplir tous les champs';
            return;
        }

        // Valider la capacité : doit être un entier positif > 0
        const capacite = Number(this.newActivity.capacite);
        if (isNaN(capacite) || capacite <= 0 || !Number.isInteger(capacite)) {
            this.errorMessage = 'La capacité doit être un nombre entier positif supérieur à 0';
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
            description: this.newActivity.description,
            capacite: this.newActivity.capacite
        };

        this.http.put<string>(`http://localhost:8080/api/admin/events/${this.editActivityId}`,
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

        this.http.delete<string>(`http://localhost:8080/api/admin/events/${id}`,
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
}
