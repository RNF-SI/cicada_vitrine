/**
 * Contenu de la page « Questions fréquentes ».
 *
 * Les réponses reprennent ce qu'affirme déjà la page d'accueil : licence et
 * modes de déploiement, périmètre des modules, règles de partage des données.
 * Une réponse qui s'en écarterait créerait une contradiction entre deux pages
 * du même site — si l'une change, vérifier l'autre.
 *
 * L'ordre des rubriques va du plus général au plus technique : un visiteur qui
 * découvre le projet lit le début, un gestionnaire qui cherche un détail passe
 * par le sommaire.
 */
import { SITE_CONFIG } from '../../core/site-config';

/** Lien proposé en fin de réponse, vers une section du site ou un site tiers. */
export interface FaqLink {
  readonly label: string;
  /** URL absolue d'un site tiers, ou `null` si le lien reste sur la vitrine. */
  readonly href: string | null;
  /** Route interne et ancre, lorsque `href` vaut `null`. */
  readonly route?: string;
  readonly fragment?: string;
}

export interface FaqEntry {
  /** Ancre de la question, utilisée par le sommaire et partageable en lien. */
  readonly id: string;
  readonly question: string;
  /** Un élément par paragraphe. */
  readonly answer: readonly string[];
  readonly link?: FaqLink;
}

export interface FaqTopic {
  readonly id: string;
  readonly title: string;
  readonly entries: readonly FaqEntry[];
}

export const FAQ_TOPICS: readonly FaqTopic[] = [
  {
    id: 'decouvrir',
    title: 'Découvrir Cicada',
    entries: [
      {
        id: 'quest-ce-que-cicada',
        question: "Qu'est-ce que Cicada ?",
        answer: [
          "Cicada est un outil libre de suivi, d'analyse et de valorisation de la gestion des aires protégées. Il accompagne le cycle de vie d'un plan de gestion structuré selon la méthodologie CT88 : élaboration, suivi annuel des actions et des indicateurs, puis évaluation.",
          "Il est co-porté par Réserves naturelles de France et la Fédération des Conservatoires d'espaces naturels, les deux têtes de réseau des gestionnaires d'espaces naturels protégés.",
        ],
        link: { label: 'En savoir plus sur le projet', href: null, route: '/', fragment: 'projet' },
      },
      {
        id: 'ct88-obligatoire',
        question: 'Faut-il travailler avec la méthodologie CT88 ?',
        answer: [
          "Oui : tout l'outil est organisé autour du CT88, qui est le cadre de référence des plans de gestion de la plupart des aires protégées. Enjeux, objectifs, indicateurs et actions reprennent cette structure.",
          "Le module « Mes suivis et inventaires » fait exception : il s'utilise seul, sans saisir tout un plan de gestion.",
        ],
      },
      {
        id: 'remplace-geonature',
        question: 'Cicada remplace-t-il GeoNature ?',
        answer: [
          "Non. Cicada ne reçoit pas de données naturalistes : il décrit les suivis et les inventaires réalisés — objectifs, protocoles, cibles — c'est-à-dire ce qui est suivi, comment et pourquoi. La donnée d'observation reste dans les outils de saisie naturaliste.",
          "Une API publique expose les plans de gestion aux autres systèmes d'information, et un module « Travaux » interfacé avec GeoNature ou Geotrek fait partie des évolutions envisagées.",
        ],
        link: {
          label: 'Voir les cinq modules',
          href: null,
          route: '/',
          fragment: 'fonctionnalites',
        },
      },
      {
        id: 'zonages-reglementaires',
        question: 'Quand le module « Zonages réglementaires » sera-t-il disponible ?',
        answer: [
          "En 2027. Il permettra de saisir et de visualiser la réglementation en vigueur sur l'aire protégée. Les quatre autres modules sont disponibles.",
        ],
      },
    ],
  },
  {
    id: 'choisir-son-instance',
    title: 'Choisir son instance',
    entries: [
      {
        id: 'cen-gerant-une-reserve',
        question:
          "Je suis un Conservatoire d'espaces naturels et je gère une réserve naturelle : sur quelle instance saisir mes données ?",
        answer: [
          "Comme vous le souhaitez. Les deux instances font tourner le même logiciel, et aucune règle ne vous assigne à l'une plutôt qu'à l'autre.",
          "Si une équipe dédiée à la réserve travaille au sein du Conservatoire, l'instance de Réserves naturelles de France est un choix tout à fait cohérent : c'est là que se retrouvent les autres gestionnaires de réserves, et les pratiques de saisie y seront les plus proches des vôtres.",
          "Si vous gérez avant tout des sites du Conservatoire, dont la réserve n'est qu'une partie, l'instance de la Fédération est plus logique : vos sites et vos plans restent regroupés au même endroit.",
        ],
        link: { label: 'Voir les trois voies', href: null, route: '/', fragment: 'deploiement' },
      },
      {
        id: 'cout',
        question: 'Combien ça coûte ?',
        answer: [
          "Cicada est un logiciel libre : l'installer sur vos propres serveurs ne coûte rien en licence, seulement votre hébergement et le temps de votre équipe technique.",
          "Les instances de Réserves naturelles de France et de la Fédération des Conservatoires d'espaces naturels sont mises gratuitement à la disposition des structures de ces deux réseaux.",
          "Seul le service hébergé est payant : il s'adresse aux structures hors des deux réseaux, ou à celles qui veulent leur propre instance dédiée. Ses recettes contribuent au financement du développement.",
        ],
      },
      {
        id: 'sans-equipe-technique',
        question: 'Je n’ai pas d’équipe technique. Puis-je quand même utiliser Cicada ?',
        answer: [
          "Oui. L'installation autonome n'est que l'une des trois voies. Les deux autres ne demandent rien à installer ni à maintenir : vous recevez vos accès à l'instance de votre tête de réseau, ou vous confiez l'exploitation d'une instance dédiée à Réserves naturelles de France.",
        ],
      },
    ],
  },
  {
    id: 'donnees',
    title: 'Vos données',
    entries: [
      {
        id: 'qui-voit-mes-donnees',
        question: 'Qui peut voir mes données ?',
        answer: [
          "Les arborescences des plans de gestion publiés sont consultables par les autres gestionnaires : protocoles de suivi, indicateurs, grilles de lecture. C'est ce qui permet à chacun de s'inspirer du travail des autres au moment d'élaborer son propre plan.",
          'Les données de suivi de la mise en œuvre — temps passés, moyens engagés, avancement réel des actions — restent confidentielles et ne sont visibles que de votre structure.',
        ],
      },
      {
        id: 'partage-obligatoire',
        question: 'Suis-je obligé de partager mes données ?',
        answer: [
          "Non, sauf si vous voulez accéder au module d'exploration. Celui-ci s'appuie sur une base commune, centralisée sur le serveur de Réserves naturelles de France : y accéder suppose d'y contribuer.",
          "Le partage relève d'un consentement explicite de votre structure, donné au moment du déploiement de l'instance. Si vous installez Cicada vous-même, vous décidez de contribuer ou non à cette base commune.",
        ],
      },
      {
        id: 'recuperer-mes-donnees',
        question: 'Puis-je récupérer mes données ?',
        answer: [
          "Oui. L'outil produit une première trame du volume stratégique du plan, alimente les rapports d'activité et les évaluations à mi-parcours et de fin de parcours, et les graphiques de bilan s'exportent.",
          'Le service hébergé donne en plus un accès direct à la base de données, pour vos exports et vos traitements SIG. Sur une instance que vous installez vous-même, la base vous appartient de bout en bout.',
        ],
      },
      {
        id: 'co-gestion',
        question: 'Comment Cicada gère-t-il la co-gestion d’un site ?',
        answer: [
          "Les sites se rattachent à un ou plusieurs organismes, avec quatre niveaux de droits et des circuits de validation des demandes d'accès pensés pour ces situations. Un plan de gestion peut par ailleurs porter sur plusieurs sites.",
        ],
      },
    ],
  },
  {
    id: 'contribuer',
    title: 'Installer et contribuer',
    entries: [
      {
        id: 'installer-moi-meme',
        question: 'Comment installer Cicada sur mes serveurs ?',
        answer: [
          "Le code source complet est publié sous licence GNU GPL v3 et le déploiement se fait par Docker Compose. Le guide d'installation est public, et l'entraide entre instances se fait sur le salon Matrix du projet.",
        ],
        link: { label: "Lire le guide d'installation", href: SITE_CONFIG.installGuideUrl },
      },
      {
        id: 'signaler-une-anomalie',
        question: 'Comment signaler une anomalie ou proposer une évolution ?',
        answer: [
          "Par le dépôt public du projet, qui accueille le code, les demandes d'évolution et les signalements d'anomalie. Les contributions sont examinées par l'équipe du projet.",
          "Les discussions techniques — installation, architecture, entraide — se tiennent sur le salon Matrix, ouvert et consultable avec n'importe quel client.",
        ],
        link: { label: 'Rejoindre la communauté', href: null, route: '/', fragment: 'communaute' },
      },
      {
        id: 'developper-un-module',
        question: 'Puis-je développer mon propre module ?',
        answer: [
          "Oui. L'architecture est modulaire et le code est ouvert : toute structure peut contribuer ou développer ses propres modules, dans le respect de l'architecture commune.",
        ],
      },
      {
        id: 'qui-finance',
        question: 'Qui finance Cicada ?',
        answer: [
          "Le projet est mené dans le cadre du programme européen LIFE BIODIV'FRANCE, cofinancé par l'Union européenne et le ministère de la Transition écologique, en partenariat avec la LPO, PatriNat et l'Office français de la biodiversité.",
          'Les recettes du service hébergé contribuent également au financement du développement, qui reste libre et gratuit à installer.',
        ],
      },
    ],
  },
];
