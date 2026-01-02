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

    // Pour afficher le récapitulatif si déjà inscrit
    showRecapitulatif = false;
    voeuxRecapitulatif: any[] = [];

    // Tableaux dynamiques chargés depuis l'API
    conferences: string[] = [];
    tablesRondes: string[] = [];
    flashsMetiers: string[] = [];

    // Mapping dynamique titre -> id
    private titreToId: { [titre: string]: number } = {};

    // Nouveau : descriptifs des événements venant de l'API (titre -> description)
    private titreToDescription: { [titre: string]: string } = {};

    // État du pop-up de descriptif
    selectedEventTitle: string | null = null;
    selectedEventDescription: string | null = null;
    showDescriptionModal = false;

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
        // Charger les événements depuis l'API
        this.loadEvents();

        // Récupérer l'ID de l'élève depuis le localStorage
        const eleveId = localStorage.getItem('eleveId');
        if (eleveId) {
            this.formGroup.patchValue({ id: eleveId });
            // Vérifier si l'élève est déjà inscrit
            this.checkEleveStatus(eleveId);
        }
    }

    // Méthode pour récupérer les headers d'authentification
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

    // Vérifier si l'élève est déjà inscrit
    checkEleveStatus(eleveId: string) {
        const headers = this.getAuthHeaders();
        
        this.http.get<any>(`http://localhost:8080/api/eleves/${eleveId}`, { headers })
            .subscribe({
                next: (eleve) => {
                    if (eleve.inscrit) {
                        // L'élève est déjà inscrit, charger ses vœux
                        this.isConfirmed = true;
                        this.showRecapitulatif = true;
                        this.formGroup.disable();
                        this.loadVoeux(eleveId);
                    }
                },
                error: (err) => {
                    console.error('Erreur lors de la vérification du statut de l\'élève:', err);
                }
            });
    }

    // Charger les vœux de l'élève pour le récapitulatif
    loadVoeux(eleveId: string) {
        const headers = this.getAuthHeaders();
        
        this.http.get<any[]>(`http://localhost:8080/api/eleves/${eleveId}/voeux`, { headers })
            .subscribe({
                next: (voeux) => {
                    this.voeuxRecapitulatif = voeux.sort((a, b) => a.numeroVoeu - b.numeroVoeu);
                },
                error: (err) => {
                    console.error('Erreur lors du chargement des vœux:', err);
                }
            });
    }

    // Charger les événements depuis l'API
    loadEvents() {
        const headers = this.getAuthHeaders();
        
        this.http.get<any[]>('http://localhost:8080/api/activites', { headers })
            .subscribe({
                next: (events) => {
                    // Réinitialiser les tableaux
                    this.conferences = [];
                    this.tablesRondes = [];
                    this.flashsMetiers = [];
                    this.titreToId = {};
                    this.titreToDescription = {};

                    // Trier les événements par type
                    events.forEach(event => {
                        const nom = event.nom;
                        const id = event.id;
                        const description = event.description || '';

                        // Stocker les mappings
                        this.titreToId[nom] = id;
                        this.titreToDescription[nom] = description;

                        // Classer par type
                        if (event.type === 'CONFERENCE') {
                            this.conferences.push(nom);
                        } else if (event.type === 'TABLE_RONDE') {
                            this.tablesRondes.push(nom);
                        } else if (event.type === 'FLASH_METIER') {
                            this.flashsMetiers.push(nom);
                        }
                    });

                    console.log('Événements chargés:', {
                        conferences: this.conferences,
                        tablesRondes: this.tablesRondes,
                        flashsMetiers: this.flashsMetiers
                    });
                },
                error: (err) => {
                    console.error('Erreur lors du chargement des événements:', err);
                    this.messageErreur = 'Erreur lors du chargement des activités disponibles.';
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

        const uniqueVoeux = new Set(voeux);
        if (uniqueVoeux.size !== 5) {
            return 'Tous les vœux doivent être différents.';
        }

        if (!this.conferences.includes(voeuxValues.voeu1)) {
            return 'Le vœu 1 doit être une conférence.';
        }
        if (!this.conferences.includes(voeuxValues.voeu2)) {
            return 'Le vœu 2 doit être une conférence.';
        }

        return '';
    }

    onSave(): void {
        this.messageErreur = '';
        this.messageSucces = '';

        if (!this.formGroup.valid) {
            this.markAllAsTouched();
            return;
        }

        const validationError = this.validateVoeux();
        if (validationError) {
            this.validationMessage = validationError;
            return;
        }

        const raw = this.formGroup.getRawValue();
        const eleveId = raw.id;

        const voeuxTitres = [raw.voeu1, raw.voeu2, raw.voeu3, raw.voeu4, raw.voeu5];
        const eventIds: number[] = voeuxTitres.map(titre => this.titreToId[titre]);

        console.log('Enregistrement des vœux pour élève:', eleveId, 'eventIds:', eventIds);

        this.eleveService.saveVoeux(eleveId, eventIds).subscribe({
            next: (msg: string) => {
                console.log('Vœux enregistrés avec succès, inscription de l\'élève...');
                // Vœux enregistrés, maintenant inscrire l'élève
                this.inscrireEleve(eleveId);
            },
            error: (err) => {
                console.error('Erreur lors de l\'enregistrement des vœux:', err);
                this.messageErreur = err?.error || 'Erreur lors de l\'enregistrement des vœux.';
                console.error(err);
            }
        });
    }

    // Inscrire l'élève (marquer comme inscrit)
    inscrireEleve(eleveId: string) {
        console.log('Appel de inscrireEleve pour:', eleveId);
        const headers = this.getAuthHeaders();
        
        this.http.put<string>(`http://localhost:8080/api/eleves/${eleveId}/inscrire`, {}, 
            { 
                headers: headers,
                responseType: 'text' as 'json'
            }
        ).subscribe({
            next: (response) => {
                console.log('Élève inscrit avec succès:', response);
                this.messageSucces = 'Vos choix ont été confirmés et enregistrés avec succès.';
                this.isConfirmed = true;
                this.showRecapitulatif = true;
                this.formGroup.disable();
                // Charger les vœux pour afficher le récapitulatif
                console.log('Chargement du récapitulatif...');
                this.loadVoeux(eleveId);
            },
            error: (err) => {
                console.error('Erreur lors de l\'inscription de l\'élève:', err);
                this.messageErreur = 'Erreur lors de l\'inscription. Veuillez réessayer.';
            }
        });
    }

    onConfirm(): void {
        this.messageErreur = '';
        this.messageSucces = '';

        if (!this.formGroup.valid) {
            this.markAllAsTouched();
            return;
        }

        const validationError = this.validateVoeux();
        if (validationError) {
            this.validationMessage = validationError;
            return;
        }

        const raw = this.formGroup.getRawValue();
        const eleveId = raw.id;

        this.eleveService.confirmerVoeux(eleveId).subscribe({
            next: (msg: string) => {
                this.isConfirmed = true;
                this.formGroup.disable();
                this.messageSucces = msg || 'Vos choix ont été confirmés et ne peuvent plus être modifiés.';
            },
            error: (err) => {
                this.messageErreur = err?.error || 'Erreur lors de la confirmation des vœux.';
                console.error(err);
            }
        });
    }

    markAllAsTouched() {
        Object.keys(this.formGroup.controls).forEach(key => {
            this.formGroup.get(key)?.markAsTouched();
        });
    }

    // Ouvrir le pop-up descriptif pour un titre donné
    openDescription(titre: string): void {
        this.selectedEventTitle = titre;
        const desc = this.titreToDescription[titre];

        this.selectedEventDescription = desc && desc.trim().length > 0
            ? desc
            : 'Aucun descriptif détaillé disponible pour ce vœu.';
        this.showDescriptionModal = true;
    }

    // Fermer le pop-up descriptif
    closeDescription(): void {
        this.showDescriptionModal = false;
        this.selectedEventTitle = null;
        this.selectedEventDescription = null;
    }
}