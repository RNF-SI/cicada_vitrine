import { Routes } from '@angular/router';

/**
 * La vitrine est une page unique ; la seule autre route sert les mentions
 * légales, qu'on ne veut pas noyer dans le défilement de la page d'accueil.
 * Les deux sont prérendues en HTML statique au build.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then((m) => m.Landing),
    title: "CICADA — L'outil de gestion des plans de gestion des aires protégées",
  },
  {
    path: 'mentions-legales',
    loadComponent: () => import('./features/legal/legal').then((m) => m.Legal),
    title: 'Mentions légales — CICADA',
  },
  { path: '**', redirectTo: '' },
];
