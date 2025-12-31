import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EleveService } from '../eleve.service';


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

    
    conferences = [
        'Etudes et métiers des arts, de la culture et du design',
        'Etudes et métiers du commerce',
        'Les études médicales',
        'Management économie gestion Licences CPGE',
        'Sciences et innovations technologiques BTS BUT',
        'Sociologie, sciences de l\'éducation, histoire géographie Licences CPGE',
        'Etudes et métiers de l\'informatique et du numérique',
        'Etudes et métiers du droit - Science Po',
        'Etudes et métiers du soin et de la santé',
        'Etudes et métiers du tourisme et de l\'hôtellerie BTS',
        'Etudes et métiers de l\'habitat et de la construction',
        'Sciences et techniques Licence CPGE',
        'Etudes et métiers de l\'ingénieur',
        'Etudes et métiers du management, économie, gestion (BTS/BUT)',
        'Etudes et métiers du secteur social',
        'Etudes et métiers du sport',
        'Lettres et langues Licences CPGE',
        'Sciences de la vie, de l\'environnement et de l\'agronomie BTS BUT',
        'Etre étudiant _ Parcoursup'
    ];

   
    tablesRondes = [
        'Table ronde: Etre étudiant en BTS (animation par des étudiants)',
        'Table ronde: Etre étudiant en BUT (animation par des étudiants)',
        'Table ronde: Etre étudiant en prépa CPI ou CPGE (animation par des étudiants)',
        'Table ronde: Etre alternant dans l\'enseignement supérieur (animation par des étudiants)',
        'Table ronde: Etre étudiant en Licences (animation par des étudiants)'
    ];

    
    flashsMetiers = [
        'Flash métier: ingénieur (animation par des professionnels)',
        'Flash métier: social (animation par des professionnels)',
        'Flash métier: commerce (animation par des professionnels)',
        'Flash métier: sport (animation par des professionnels)',
        'Flash métier: paramédical (animation par des professionnels)',
        'Flash métier: design / architecture (animation par des professionnels)'
    ];

    // Mapping simple titre -> id_event en base
    private titreToId: { [titre: string]: number } = {
        'Etudes et métiers des arts, de la culture et du design':1,
        'Etudes et métiers du commerce':2,
        'Les études médicales':3,
        'Management économie gestion Licences CPGE':4,
        'Sciences et innovations technologiques BTS BUT':5,
        'Sociologie, sciences de l\'éducation, histoire géographie Licences CPGE':6,
        'Etudes et métiers de l\'informatique et du numérique':7,
        'Etudes et métiers du droit - Science Po':8,
        'Etudes et métiers du soin et de la santé':9,
        'Etudes et métiers du tourisme et de l\'hôtellerie BTS':10,
        'Etudes et métiers de l\'habitat et de la construction':11,
        'Sciences et techniques Licence CPGE':12,
        'Etudes et métiers de l\'ingénieur':13,
        'Etudes et métiers du management, économie, gestion (BTS/BUT)':14,
        'Etudes et métiers du secteur social':15,
        'Etudes et métiers du sport':16,
        'Lettres et langues Licences CPGE':17,
        'Sciences de la vie, de l\'environnement et de l\'agronomie BTS BUT':18,
        'Etre étudiant _ Parcoursup':19,
        // TABLE RONDES
        'Table ronde: Etre étudiant en BTS (animation par des étudiants)': 20,
        'Table ronde: Etre étudiant en BUT (animation par des étudiants)':21,
        'Table ronde: Etre étudiant en prépa CPI ou CPGE (animation par des étudiants)':22,
        'Table ronde: Etre alternant dans l\'enseignement supérieur (animation par des étudiants)':23,
        'Table ronde: Etre étudiant en Licences (animation par des étudiants)':24,
        // FLASH METIERS
        'Flash métier: ingénieur (animation par des professionnels)':25,
        'Flash métier: social (animation par des professionnels)':26,
        'Flash métier: commerce (animation par des professionnels)':27,
        'Flash métier: sport (animation par des professionnels)':28,
        'Flash métier: paramédical (animation par des professionnels)':29,
        'Flash métier: design / architecture (animation par des professionnels)':30

    };

    formGroup: FormGroup;

    constructor(private eleveService: EleveService) {
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
        // Simuler la récupération des informations de l'utilisateur
        // Dans une application réelle, ces données viendraient d'un service d'authentification
        // const userInfo = {
        //     Prénom: 'Jean',
        //     Nom: 'Dupont',
        //     id: '123456789',
        //     Etablissement: 'Lycée Victor Hugo',
        //     Lib: 'Structure A'
        // };

        // Mettre à jour les valeurs du formulaire avec les données de l'utilisateur
        // this.formGroup.patchValue(userInfo);
        const eleveId = localStorage.getItem('eleveId');
        if(eleveId){
            this.formGroup.patchValue({ id: eleveId });
        }
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
}