import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'dashboard-cmp',
    moduleId: module.id,
    templateUrl: 'auth.component.html'
})

export class AuthComponent implements OnInit{
    selectedProfile: string = '';
    eleveIdentifiant: string = '';
    adminEmail: string = '';
    adminPassword: string = '';
    
    // Paramètres réglables pour le bouton retour
    backButtonColor: string = '#999999';
    backButtonFontSize: string = '0.875rem';
    backButtonTextDecoration: string = 'none';

    ngOnInit(){}

    selectProfile(profile: string) {
        this.selectedProfile = profile;
        this.eleveIdentifiant = '';
        this.adminEmail = '';
        this.adminPassword = '';
    }

    authenticate() {
        if (this.selectedProfile === 'eleve') {
            console.log('Authentification Élève avec identifiant:', this.eleveIdentifiant);
            // Add your eleve authentication logic here
        } else if (this.selectedProfile === 'admin') {
            console.log('Authentification Admin avec email:', this.adminEmail);
            // Add your admin authentication logic here
        }
    }
}
