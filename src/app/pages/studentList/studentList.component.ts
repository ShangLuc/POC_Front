import { Component, OnInit } from '@angular/core';


@Component({
    selector: 'dashboard-cmp',
    moduleId: module.id,
    templateUrl: 'studentList.component.html'
})

export class StudentListComponent implements OnInit{   
    
    students: any[] = [];
    studentCounter: number = 0;
    
    // Modal state
    showModal: boolean = false;
    newStudent = {
        identifiantNational: '',
        nom: '',
        prenom: '',
        etablissement: '',
        demijournee: '',
        confirmeChoix: 'non'
    };

    ngOnInit(){}

    // Ouvrir la modal
    openModal() {
        this.showModal = true;
        this.resetForm();
    }

    // Fermer la modal
    closeModal() {
        this.showModal = false;
        this.resetForm();
    }

    // Réinitialiser le formulaire
    resetForm() {
        this.newStudent = {
            identifiantNational: '',
            nom: '',
            prenom: '',
            etablissement: '',
            demijournee: '',
            confirmeChoix: 'non'
        };
    }

    // Ajouter un étudiant
    addStudent() {
        if (!this.newStudent.identifiantNational || !this.newStudent.nom || 
            !this.newStudent.prenom || !this.newStudent.etablissement) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        const student = {
            numero: this.students.length + 1,
            identifiantNational: this.newStudent.identifiantNational,
            nom: this.newStudent.nom,
            prenom: this.newStudent.prenom,
            etablissement: this.newStudent.etablissement,
            demijournee: this.newStudent.demijournee,
            confirmeChoix: this.newStudent.confirmeChoix
        };

        this.students.push(student);
        this.closeModal();
    }

    // Supprimer un étudiant
    deleteStudent(index: number) {
        this.students.splice(index, 1);
        this.updateNumbers();
    }

    // Mettre à jour les numéros après suppression
    updateNumbers() {
        this.students.forEach((student, index) => {
            student.numero = index + 1;
        });
    }
}
