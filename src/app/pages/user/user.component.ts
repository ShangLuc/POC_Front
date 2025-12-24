import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AdminManagementService } from '../admin-management.service';

@Component({
    selector: 'user-cmp',
    moduleId: module.id,
    templateUrl: 'user.component.html'
})

export class UserComponent implements OnInit {
    isAdmin: boolean = false;
    isEleve: boolean = false;
    isSuperAdmin: boolean = false;
    adminUsername: string = '';
    adminData: any = null;
    
    // Admin management properties
    admins: any[] = [];
    newAdminUsername: string = '';
    newAdminPassword: string = '';
    showAddAdminForm: boolean = false;
    loadingAdmins: boolean = false;
    successMessage: string = '';
    errorMessage: string = '';

    constructor(
        private authService: AuthService,
        private adminManagementService: AdminManagementService
    ) {}

    ngOnInit() {
        this.isAdmin = this.authService.isAdmin();
        this.isEleve = this.authService.isEleve();
        this.isSuperAdmin = this.authService.getCurrentRole() === 'superadmin';
        
        if (this.isAdmin) {
            this.adminUsername = this.authService.getAdminUsername() || '';
            this.adminData = this.authService.getAdminData();
        }

        // Load admins if superadmin
        if (this.isSuperAdmin) {
            this.loadAdmins();
        }
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
}

