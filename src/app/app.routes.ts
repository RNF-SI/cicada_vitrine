import { Routes } from '@angular/router';

/**
 * La vitrine est une page unique ; les deux autres routes servent la foire aux
 * questions et les mentions légales, qu'on ne veut pas noyer dans le défilement
 * de la page d'accueil. Toutes sont prérendues en HTML statique au build.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then((m) => m.Landing),
    title: "Cicada — L'outil de gestion des plans de gestion des aires protégées",
  },
  {
    path: 'faq',
    loadComponent: () => import('./features/faq/faq').then((m) => m.Faq),
    title: 'Questions fréquentes — Cicada',
  },
  {
    path: 'mentions-legales',
    loadComponent: () => import('./features/legal/legal').then((m) => m.Legal),
    title: 'Mentions légales — Cicada',
  },
  { path: '**', redirectTo: '' },
];
