import { VitrineDocument } from '../../shared/components/pdf-dialog/pdf-dialog';

/**
 * Contenu éditorial de la page.
 *
 * Source : la note de présentation du projet (avril 2026), reprise dans
 * `public/documents/presentation-cicada.pdf`, et la documentation du dépôt
 * CICADA.
 */

/** Un module de CICADA, présenté sous forme de tuile. */
export interface ModuleCard {
  readonly icon: string;
  readonly title: string;
  readonly text: string;
  /**
   * Mention de disponibilité, affichée en pastille sur la tuile. Absente pour
   * un module déjà disponible : seuls ceux qui ne le sont pas encore portent
   * une indication.
   */
  readonly availability?: string;
  /** Couleur d'accent, prise dans la palette décorative du Kit UI. */
  readonly accent: 'primary' | 'yellow' | 'salmon' | 'terra-cotta' | 'pale-green';
}

/** Les cinq modules communs. */
export const MODULES: readonly ModuleCard[] = [
  {
    icon: 'fi-rr-map-marker',
    title: 'Mes sites',
    text: "Gérer les sites auxquels vous êtes rattaché et les droits associés, co-gestion comprise. Les têtes de réseau fournissent un référentiel de sites ; vous pouvez en ajouter en important un fichier géométrique ou en dessinant directement l'emprise.",
    accent: 'salmon',
  },
  {
    icon: 'fi-rr-file-edit',
    title: 'Mes plans de gestion',
    text: "Tout le cycle du plan, de la saisie initiale à l'évaluation, structuré selon le CT88 : enjeux, objectifs, indicateurs et actions, plans multi-sites, versionnement et duplication pour le renouvellement. Puis le suivi annuel des actions et des indicateurs, et les graphiques de bilan de la gestion.",
    accent: 'primary',
  },
  {
    icon: 'fi-rr-clipboard-list-check',
    title: 'Mes suivis et inventaires',
    text: 'Décrire les suivis et inventaires réalisés — objectifs, protocoles, cibles. Le module ne remplace pas les outils de saisie naturaliste comme GeoNature : il centralise ce qui est suivi, comment et pourquoi. Utilisable seul, sans saisir tout un plan de gestion.',
    accent: 'pale-green',
  },
  {
    icon: 'fi-rr-document-signed',
    title: 'Zonages réglementaires',
    text: "Saisir et visualiser la réglementation en vigueur sur l'aire protégée. Un référentiel d'activités et une matrice de correspondance structurent les dispositions par texte ; l'auto-complétion réduit fortement la saisie, et vous gardez la main pour documenter les exceptions.",
    availability: 'Prochainement',
    accent: 'yellow',
  },
  {
    icon: 'fi-rr-search',
    title: 'Exploration des données',
    text: "Consulter les plans de gestion et les zonages des autres aires protégées contributrices — protocoles de suivi, indicateurs, grilles de lecture — pour s'en inspirer. Les données de suivi de la mise en œuvre, elles, restent confidentielles.",
    accent: 'terra-cotta',
  },
];

/** Ce que l'outil apporte transversalement, au-delà du découpage en modules. */
export interface CrossFeature {
  readonly icon: string;
  readonly title: string;
  readonly text: string;
}

export const CROSS_FEATURES: readonly CrossFeature[] = [
  {
    icon: 'fi-rr-cloud-download',
    title: 'Exports et rapportages',
    text: "Produire le volume stratégique du plan, alimenter les rapports d'activité et les évaluations à mi-parcours et de fin de parcours, sans ressaisie.",
  },
  {
    icon: 'fi-rr-dashboard',
    title: 'Tableau de bord et bilan',
    text: "Suivre les temps humains, les moyens financiers, le calendrier et l'évolution des indicateurs d'état et de pression ; les graphiques de bilan se génèrent automatiquement.",
  },
  {
    icon: 'fi-rr-users-alt',
    title: 'Organismes, rôles et validations',
    text: "Quatre niveaux de droits, rattachement à un organisme et circuits de validation des demandes d'accès, adaptés aux situations de co-gestion.",
  },
  {
    icon: 'fi-rr-shuffle',
    title: 'Interopérabilité',
    text: "Une API publique pour exposer les plans de gestion aux autres systèmes d'information, et une conception pensée pour s'interfacer avec les outils existants.",
  },
];

/** Modules envisagés, sous réserve de financements. */
export const ROADMAP: readonly string[] = [
  'Module « Travaux » : suivi quotidien des opérations de gestion, avec une application mobile, interfacé avec GeoNature ou Geotrek.',
  'Module à destination des autorités de tutelle : bilans territoriaux agrégés à partir des données des plans de gestion.',
  'Module « Foncier » : suivi des données foncières associées aux sites gérés.',
  'Module « Infractions et incivilités » : centralisation des signalements sur les aires protégées.',
];

/** Un avantage d'un mode de déploiement. */
export interface DeploymentPoint {
  readonly icon: string;
  readonly text: string;
}

/** Mode « j'installe moi-même », licence GNU GPL v3. */
export const SELF_HOSTED_POINTS: readonly DeploymentPoint[] = [
  {
    icon: 'fi-rr-unlock',
    text: 'Code source complet sous licence GNU GPL v3. Aucune fonctionnalité réservée.',
  },
  {
    icon: 'fi-rr-cube',
    text: 'Déploiement par Docker Compose : toute la pile démarre en une commande.',
  },
  {
    icon: 'fi-rr-shield-check',
    text: 'Les données de suivi de la mise en œuvre restent confidentielles.',
  },
  {
    icon: 'fi-rr-shuffle',
    text: 'Vous décidez de contribuer ou non à la base commune.',
  },
  {
    icon: 'fi-rr-tools',
    text: "Guide d'installation public et entraide sur Matrix.",
  },
];

/**
 * Mode « instance de ma tête de réseau » : gratuit pour les gestionnaires de
 * réserves naturelles et les Conservatoires d'espaces naturels, qui relèvent
 * respectivement de RNF et de la FCEN.
 */
export const NETWORK_POINTS: readonly DeploymentPoint[] = [
  {
    icon: 'fi-rr-gift',
    text: 'Gratuit, sans convention à négocier ni devis à demander.',
  },
  {
    icon: 'fi-rr-plug',
    text: 'Rien à installer ni à maintenir : vous recevez vos accès.',
  },
  {
    icon: 'fi-rr-sitemap',
    text: 'Vos sites et vos plans aux côtés de ceux de votre réseau.',
  },
  {
    icon: 'fi-rr-life-ring',
    text: 'Accompagnement par votre tête de réseau, qui connaît vos pratiques.',
  },
];

/** Mode « service hébergé », opéré par Réserves naturelles de France. */
export const SAAS_POINTS: readonly DeploymentPoint[] = [
  {
    icon: 'fi-rr-globe',
    text: 'Votre nom de domaine.',
  },
  {
    icon: 'fi-rr-user-crown',
    text: 'Vous administrez votre plateforme : utilisateurs, organismes, sites, paramètres.',
  },
  {
    icon: 'fi-rr-picture',
    text: "Votre logo et votre image d'accueil.",
  },
  {
    icon: 'fi-rr-database',
    text: 'Accès direct à la base de données, pour vos exports et traitements SIG.',
  },
  {
    icon: 'fi-rr-refresh',
    text: 'Mises à jour, sauvegardes et supervision assurées.',
  },
  {
    icon: 'fi-rr-headset',
    text: "Assistance par l'équipe du projet.",
  },
];

/**
 * Documents téléchargeables.
 *
 * Un document dont `file` vaut `null` s'affiche comme « bientôt disponible »
 * plutôt que de proposer un téléchargement cassé.
 */
export const DOCUMENTS: readonly VitrineDocument[] = [
  {
    id: 'flyer',
    title: 'Flyer CICADA',
    description:
      "Deux pages pour présenter l'outil en réunion ou sur un stand : pourquoi CICADA, ce qu'il apporte, et à qui il profite.",
    icon: 'fi-rr-newspaper',
    file: '/documents/flyer-cicada.pdf',
    downloadName: 'flyer-cicada.pdf',
    size: '761 ko',
  },
  {
    id: 'presentation',
    title: 'Note de présentation du projet',
    description:
      "Le document de référence (avril 2026) : genèse, besoins auxquels l'outil répond, contenu de la version 1 et perspectives.",
    icon: 'fi-rr-presentation',
    file: '/documents/presentation-cicada.pdf',
    downloadName: 'presentation-projet-cicada.pdf',
    size: '261 ko',
  },
];
