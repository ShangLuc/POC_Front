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
  adminEmail: string = '';
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
    this.adminEmail = '';
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
        next: () => {
          this.authService.setCurrentEleveId(this.eleveIdentifiant);
          this.router.navigate(['/form']); // route vers le formulaire de vœux
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = err?.error || 'Identifiant invalide ou élève introuvable.';
        }
      });

    } else if (this.selectedProfile === 'admin') {
      if (!this.adminEmail || !this.adminPassword) {
        this.errorMessage = 'Merci de saisir email et mot de passe.';
        return;
      }

      this.authService.loginAdmin(this.adminEmail, this.adminPassword).subscribe({
        next: () => {
          this.router.navigate(['/admin']); // adapte cette route à ton écran admin
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = err?.error || 'Identifiants administrateur invalides.';
        }
      });

    } else {
      this.errorMessage = 'Merci de choisir un profil (élève ou admin).';
    }
  }
}