import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { AdminManagementService } from '../admin-management.service';
import { EleveService } from '../eleve.service';
import { Eleve } from '../../models/eleve.model';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'user-cmp',
    moduleId: module.id,
    templateUrl: 'user.component.html'
})

export class UserComponent implements OnInit, OnDestroy {
    private subscriptions = new Subscription();
    
    isAdmin: boolean = false;
    isEleve: boolean = false;
    isViewer: boolean = false;
    isSuperAdmin: boolean = false;
    adminUsername: string = '';
    adminData: any = null;

    student?: Eleve;
    isStudentLoading = false;
    profileErrorMessage = '';

    // viewer data
    viewerUsername: string = '';
    viewerEtablissement: string = '';

    // Admin management properties
    admins: any[] = [];
    newAdminUsername: string = '';
    newAdminPassword: string = '';
    showAddAdminForm: boolean = false;
    loadingAdmins: boolean = false;
    successMessage: string = '';
    errorMessage: string = '';

    // Viewer (Référent) management properties
    viewers: any[] = [];
    newViewerLycee: string = '';
    newViewerUsername: string = '';
    newViewerPasswordInput: string = '';  // Add this line
    showAddViewerForm: boolean = false;
    loadingViewers: boolean = false;
    viewerSuccessMessage: string = '';
    viewerErrorMessage: string = '';

    // Liste des lycées existants en base pour le filtrage/choix

    // TrackBy functions pour optimiser le rendu
    trackByUsername(index: number, item: any): string {
        return item.username || index.toString();
    }

    trackByValue(index: number, value: any): any {
        return value;
    }
    lycees: string[] = [];

    // Password change properties
    currentPassword: string = '';
    newPassword: string = '';
    confirmNewPassword: string = '';
    showPasswordForm: boolean = false;
    passwordSuccessMessage: string = '';
    passwordErrorMessage: string = '';
    isChangingPassword: boolean = false;

    // Viewer password change properties
    currentViewerPassword: string = '';
    newViewerPassword: string = '';
    confirmNewViewerPassword: string = '';
    showViewerPasswordForm: boolean = false;
    viewerPasswordSuccessMessage: string = '';
    viewerPasswordErrorMessage: string = '';
    isChangingViewerPassword: boolean = false;

    constructor(
        private authService: AuthService,
        private adminManagementService: AdminManagementService,
        private eleveService: EleveService,
        private http: HttpClient
    ) { }

    ngOnInit() {
        this.isAdmin = this.authService.isAdmin();
        this.isEleve = this.authService.isEleve();
        this.isViewer = this.authService.isViewer();
        this.isSuperAdmin = this.authService.getCurrentRole() === 'superadmin';

        if (this.isAdmin) {
            this.adminUsername = this.authService.getAdminUsername() || '';
            this.adminData = this.authService.getAdminData();
        }

        if (this.isEleve) {
            this.loadStudentProfile();
        }

        // Load admins and viewers if superadmin
        if (this.isSuperAdmin) {
            this.loadAdmins();
            this.loadViewers();
            this.loadLycees();
        }

        if (this.isViewer) {
            this.viewerUsername = JSON.parse(localStorage.getItem('viewerData') || '')?.username || '';
            this.viewerEtablissement = JSON.parse(localStorage.getItem('viewerData') || '')?.etablissement || '';
        }



    }


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

    // Charge la liste des lycées existants en base (même logique que DashboardComponent)
    private loadLycees(): void {
        this.http.get<string[]>(
            `${environment.apiUrl}/api/eleves/lycees`,
            { headers: this.getAuthHeaders() }
        ).subscribe({
            next: (lycees) => {
                this.lycees = lycees || [];
            },
            error: (err: HttpErrorResponse) => {
                console.error('Erreur lors du chargement des lycées', err);
            }
        });
    }




    private loadStudentProfile(): void {
        this.profileErrorMessage = '';
        const eleveId = this.authService.getCurrentEleveId();

        if (!eleveId) {
            this.profileErrorMessage = 'Aucun identifiant élève n\'a été trouvé. Merci de te reconnecter.';
            return;
        }

        this.isStudentLoading = true;
        this.eleveService.getEleveById(eleveId).subscribe({
            next: (eleve) => {
                this.student = eleve;
                this.isStudentLoading = false;
            },
            error: (err: HttpErrorResponse) => {
                console.error('Erreur lors du chargement du profil élève', err);
                if (err.status === 403) {
                    this.profileErrorMessage = 'L\'accès aux données du profil est restreint. Merci de te reconnecter.';
                } else {
                    this.profileErrorMessage = 'Impossible de charger le profil élève pour le moment.';
                }
                this.isStudentLoading = false;
            }
        });
    }

    // Load all admins
    loadAdmins() {
        this.loadingAdmins = true;
        this.errorMessage = '';
        this.subscriptions.add(
            this.adminManagementService.getAllAdmins().subscribe({
                next: (response) => {
                this.admins = response;
                this.loadingAdmins = false;
            },
            error: (err) => {
                console.error('Error loading admins:', err);
                this.errorMessage = 'Erreur lors du chargement des administrateurs.';
                this.loadingAdmins = false;
            }
            })
        );
    }

    // Add new admin
    addAdmin() {
        if (!this.newAdminUsername || !this.newAdminPassword) {
            this.errorMessage = 'Veuillez remplir le nom d\'utilisateur et le mot de passe.';
            return;
        }

        this.errorMessage = '';
        this.successMessage = '';

        this.adminManagementService.addAdmin(this.newAdminUsername, this.newAdminPassword).subscribe({
            next: (response) => {
                this.successMessage = 'Administrateur ajouté avec succès.';
                this.newAdminUsername = '';
                this.newAdminPassword = '';
                this.showAddAdminForm = false;
                this.loadAdmins(); // Reload the list
            },
            error: (err) => {
                console.error('Error adding admin:', err);
                this.errorMessage = err?.error?.message || 'Erreur lors de l\'ajout de l\'administrateur.';
            }
        });
    }

    // Delete admin with confirmation
    deleteAdmin(admin: any) {
        const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer l'administrateur "${admin.username}"?`);

        if (!confirmDelete) {
            return;
        }

        this.errorMessage = '';
        this.successMessage = '';

        this.adminManagementService.deleteAdmin(admin.id).subscribe({
            next: () => {
                this.successMessage = `Administrateur "${admin.username}" supprimé avec succès.`;
                this.loadAdmins(); // Reload the list
            },
            error: (err) => {
                console.error('Error deleting admin:', err);
                this.errorMessage = err?.error?.message || 'Erreur lors de la suppression de l\'administrateur.';
            }
        });
    }

    // Cancel adding admin
    cancelAddAdmin() {
        this.showAddAdminForm = false;
        this.newAdminUsername = '';
        this.newAdminPassword = '';
        this.errorMessage = '';
    }

    // Load all viewers
    loadViewers() {
        this.loadingViewers = true;
        this.viewerErrorMessage = '';
        this.subscriptions.add(
            this.adminManagementService.getAllViewers().subscribe({
                next: (response) => {
                    console.log('Viewers from backend:', response);
                console.log('First viewer object:', response[0]);
                this.viewers = response;
                this.loadingViewers = false;
            },
            error: (err) => {
                console.error('Error loading viewers:', err);
                this.viewerErrorMessage = 'Erreur lors du chargement des référents.';
                this.loadingViewers = false;
            }
            })
        );
    }

    // Add new viewer
    addViewer() {
        if (!this.newViewerLycee || !this.newViewerUsername || !this.newViewerPasswordInput) {
            this.viewerErrorMessage = 'Veuillez remplir tous les champs.';
            return;
        }

        console.log('Adding viewer with lycee:', this.newViewerLycee, 'username:', this.newViewerUsername);

        this.viewerErrorMessage = '';
        this.viewerSuccessMessage = '';

        this.adminManagementService.addViewer(this.newViewerUsername, this.newViewerPasswordInput, this.newViewerLycee).subscribe({
            next: (response) => {
                this.viewerSuccessMessage = 'Référent ajouté avec succès.';
                this.newViewerLycee = '';
                this.newViewerUsername = '';
                this.newViewerPasswordInput = '';
                this.showAddViewerForm = false;
                this.loadViewers(); // Reload the list
            },
            error: (err) => {
                console.error('Error adding viewer:', err);
                this.viewerErrorMessage = err?.error?.message || 'Erreur lors de l\'ajout du référent.';
            }
        });
    }

    // Delete viewer with confirmation
    deleteViewer(viewer: any) {
        const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer le référent "${viewer.username}"?`);

        if (!confirmDelete) {
            return;
        }

        this.viewerErrorMessage = '';
        this.viewerSuccessMessage = '';

        this.adminManagementService.deleteViewer(viewer.id).subscribe({
            next: () => {
                this.viewerSuccessMessage = `Référent "${viewer.username}" supprimé avec succès.`;
                this.loadViewers(); // Reload the list
            },
            error: (err) => {
                console.error('Error deleting viewer:', err);
                this.viewerErrorMessage = err?.error?.message || 'Erreur lors de la suppression du référent.';
            }
        });
    }

    // Cancel adding viewer
    cancelAddViewer() {
        this.showAddViewerForm = false;
        this.newViewerLycee = '';
        this.newViewerUsername = '';
        this.newViewerPasswordInput = '';
        this.viewerErrorMessage = '';
    }

    // Change password
    changePassword() {
        // Reset messages
        this.passwordErrorMessage = '';
        this.passwordSuccessMessage = '';

        // Validation
        if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
            this.passwordErrorMessage = 'Veuillez remplir tous les champs.';
            return;
        }

        if (this.newPassword !== this.confirmNewPassword) {
            this.passwordErrorMessage = 'Les nouveaux mots de passe ne correspondent pas.';
            return;
        }

        if (this.newPassword.length < 6) {
            this.passwordErrorMessage = 'Le nouveau mot de passe doit contenir au moins 6 caractères.';
            return;
        }

        this.isChangingPassword = true;

        this.adminManagementService.changePassword(this.currentPassword, this.newPassword, this.isSuperAdmin).subscribe({
            next: (response) => {
                this.passwordSuccessMessage = 'Mot de passe modifié avec succès.';
                this.currentPassword = '';
                this.newPassword = '';
                this.confirmNewPassword = '';
                this.showPasswordForm = false;
                this.isChangingPassword = false;
            },
            error: (err) => {
                console.error('Error changing password:', err);
                this.passwordErrorMessage = err?.error?.message || err?.error || 'Erreur lors du changement de mot de passe.';
                this.isChangingPassword = false;
            }
        });
    }

    // Cancel password change
    cancelPasswordChange() {
        this.showPasswordForm = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
        this.passwordErrorMessage = '';
        this.passwordSuccessMessage = '';
    }

    // Change viewer password
    changeViewerPassword() {
        // Reset messages
        this.viewerPasswordErrorMessage = '';
        this.viewerPasswordSuccessMessage = '';

        // Validation
        if (!this.currentViewerPassword || !this.newViewerPassword || !this.confirmNewViewerPassword) {
            this.viewerPasswordErrorMessage = 'Veuillez remplir tous les champs.';
            return;
        }

        if (this.newViewerPassword !== this.confirmNewViewerPassword) {
            this.viewerPasswordErrorMessage = 'Les nouveaux mots de passe ne correspondent pas.';
            return;
        }

        if (this.newViewerPassword.length < 6) {
            this.viewerPasswordErrorMessage = 'Le nouveau mot de passe doit contenir au moins 6 caractères.';
            return;
        }

        this.isChangingViewerPassword = true;

        this.adminManagementService.changeViewerPassword(this.currentViewerPassword, this.newViewerPassword).subscribe({
            next: (response) => {
                this.viewerPasswordSuccessMessage = 'Mot de passe modifié avec succès.';
                this.currentViewerPassword = '';
                this.newViewerPassword = '';
                this.confirmNewViewerPassword = '';
                this.showViewerPasswordForm = false;
                this.isChangingViewerPassword = false;
            },
            error: (err) => {
                console.error('Error changing password:', err);
                this.viewerPasswordErrorMessage = err?.error?.message || err?.error || 'Erreur lors du changement de mot de passe.';
                this.isChangingViewerPassword = false;
            }
        });
    }

    // Cancel viewer password change
    cancelViewerPasswordChange() {
        this.showViewerPasswordForm = false;
        this.currentViewerPassword = '';
        this.newViewerPassword = '';
        this.confirmNewViewerPassword = '';
        this.viewerPasswordErrorMessage = '';
        this.viewerPasswordSuccessMessage = '';
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
}

