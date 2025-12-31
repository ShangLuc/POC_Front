import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';


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

    // Importer un fichier Excel
    onFileChange(event: any) {
        const target: DataTransfer = <DataTransfer>(event.target);
        if (target.files.length !== 1) {
            throw new Error('Cannot use multiple files');
        }
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];
            const data = <any[]>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
            
            // Supprimer la première ligne (en-têtes)
            data.shift();

            data.forEach(row => {
                const newStudent = {
                    numero: this.students.length + 1,
                    etablissement: row[0],
                    nom: row[1],
                    prenom: row[2],
                    identifiantNational: row[3],
                    libStructure: row[4],
                    confirmeChoix: 'non' // Valeur par défaut
                };
                this.students.push(newStudent);
            });
            this.updateNumbers();
        };
        reader.readAsBinaryString(target.files[0]);
    }
}
