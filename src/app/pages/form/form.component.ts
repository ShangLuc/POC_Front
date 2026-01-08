import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EleveService } from '../eleve.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
    selector: 'user-cmp',
    standalone: true,
    templateUrl: 'form.component.html',
    imports: [ReactiveFormsModule, CommonModule],
    providers: [EleveService]
})
export class FormComponent implements OnInit {
    validationMessage = '';
    isConfirmed = false;
    messageSucces = '';
    messageErreur = '';
    showRecapitulatif = false;
    voeuxRecapitulatif: any[] = [];
    conferences: string[] = [];
    tablesRondes: string[] = [];
    flashsMetiers: string[] = [];
    private titreToId: { [titre: string]: number } = {};
    private titreToDescription: { [titre: string]: string } = {};

    // Modal de confirmation
    showConfirmationModal = false;

    // Modal d'activité
    showActivityModal = false;
    selectedActivityName = '';
    selectedActivityDescription = '';

    formGroup: FormGroup;

    constructor(
        private eleveService: EleveService,
        private http: HttpClient,
        private authService: AuthService
    ) {
        this.formGroup = new FormGroup({
            Prénom: new FormControl({ value: '', disabled: true }),
            Nom: new FormControl({ value: '', disabled: true }),
            id: new FormControl({ value: '', disabled: true }),
            Etablissement: new FormControl({ value: '', disabled: true }),
            Lib: new FormControl({ value: '', disabled: true }),
            voeu1: new FormControl('', Validators.required),
            voeu2: new FormControl('', Validators.required),
            voeu3: new FormControl('', Validators.required),
            voeu4: new FormControl('', Validators.required),
            voeu5: new FormControl('', Validators.required)
        });
    }

    ngOnInit() {
        this.loadEvents();
        const eleveId = localStorage.getItem('eleveId');
        if (eleveId) {
            this.formGroup.patchValue({ id: eleveId });
            this.checkEleveStatus(eleveId);
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
        return new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    checkEleveStatus(eleveId: string) {
        const headers = this.getAuthHeaders();
        this.http.get<any>(`http://localhost:8080/api/eleves/${eleveId}`, { headers })
            .subscribe({
                next: (eleve) => {
                    if (eleve.inscrit) {
                        this.isConfirmed = true;
                        this.showRecapitulatif = true;
                        this.formGroup.disable();
                        this.loadVoeux(eleveId);
                    }
                },
                error: (err) => console.error('Erreur statut élève:', err)
            });
    }

    loadVoeux(eleveId: string) {
        const headers = this.getAuthHeaders();
        this.http.get<any[]>(`http://localhost:8080/api/eleves/${eleveId}/voeux`, { headers })
            .subscribe({
                next: (voeux) => {
                    this.voeuxRecapitulatif = voeux.sort((a, b) => a.numeroVoeu - b.numeroVoeu);
                },
                error: (err) => console.error('Erreur chargement vœux:', err)
            });
    }

    loadEvents() {
        const headers = this.getAuthHeaders();
        this.http.get<any[]>('http://localhost:8080/api/activites', { headers })
            .subscribe({
                next: (events) => {
                    this.conferences = [];
                    this.tablesRondes = [];
                    this.flashsMetiers = [];
                    this.titreToId = {};
                    this.titreToDescription = {};

                    events.forEach(event => {
                        const nom = event.nom;
                        this.titreToId[nom] = event.id;
                        this.titreToDescription[nom] = event.description || '';

                        if (event.type === 'CONFERENCE') {
                            this.conferences.push(nom);
                        } else if (event.type === 'TABLE_RONDE') {
                            this.tablesRondes.push(nom);
                        } else if (event.type === 'FLASH_METIER') {
                            this.flashsMetiers.push(nom);
                        }
                    });
                },
                error: (err) => {
                    console.error('Erreur chargement événements:', err);
                    this.messageErreur = 'Erreur lors du chargement des activités.';
                }
            });
    }

    onVoeuChange(): void {
        this.validationMessage = '';
        this.messageErreur = '';
        this.messageSucces = '';
    }

    isVoeuSelected(voeu: string, currentField: string): boolean {
        const voeux = ['voeu1', 'voeu2', 'voeu3', 'voeu4', 'voeu5'];
        for (const v of voeux) {
            if (v !== currentField && this.formGroup.get(v)?.value === voeu) {
                return true;
            }
        }
        return false;
    }

    validateVoeux(): string {
        const voeuxValues = this.formGroup.getRawValue();
        const voeux = [voeuxValues.voeu1, voeuxValues.voeu2, voeuxValues.voeu3, voeuxValues.voeu4, voeuxValues.voeu5];
        if (new Set(voeux).size !== 5) return 'Tous les vœux doivent être différents.';
        if (!this.conferences.includes(voeuxValues.voeu1)) return 'Le vœu 1 doit être une conférence.';
        if (!this.conferences.includes(voeuxValues.voeu2)) return 'Le vœu 2 doit être une conférence.';
        if (!this.conferences.includes(voeuxValues.voeu3)) return 'Le vœu 3 doit être une conférence.';
        return '';
    }

    onSave(): void {
        this.messageErreur = '';
        this.messageSucces = '';
        this.validationMessage = '';

        if (!this.formGroup.valid) {
            this.markAllAsTouched();
            return;
        }

        const validationError = this.validateVoeux();
        if (validationError) {
            this.validationMessage = validationError;
            return;
        }

        // Ouvrir le modal de confirmation au lieu d'envoyer directement
        this.showConfirmationModal = true;
    }

    confirmSubmit(): void {
        // Fermer le modal
        this.showConfirmationModal = false;

        const raw = this.formGroup.getRawValue();
        const eleveId = raw.id;

        const voeuxTitres = [raw.voeu1, raw.voeu2, raw.voeu3, raw.voeu4, raw.voeu5];
        const eventIds: number[] = voeuxTitres.map(titre => this.titreToId[titre]);

        console.log('Enregistrement des vœux pour élève:', eleveId, 'eventIds:', eventIds);

        this.eleveService.saveVoeux(eleveId, eventIds).subscribe({
            next: () => {
                console.log('Vœux enregistrés avec succès, inscription de l\'élève...');
                this.inscrireEleve(eleveId);
            },
            error: (err) => {
                console.error('Erreur lors de l\'enregistrement des vœux:', err);
                this.messageErreur = err?.error || 'Erreur lors de l\'enregistrement des vœux.';
            }
        });
    }

    inscrireEleve(eleveId: string) {
        const headers = this.getAuthHeaders();
        this.http.put<string>(`http://localhost:8080/api/eleves/${eleveId}/inscrire`, {}, 
            { headers, responseType: 'text' as 'json' }
        ).subscribe({
            next: () => {
                this.messageSucces = 'Vos choix ont été confirmés et enregistrés avec succès.';
                this.isConfirmed = true;
                this.showRecapitulatif = true;
                this.formGroup.disable();
                this.loadVoeux(eleveId);
            },
            error: () => {
                this.messageErreur = 'Erreur lors de l\'inscription. Veuillez réessayer.';
            }
        });
    }

    openActivityModal(activityName: string): void {
        if (!activityName) return;
        this.selectedActivityName = activityName;
        const description = this.titreToDescription[activityName];
        this.selectedActivityDescription = description && description.trim().length > 0
            ? description
            : 'Aucune description disponible pour cette activité.';
        this.showActivityModal = true;
    }

    closeActivityModal(): void {
        this.showActivityModal = false;
        this.selectedActivityName = '';
        this.selectedActivityDescription = '';
    }

    closeConfirmationModal(): void {
        this.showConfirmationModal = false;
    }

    markAllAsTouched() {
        Object.keys(this.formGroup.controls).forEach(key => {
            this.formGroup.get(key)?.markAsTouched();
        });
    }
}