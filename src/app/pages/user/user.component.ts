import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { AdminManagementService } from '../admin-management.service';
import { EleveService } from '../eleve.service';
import { Eleve } from '../../models/eleve.model';

@Component({
    selector: 'user-cmp',
    moduleId: module.id,
    templateUrl: 'user.component.html'
})

export class UserComponent implements OnInit {
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

    // Viewer (Référant) management properties
    viewers: any[] = [];
    newViewerLycee: string = '';
    newViewerUsername: string = '';
    showAddViewerForm: boolean = false;
    loadingViewers: boolean = false;
    viewerSuccessMessage: string = '';
    viewerErrorMessage: string = '';

    // Password change properties
    currentPassword: string = '';
    newPassword: string = '';
    confirmNewPassword: string = '';
    showPasswordForm: boolean = false;
    passwordSuccessMessage: string = '';
    passwordErrorMessage: string = '';
    isChangingPassword: boolean = false;

    constructor(
        private authService: AuthService,
        private adminManagementService: AdminManagementService,
        private eleveService: EleveService
    ) {}

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
        }

        if (this.isViewer) {
            this.viewerUsername = this.authService.viewerData?.username || '';
            this.viewerEtablissement  = this.authService.viewerData?.etablissement || '';
        }



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
        });
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
        this.adminManagementService.getAllViewers().subscribe({
            next: (response) => {
                console.log('Viewers from backend:', response);
                console.log('First viewer object:', response[0]);
                this.viewers = response;
                this.loadingViewers = false;
            },
            error: (err) => {
                console.error('Error loading viewers:', err);
                this.viewerErrorMessage = 'Erreur lors du chargement des référants.';
                this.loadingViewers = false;
            }
        });
    }

    // Add new viewer
    addViewer() {
        if ( !this.newViewerLycee || !this.newViewerUsername) {
            this.viewerErrorMessage = 'Veuillez remplir tous les champs.';
            return;
        }

        console.log('Adding viewer with lycee:', this.newViewerLycee, 'username:', this.newViewerUsername);
        
        this.viewerErrorMessage = '';
        this.viewerSuccessMessage = '';

        this.adminManagementService.addViewer(this.newViewerUsername, this.newViewerLycee ).subscribe({
            next: (response) => {
                this.viewerSuccessMessage = 'Référant ajouté avec succès.';
                this.newViewerLycee = '';
                this.newViewerUsername = '';
                this.showAddViewerForm = false;
                this.loadViewers(); // Reload the list
            },
            error: (err) => {
                console.error('Error adding viewer:', err);
                this.viewerErrorMessage = err?.error?.message || 'Erreur lors de l\'ajout du référant.';
            }
        });
    }

    // Delete viewer with confirmation
    deleteViewer(viewer: any) {
        const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer le référant "${viewer.username}"?`);
        
        if (!confirmDelete) {
            return;
        }

        this.viewerErrorMessage = '';
        this.viewerSuccessMessage = '';

        this.adminManagementService.deleteViewer(viewer.id).subscribe({
            next: () => {
                this.viewerSuccessMessage = `Référant "${viewer.username}" supprimé avec succès.`;
                this.loadViewers(); // Reload the list
            },
            error: (err) => {
                console.error('Error deleting viewer:', err);
                this.viewerErrorMessage = err?.error?.message || 'Erreur lors de la suppression du référant.';
            }
        });
    }

    // Cancel adding viewer
    cancelAddViewer() {
        this.showAddViewerForm = false;
        this.newViewerLycee = '';
        this.newViewerUsername = '';
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
}

