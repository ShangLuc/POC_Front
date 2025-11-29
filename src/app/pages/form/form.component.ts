import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'user-cmp',
    standalone: true,
    templateUrl: 'form.component.html',
    imports: [ReactiveFormsModule, CommonModule]
})

export class FormComponent {
    currentStep = 1;
    validationMessage = '';

    
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

    formGroup = new FormGroup({
        // Étape 1
        // Prénom: new FormControl('', [Validators.required, Validators.maxLength(15)]),
        // Nom: new FormControl('', [Validators.required, Validators.maxLength(15)]),
        id: new FormControl('', [Validators.required, Validators.maxLength(15)]),
        Etablissement: new FormControl('', Validators.required),
        Lib: new FormControl('', [Validators.required, Validators.maxLength(11)]),
        
        // Étape 2 - Vœux
        voeu1: new FormControl('', Validators.required),
        voeu2: new FormControl('', Validators.required),
        voeu3: new FormControl('', Validators.required),
        voeu4: new FormControl('', Validators.required),
        voeu5: new FormControl('', Validators.required)
    });

    isStep1Valid(): boolean {
        // const prenom = this.formGroup.get('Prénom');
        // const nom = this.formGroup.get('Nom');
        const id = this.formGroup.get('id');
        const Etablissement = this.formGroup.get('Etablissement');
        const Lib = this.formGroup.get('Lib');
        
        // return !!(prenom?.valid && nom?.valid && id?.valid && Etablissement?.valid && Lib?.valid);
        return !!(id?.valid && Etablissement?.valid && Lib?.valid);
    }

    nextStep(): void {
        if (this.isStep1Valid()) {
            this.currentStep = 2;
        } else {
            // this.formGroup.get('Prénom')?.markAsTouched();
            // this.formGroup.get('Nom')?.markAsTouched();
            this.formGroup.get('id')?.markAsTouched();
            this.formGroup.get('Etablissement')?.markAsTouched();
            this.formGroup.get('Lib')?.markAsTouched();
        }
    }

    previousStep(): void {
        this.currentStep = 1;
    }

    onVoeuChange(): void {
        // Réinitialiser le message de validation
        this.validationMessage = '';
    }

    // Vérifie si un vœu est déjà sélectionné dans un autre champ
    isVoeuSelected(voeu: string, currentField: string): boolean {
        const voeux = ['voeu1', 'voeu2', 'voeu3', 'voeu4', 'voeu5'];
        
        for (const v of voeux) {
            if (v !== currentField && this.formGroup.get(v)?.value === voeu) {
                return true;
            }
        }
        return false;
    }

    // Validation complète des vœux
    validateVoeux(): string {
        const voeu1 = this.formGroup.get('voeu1')?.value;
        const voeu2 = this.formGroup.get('voeu2')?.value;
        const voeu3 = this.formGroup.get('voeu3')?.value;
        const voeu4 = this.formGroup.get('voeu4')?.value;
        const voeu5 = this.formGroup.get('voeu5')?.value;

        const voeux = [voeu1, voeu2, voeu3, voeu4, voeu5];

        // Vérifier que tous les vœux sont différents
        const uniqueVoeux = new Set(voeux);
        if (uniqueVoeux.size !== 5) {
            return 'Tous les vœux doivent être différents.';
        }

        // Vérifier que les vœux 1 et 2 sont des conférences
        if (!this.conferences.includes(voeu1)) {
            return 'Le vœu 1 doit être une conférence.';
        }
        if (!this.conferences.includes(voeu2)) {
            return 'Le vœu 2 doit être une conférence.';
        }

        // Vérifier que les vœux 3, 4, 5 ne sont pas les mêmes que 1 et 2 s'ils sont des conférences
        const voeux12 = [voeu1, voeu2];
        if (this.conferences.includes(voeu3) && voeux12.includes(voeu3)) {
            return 'Le vœu 3 ne peut pas être identique aux vœux 1 ou 2.';
        }
        if (this.conferences.includes(voeu4) && voeux12.includes(voeu4)) {
            return 'Le vœu 4 ne peut pas être identique aux vœux 1 ou 2.';
        }
        if (this.conferences.includes(voeu5) && voeux12.includes(voeu5)) {
            return 'Le vœu 5 ne peut pas être identique aux vœux 1 ou 2.';
        }

        return '';
    }

    onSubmit(): void {
        if (this.formGroup.valid) {
            // Validation des règles métier
            const validationError = this.validateVoeux();
            if (validationError) {
                this.validationMessage = validationError;
                return;
            }

            console.log('Formulaire valide:', this.formGroup.value);
            
            // Afficher un résumé de la sélection
            console.log('=== Résumé de vos vœux ===');
            console.log('Vœu 1 (Conférence):', this.formGroup.get('voeu1')?.value);
            console.log('Vœu 2 (Conférence):', this.formGroup.get('voeu2')?.value);
            console.log('Vœu 3:', this.formGroup.get('voeu3')?.value);
            console.log('Vœu 4:', this.formGroup.get('voeu4')?.value);
            console.log('Vœu 5:', this.formGroup.get('voeu5')?.value);
            
            // Envoyer au backend
            alert('Inscription enregistrée avec succès !');
        } else {
            Object.keys(this.formGroup.controls).forEach(key => {
                this.formGroup.get(key)?.markAsTouched();
            });
        }
    }
}