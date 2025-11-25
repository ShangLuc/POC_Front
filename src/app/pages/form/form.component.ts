import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'user-cmp',
    standalone: true,
    templateUrl: 'form.component.html',
    imports: [ReactiveFormsModule, CommonModule]
})

export class FormComponent implements OnInit {
    validationMessage = '';
    isConfirmed = false;

    // Liste des 19 conférences
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

    // Liste des 5 tables rondes
    tablesRondes = [
        'Table ronde: Etre étudiant en BTS (animation par des étudiants)',
        'Table ronde: Etre étudiant en BUT (animation par des étudiants)',
        'Table ronde: Etre étudiant en prépa CPI ou CPGE (animation par des étudiants)',
        'Table ronde: Etre alternant dans l\'enseignement supérieur (animation par des étudiants)',
        'Table ronde: Etre étudiant en Licences (animation par des étudiants)'
    ];

    // Liste des 5 flashs métiers
    flashsMetiers = [
        'Flash métier: ingénieur (animation par des professionnels)',
        'Flash métier: social (animation par des professionnels)',
        'Flash métier: commerce (animation par des professionnels)',
        'Flash métier: sport (animation par des professionnels)',
        'Flash métier: paramédical (animation par des professionnels)',
        'Flash métier: design / architecture (animation par des professionnels)'
    ];

    formGroup: FormGroup;

    constructor() {
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
        const userInfo = {
            Prénom: 'Jean',
            Nom: 'Dupont',
            id: '123456789',
            Etablissement: 'Lycée Victor Hugo',
            Lib: 'Structure A'
        };

        // Mettre à jour les valeurs du formulaire avec les données de l'utilisateur
        this.formGroup.patchValue(userInfo);
    }

    onVoeuChange(): void {
        this.validationMessage = '';
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
        if (this.formGroup.valid) {
            const validationError = this.validateVoeux();
            if (validationError) {
                this.validationMessage = validationError;
                return;
            }
            console.log('Formulaire enregistré:', this.formGroup.getRawValue());
            alert('Vos choix ont été enregistrés. Vous pouvez encore les modifier.');
        } else {
            this.markAllAsTouched();
        }
    }

    onConfirm(): void {
        if (this.formGroup.valid) {
            const validationError = this.validateVoeux();
            if (validationError) {
                this.validationMessage = validationError;
                return;
            }
            this.isConfirmed = true;
            this.formGroup.disable(); // Désactiver le formulaire après confirmation
            console.log('Formulaire confirmé:', this.formGroup.getRawValue());
            alert('Vos choix ont été confirmés et ne peuvent plus être modifiés.');
        } else {
            this.markAllAsTouched();
        }
    }

    markAllAsTouched() {
        Object.keys(this.formGroup.controls).forEach(key => {
            this.formGroup.get(key)?.markAsTouched();
        });
    }
}