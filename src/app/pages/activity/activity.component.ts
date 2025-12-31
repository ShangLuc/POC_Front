import { Component, OnInit } from '@angular/core';


@Component({
    selector: 'dashboard-cmp',
    moduleId: module.id,
    templateUrl: 'activity.component.html'
})

export class ActivityComponent implements OnInit{
    
    // Données pour les trois types d'activités
    conferences: any[] = [];
    tablesRondes: any[] = [];
    flashsMetiers: any[] = [];
    
    // Compteurs pour les numéros
    conferenceCounter: number = 0;
    tableRondeCounter: number = 0;
    flashMetierCounter: number = 0;
    
    // Modal state
    activeModal: string = '';
    newActivity = {
        nom: '',
        capacite: '',
        nbRepetition: ''
    };

    ngOnInit(){}

    // Ouvrir une modal
    openModal(type: string) {
        this.activeModal = type;
        this.resetForm();
    }

    // Fermer la modal
    closeModal() {
        this.activeModal = '';
        this.resetForm();
    }

    // Réinitialiser le formulaire
    resetForm() {
        this.newActivity = {
            nom: '',
            capacite: '',
            nbRepetition: ''
        };
    }

    // Ajouter une activité
    addActivity(type: string) {
        if (!this.newActivity.nom || !this.newActivity.capacite || !this.newActivity.nbRepetition) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        const activity = {
            numero: 0,
            nom: this.newActivity.nom,
            capacite: this.newActivity.capacite,
            nbRepetition: this.newActivity.nbRepetition
        };

        if (type === 'conferences') {
            this.conferenceCounter++;
            activity.numero = this.conferenceCounter;
            this.conferences.push(activity);
        } else if (type === 'tables_rondes') {
            this.tableRondeCounter++;
            activity.numero = this.tableRondeCounter;
            this.tablesRondes.push(activity);
        } else if (type === 'flashs_metiers') {
            this.flashMetierCounter++;
            activity.numero = this.flashMetierCounter;
            this.flashsMetiers.push(activity);
        }

        this.closeModal();
    }

    // Supprimer une activité
    deleteActivity(type: string, index: number) {
        if (type === 'conferences') {
            this.conferences.splice(index, 1);
            this.updateNumbers('conferences');
        } else if (type === 'tables_rondes') {
            this.tablesRondes.splice(index, 1);
            this.updateNumbers('tables_rondes');
        } else if (type === 'flashs_metiers') {
            this.flashsMetiers.splice(index, 1);
            this.updateNumbers('flashs_metiers');
        }
    }

    // Mettre à jour les numéros après suppression
    updateNumbers(type: string) {
        let array = type === 'conferences' ? this.conferences : 
                    type === 'tables_rondes' ? this.tablesRondes : 
                    this.flashsMetiers;
        
        array.forEach((activity, index) => {
            activity.numero = index + 1;
        });
    }
}
