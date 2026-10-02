/** Structure à l'origine ou partenaire du projet CICADA. */
export interface Partner {
  readonly name: string;
  /** Nom complet, utilisé en infobulle et comme texte alternatif. */
  readonly fullName: string;
  /**
   * Libellé de la pastille affichée tant qu'aucun logo n'est fourni. À ne
   * renseigner que lorsque `fullName` est trop long pour tenir dans une
   * pastille ; sinon `fullName` fait l'affaire.
   */
  readonly shortName?: string;
  readonly url: string;
  /**
   * Chemin du logo dans `public/assets/images/partners/`.
   *
   * `null` → le composant affiche le nom de la structure en toutes lettres
   * plutôt qu'une image cassée.
   *
   * Les fichiers sont fournis par les structures. Seul RNF est en SVG ; les
   * autres sont des PNG dont la définition suffit aux tailles d'affichage
   * (64 px dans la page, 34 px en pied de page). Voir
   * `public/assets/images/partners/README.md`.
   */
  readonly logo: string | null;
}

/**
 * Structures à l'origine de CICADA : les deux têtes de réseau des gestionnaires
 * d'espaces naturels protégés, qui pilotent conjointement le projet.
 *
 * L'ordre est celui des documents officiels du projet (flyer et note de
 * présentation) : « co-portée par les Réserves Naturelles de France et la
 * Fédération des Conservatoires d'espaces naturels ». RNF est par ailleurs
 * l'éditrice du site, cf. les mentions légales.
 */
export const FOUNDING_PARTNERS: readonly Partner[] = [
  {
    name: 'RNF',
    fullName: 'Réserves naturelles de France',
    url: 'https://www.reserves-naturelles.org',
    logo: '/assets/images/partners/rnf.svg',
  },
  {
    name: 'FCEN',
    fullName: "Fédération des Conservatoires d'espaces naturels",
    url: 'https://reseau-cen.org',
    logo: '/assets/images/partners/cen.png',
  },
];

/**
 * Partenaires associés, cités par la note de présentation du projet : le projet
 * est mené « en partenariat avec la LPO, PatriNat et l'Office français de la
 * biodiversité ».
 */
export const ASSOCIATED_PARTNERS: readonly Partner[] = [
  {
    name: 'OFB',
    fullName: 'Office français de la biodiversité',
    url: 'https://www.ofb.gouv.fr',
    logo: '/assets/images/partners/ofb.svg',
  },
  {
    name: 'LPO',
    fullName: 'Ligue pour la protection des oiseaux',
    url: 'https://www.lpo.fr',
    logo: '/assets/images/partners/lpo.png',
  },
  {
    name: 'PatriNat',
    fullName: 'PatriNat — centre d’expertise et de données sur le patrimoine naturel',
    shortName: 'PatriNat',
    url: 'https://www.patrinat.fr',
    logo: '/assets/images/partners/patrinat.png',
  },
];
