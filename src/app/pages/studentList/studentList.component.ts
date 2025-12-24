import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { AuthService } from '../auth.service';


@Component({
    selector: 'dashboard-cmp',
    moduleId: module.id,
    templateUrl: 'studentList.component.html'
})

export class StudentListComponent implements OnInit{   
    
    constructor(
    private http: HttpClient,
    private authService: AuthService
    ) {}

    // Get authorization headers with Bearer token
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

    students: any[] = [];
    studentCounter: number = 0;
    loadingEleves: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';
    
    // Modal state
    showModal: boolean = false;
    addingStudent: boolean = false;
    newStudent = {
        id: '',
        nom: '',
        prenom: '',
        etablissement: '',
        libStructure: '',
        inscrit: 'non'
    };

    ngOnInit(){
        this.loadEleves();
    }

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
            id: '',
            nom: '',
            prenom: '',
            etablissement: '',
            libStructure: '',
            inscrit: 'non'
        };
        this.errorMessage = '';
        this.successMessage = '';
    }

    // Ajouter un étudiant
    addStudent() {
        if (!this.newStudent.id || !this.newStudent.nom || 
            !this.newStudent.prenom || !this.newStudent.etablissement) {
            this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
            return;
        }

        this.addingStudent = true;
        this.errorMessage = '';
        this.successMessage = '';

        // Vérifier la présence du token avant l'appel
        const headers = this.getAuthHeaders();
        if (!headers.get('Authorization')) {
            this.errorMessage = 'Authentification requise: token manquant. Veuillez vous reconnecter.';
            this.addingStudent = false;
            return;
        }

        const student = {
            id: this.newStudent.id,
            nom: this.newStudent.nom,
            prenom: this.newStudent.prenom,
            etablissement: this.newStudent.etablissement,
            // Valeur par défaut vide si non fournie
            libStructure: this.newStudent.libStructure || '',
            inscrit: this.newStudent.inscrit === 'oui' ? true : false
        };

        this.http.post<string>('http://localhost:8080/api/admin/eleves',
            student,
            { 
                headers: headers,
                responseType: 'text' as 'json'  // Handle text response
            }
        ).subscribe({
            next: (response) => {
                this.successMessage = 'Étudiant ajouté avec succès.';
                // Add the student to the list locally
                this.students.push({
                    ...student,
                    id: this.newStudent.id
                });
                this.closeModal();
                // Clear success message after 3 seconds
                setTimeout(() => {
                    this.successMessage = '';
                }, 3000);
            },
            error: (err) => {
                console.error('Erreur lors de l\'ajout de l\'étudiant:', err);
                this.errorMessage = err?.error?.message || 'Erreur lors de l\'ajout de l\'étudiant.';
                this.addingStudent = false;
            },
            complete: () => {
                this.addingStudent = false;
            }
        });
    }

    loadEleves() {
        this.loadingEleves = true;
        this.errorMessage = '';
        this.getAllEleves().subscribe({
            next: (response) => {
                this.students = response;
                this.loadingEleves = false;
            },
            error: (err) => {
                console.error('Error loading Eleves:', err);
                this.errorMessage = 'Erreur lors du chargement des élèves.';
                this.loadingEleves = false;
            }
        });
    }



    getAllEleves(): Observable<any[]> {
        return this.http.get<any[]>(
            'http://localhost:8080/api/admin/eleves',
            { headers: this.getAuthHeaders() }
        );
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
                    id: row[3],
                    libStructure: row[4],
                    inscrit: 'non' // Valeur par défaut
                };
                this.students.push(newStudent);
            });
            this.updateNumbers();
        };
        reader.readAsBinaryString(target.files[0]);
    }
}
