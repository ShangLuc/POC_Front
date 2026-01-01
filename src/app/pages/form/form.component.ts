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

    // Descriptifs des événements pour l'affichage dans un pop-up
    eventDescriptions: { [titre: string]: string } = {
        'Etudes et métiers des arts, de la culture et du design':
            'Ecole d\'architecture et/ou ESADSE et/ou Université et/ou Lycée Jean Monnet.<br>' + 
            'Présentation des différents cursus de formation, des différents métiers, des perspectives d\'emploi dans ces secteurs.<br>'+
            'Modalité et prérequis pour intégrer ces formations.',
        'Etudes et métiers du commerce':
            'Université Jean Monnet (IUT), lycées publics et privés, CFAI, EKLYA.<br>' +
            'Présentation des BTS(Négociation et Digitalisation de la Relation Client, Management Commercial Opérationnel, Commerce International, Technico-Commercial):enseignements, organisation.<br>' + 
            'Modalité et prérequis pour intégrer ces formations.<br>'+
            'Présentation des possibles poursuites d\'études et présentation des métiers',
        'Les études médicales':
            'Université Jean Monnet (Faculté de Médecine).<br>' +
            'Présentation des études médicales (PASS, L-AS) qui mènent aux 5 filières (médecine, odontologie, maïeutique (sage-femme), pharmacie et Masso-kinésithérapie).<br>'+
            'Statistiques de réussite et tutorat gratuit de la faculté.<br>'+
            'Modalité et prérequis pour intégrer ces formations.',
        'Management économie gestion Licences CPGE':
            'Université Jean Monnet (IUT), Institut des Administrations et des Entreprises (IAE), lycée Claude Fauriel.<br>' +
            'Présentation des études: formations de l\'IAE, CPGE économique.<br>'+
            'Présentation des possibles poursuites d\'études et présentation des métiers.<br>'+
            'Modalité et prérequis pour intégrer ces formations.',
        'Sciences et innovations technologiques BTS BUT':
            'Lycées publics et privés, Université Jean Monnet (IUT).<br>' +
            'Introduction via les secteurs industriels leader en France et dans notre région.<br>'+
            'Présentation à partir de produits innovants des formations BTS et BUT scientifiques et industriels impliqués dans leur réalisation<br>'+
            'Comparatif BTS/BUT, Formation Initiale/Alternance.<br>' +
            'Présentation des possibles poursuites d\'études.<br>'+
            'Présentation des métiers.<br>'+
            'Modalité et prérequis pour intégrer ces formations.',
        "Sociologie, sciences de l'éducation, histoire géographie Licences CPGE":
            'Université Jean Monnet (Faculté de Sciences Humaines et sociales) et lycée Claude Fauriel.<br>' +
            'Présentation des études: licences d\'histoire, de géographie, de sociologie, de sciences de l\'éducation, CPGE littéraires.<br>'+
            'Modalité et prérequis pour intégrer ces formations.<br>'+
            'Présentation des possibles poursuites d\'études et présentation des métiers.',
        "Etudes et métiers de l'informatique et du numérique":
            'DDFPT des lycées et Université Jean Monnet.<br>' +
            'Présentation des Formations.<br>'+
            'Présentation des parcours possibles.<br>'+
            'Présentation des métiers et de la diversité des domaines.',
        'Etudes et métiers du droit - Science Po':
            'Université Jean Monnet (Faculté de droit) .<br>' +
            'Présentation des études de droit: licences, licence professionnelle, master.<br>'+
            'Zoom sur les modalités et les prérequis pour intégrer ces formations.<br>'+
            'Présentation des possibles poursuites d\'études et présentation des métiers.',
        'Etudes et métiers du soin et de la santé':
            'IFSI, IFMK, IFAS, CIDO, Lycées Honoré d\'Urfé et Saint Michel.<br>' +
            'Présentation des cursus de formation.<br>'+
            'Modalité et prérequis pour intégrer ces formations.<br>'+
            'Présentation des possibles poursuites d\'études.<br>'+
            'Présentation des métiers et des perspectives d\'emploi dans ce secteur.',
        "Etudes et métiers du tourisme et de l'hôtellerie BTS":
            'Lycées Tezenas du Montcel et Le Renouveau.<br>' +
            'Présentation des différents cursus de formation.<br>'+
            'Présentation des disciplines et savoirs enseignés.<br>'+
            'Modalité et prérequis pour intégrer ces formations.<br>'+
            'Présentation des possibles poursuites d\'études.<br>'+
            'Présentation des métiers.',
        "Etudes et métiers de l'habitat et de la construction":
            'Lycées publics et Ecole d\'Architecture.<br>' +
            'Présentation des formations concernées : BTS Batiment, BTS Systèmes constructifs bois et habitat, BTS Etude et réalisation d\'agencement, Diplome nationale des métiers d\'art et du design (DNMAD mention "Espace"), BTS Enveloppe des batiments conception et réalisation, Licence (DEFA), diplome d\'études en architecture.<br>'+
            'Modalité et prérequis pour intégrer ces formations.<br>'+
            'Présentation des possibles poursuites d\'études.<br>'+
            'Présentation des métiers.',
        'Sciences et techniques Licence CPGE':
            'Université Jean Monnet (Faculté de Sciences et Techniques) Lycées Claude Fauriel et Etienne Mimard.<br>' +
            'Présentation des portails "Biologie-Géologie-Chimie" et "Mathématiques-Informatique-Physique-Chimie" et CPGE scientifiques.<br>'+
            'Modalité et prérequis pour intégrer ces formations.<br>'+
            'Présentation des possibles poursuites d\'études et présentation des métiers.',
        "Etudes et métiers de l'ingénieur":
            'ENISE, avec intervention d\'ingénieurs ou élèves ingénieurs des écoles stéphanoises.<br>' +
            'Présentation des écoles stéphanoises et conditions d\'accès.<br>'+
            'Témoignages d\'ingénieurs, de leur parcours et de leur métier.<br>'+
            'Modalité et prérequis pour intégrer ces formations.<br>'+
            'Présentation des possibles poursuites d\'études.<br>'+
            'Présentation des métiers.',
        'Etudes et métiers du management, économie, gestion (BTS/BUT)':
            'Université Jean Monnet (IUT), Institut des Administrations et des Entreprises (OAE), lycée Claude Fauriel.<br>' +
            'Présentation des études: Formations de l\'IAE, CPGE économique.<br>'+
            'Modalité et prérequis pour intégrer ces formations.<br>'+
            'Présentation des possibles poursuites d\'études et présentation des métiers.',
        'Etudes et métiers du secteur social':
            'ENSEIS, IRUP, Lycées publics ou privés (BTS SP3S et ESF).<br>' +
            'Présentation des formations du secteur social.<br>'+
            'Modalité et prérequis pour intégrer ces formations.<br>'+
            'Présentation des possibles poursuites d\'études.<br>'+
            'Présentation des métiers et des perspectives d\'emploi dans ce secteur .',
        'Etudes et métiers du sport':
            'Université Jean Monnet (STAPS) et AFMS.<br>' +
            'Présentation des études de STAPS (licence, master) et des formations professionnalisantes.<br>'+
            'Modalité et prérequis pour intégrer ces formations.<br>'+
            'Présentation des possibles poursuites d\'études.<br> '+
            'Présentation des métiers.',
        'Lettres et langues Licences CPGE':
            'Université Jean Monnet (Faculté Art Lettres et Langues) et lycée Claude Fauriel.<br>' +
            'Présentation des études: licences Langues Etrangères Appliquées, Langues Littérature et Civilisations Etrangères et Régionales, Lettres, CPGE littéraires.<br>'+
            'Modalité et prérequis pour intégrer ces formations.<br>'+
            'Présentation des possibles poursuites d\'études.<br>'+
            'Présentation des métiers.',
        "Sciences de la vie, de l'environnement et de l'agronomie BTS BUT":
            'Lycées publics et privés, MFR, Université Jean Monnet (IUT).<br>' +
            'Présentation des formations concernées: BTSA Gestion et Maitrise de l\'EAU, BTS métiers de l\'eau, BTSA Analyse, Conduite et Stratégie de l\'Entreprise Agricole et BUT Génie de l\'Environnement.<br>'+
            'Modalité et prérequis pour intégrer ces formations.<br>'+
            'Présentation des possibles poursuites d\'études et présentation des métiers.',
        "Etre étudiant _ Parcoursup":
            'SEM et Centres d\'information et d\'Orientation.<br>' +
            'Présentation des services disponibles sur Saint-Etienne à destination des étudiants.<br>'+
            'Présentation succinctes de Parcoursup et de son fonctionnement.',
        // TABLE RONDES
        'Table ronde: Etre étudiant en BTS (animation par des étudiants)':
            'Sous la forme de témoignages.',
        'Table ronde: Etre étudiant en BUT (animation par des étudiants)':
            'Sous la forme de témoignages.',
        'Table ronde: Etre étudiant en prépa CPI ou CPGE (animation par des étudiants)':
            'Sous la forme de témoignages.',
        "Table ronde: Etre alternant dans l'enseignement supérieur (animation par des étudiants)":
            'Sous la forme de témoignages.',
        'Table ronde: Etre étudiant en Licences (animation par des étudiants)':
            'Sous la forme de témoignages.',

        // FLASH METIERS
        'Flash métier: ingénieur (animation par des professionnels)':
            'Seront abordés les objectifs, les missions des ingénieurs et leur environnement de travail. Les professionnels présents pourront ainsi apporter un éclairage sur l\'ensemble de savoirs et de savoir-faire techniques, économiques, sociaux, environnementaux et humains',
        'Flash métier: social (animation par des professionnels)':
            'Seront abordés les contextes professionnels et les modalités de travail des travailleurs sociaux à partir de deux témoignages pris parmi ces 4 professions: assistant de service sociale et familiale, éducateur spécialisé éducateur de jeunes enfants.',
        'Flash métier: commerce (animation par des professionnels)':
            'Lors des Flash Métiers vous pourrez découvrir des témoignages de professionnels dans les services suivants: Commercial, marketing communication, Comptabilité/Gestion, Ressources humaines.',
        'Flash métier: sport (animation par des professionnels)':
            'Seront abordés les métiers du sport et leur diversité par le biais de témoignages de professionnels: maitre-nageur, entraineur de gymnastique...<br>'+
            'Seront évoqués également les postures attendues d\'un éducateur sportif et les différents publics rencontrés.',
        'Flash métier: paramédical (animation par des professionnels)':
            'Sous la forme de témoignages, vous découvrirez des métiers paramédicaux autour du soin et de la santé... Vous rencontrerez par exemple un ostéopathe, un manipulateur en électroradiologie, un kiné, un infirmier...<br>'+
            'Seront abordés la posture du soignant et la relation au patient.',
        'Flash métier: design / architecture (animation par des professionnels)':
            'Sera abordée la pluralité des métiers de l\'architecture et de la diversité des pratiques via des témoignages de professionnels.<br>'+
            'Concernant le design, sera abordée l\'étendue des champs d\'intervention: Design numérique, d\'espace, d\'objet ou encore design graphique, design de service....' 
    };

    // État du pop-up de descriptif
    selectedEventTitle: string | null = null;
    selectedEventDescription: string | null = null;
    showDescriptionModal = false;

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

        this.eleveService.saveVoeux(eleveId, eventIds).subscribe({
            next: (msg: string) => {
                this.messageSucces = msg || 'Vos choix ont été enregistrés. Vous pouvez encore les modifier.';
            },
            error: (err) => {
                this.messageErreur = err?.error || 'Erreur lors de l\'enregistrement des vœux.';
                console.error(err);
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
        this.selectedEventDescription =
            this.eventDescriptions[titre] || 'Aucun descriptif détaillé disponible pour ce vœu.';
        this.showDescriptionModal = true;
    }

    // Fermer le pop-up descriptif
    closeDescription(): void {
        this.showDescriptionModal = false;
        this.selectedEventTitle = null;
        this.selectedEventDescription = null;
    }
}