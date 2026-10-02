/** Une entrée du menu de la page unique. */
export interface NavSection {
  /** `id` de la balise `<section>` ciblée. */
  readonly id: string;
  readonly label: string;
}

/**
 * Sommaire de la page. L'ordre fait foi : il pilote à la fois le menu et la
 * détection de la section active au défilement.
 */
export const NAV_SECTIONS: readonly NavSection[] = [
  { id: 'projet', label: 'Le projet' },
  { id: 'fonctionnalites', label: 'Fonctionnalités' },
  { id: 'deploiement', label: 'Déployer CICADA' },
  { id: 'ressources', label: 'Ressources' },
  { id: 'communaute', label: 'Communauté' },
  { id: 'contact', label: 'Contact' },
];
