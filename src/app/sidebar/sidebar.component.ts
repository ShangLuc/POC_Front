import { Component, OnInit } from '@angular/core';


export interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

export const ROUTES: RouteInfo[] = [
    { path: '/acceuil',       title: 'Acceuil',                icon:'nc-bank',       class: '' },
    { path: '/form',          title: 'formulaire',        icon:'nc-paper',       class: '' },
    { path: '/activity',      title: 'Les activités',          icon:'nc-time-alarm',  class: '' },
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
    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
    }
}
