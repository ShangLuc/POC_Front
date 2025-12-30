import { Component, OnInit } from '@angular/core';
import { AuthService } from '../pages/auth.service';


export interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

export const ADMIN_ROUTES: RouteInfo[] = [
    { path: '/dashboard',     title: 'Tableau de bord',        icon:'nc-chart-pie-36', class: '' },
    { path: '/activity',      title: 'Les activités',          icon:'nc-single-02',  class: '' },
    { path: '/studentList',   title: "Liste des élèves",       icon:'nc-bullet-list-67',  class: '' },
    { path: '/user',          title: "Profil", icon:'nc-single-02',  class: '' },
];

export const STUDENT_ROUTES: RouteInfo[] = [
    { path: '/accueil',       title: 'Accueil',           icon:'nc-bank',        class: '' },
    { path: '/form',          title: 'Formulaire',        icon:'nc-bank',        class: '' },
    { path: '/user',          title: 'Profil',            icon:'nc-single-02',   class: '' },
];

export const ROUTES: RouteInfo[] = [
    { path: '/accueil',       title: 'Accueil',                icon:'nc-bank',       class: '' },
    { path: '/form',          title: 'formulaire',        icon:'nc-bank',       class: '' },
    { path: '/activity',      title: 'Les activités',          icon:'nc-single-02',  class: '' },
    { path: '/user',          title: "Profil d'utilisateur",   icon:'nc-single-02',  class: '' },
    { path: '/studentList',   title: "Liste des élèves",       icon:'nc-bullet-list-67',  class: '' },
    { path: '/table',         title: 'Table List',             icon:'nc-tile-56',    class: '' },
    { path: '/section',       title: 'Section',                icon:'nc-pin-3',      class: '' },
    { path: '/icons',         title: 'Icons',                  icon:'nc-diamond',    class: '' },
    { path: '/typography',    title: 'Typography',             icon:'nc-caps-small', class: '' },
];

@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    public menuItems: any[];
    
    constructor(private authService: AuthService) {}

    ngOnInit() {
        // Show admin menu for admins, student menu for students
        if (this.authService.isAdmin()) {
            this.menuItems = ADMIN_ROUTES.filter(menuItem => menuItem);
        } else if (this.authService.isEleve()) {
            this.menuItems = STUDENT_ROUTES.filter(menuItem => menuItem);
        } else {
            this.menuItems = ROUTES.filter(menuItem => menuItem);
        }
    }
}
