import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'dashboard-cmp',
  moduleId: module.id,
  templateUrl: 'auth.component.html'
})
export class AuthComponent implements OnInit {
  selectedProfile: string = '';
  eleveIdentifiant: string = '';
  adminUsername: string = '';
  adminPassword: string = '';

  // Paramètres réglables pour le bouton retour
  backButtonColor: string = '#999999';
  backButtonFontSize: string = '0.875rem';
  backButtonTextDecoration: string = 'none';

  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {}

  selectProfile(profile: string) {
    this.selectedProfile = profile;
    this.eleveIdentifiant = '';
    this.adminUsername = '';
    this.adminPassword = '';
    this.errorMessage = '';
  }

  authenticate() {
    this.errorMessage = '';

    if (this.selectedProfile === 'eleve') {
      if (!this.eleveIdentifiant) {
        this.errorMessage = 'Merci de saisir ton identifiant élève.';
        return;
      }

      this.authService.loginEleve(this.eleveIdentifiant).subscribe({
        next: (response) => {
          const storedId = response?.id || this.eleveIdentifiant;
          this.authService.setCurrentEleveId(storedId);
          this.router.navigate(['/accueil']); // accès accueil + profil + formulaire
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = err?.error || 'Identifiant invalide ou élève introuvable.';
        }
      });

    } else if (this.selectedProfile === 'admin') {
      if (!this.adminUsername || !this.adminPassword) {
        this.errorMessage = 'Merci de saisir votre nom d\'utilisateur et votre mot de passe.';
        return;
      }

      this.authService.loginAdmin(this.adminUsername, this.adminPassword).subscribe({
        next: () => {
          this.router.navigate(['/accueil']); // adapte cette route à ton écran admin
        },
        error: (err) => {
          console.error(err);
          // Display the error message from the API if available
          if (err?.error && typeof err.error === 'string') {
            this.errorMessage = err.error;
          } else if (err?.error?.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Identifiants administrateur invalides.';
          }
        }
      });

    } else {
      this.errorMessage = 'Merci de choisir un profil (élève ou admin).';
    }
  }
}