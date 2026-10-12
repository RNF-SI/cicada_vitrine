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

/** Liste à puces au sein d'une réponse, précédée d'une phrase d'amorce facultative. */
export interface FaqList {
  readonly intro?: string;
  readonly items: readonly string[];
}

/** Un paragraphe (chaîne) ou une liste à puces. */
export type FaqBlock = string | FaqList;

export interface FaqEntry {
  /** Ancre de la question, utilisée par le sommaire et partageable en lien. */
  readonly id: string;
  readonly question: string;
  /** Un élément par paragraphe ou par liste. */
  readonly answer: readonly FaqBlock[];
  readonly link?: FaqLink;
}

export function isFaqList(block: FaqBlock): block is FaqList {
  return typeof block !== 'string';
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
          "Cicada est un outil libre collaboratif de suivi, d'analyse et de valorisation de la gestion des aires protégées. Il accompagne notamment le cycle de vie d'un plan de gestion structuré selon la méthodologie CT88 : élaboration, suivi annuel des actions et des indicateurs, puis évaluation. Il contribue aussi à la centralisation des données de gestion, indispensable pour une vision consolidée des enjeux, pratiques et réglementation à l'échelle réseau.",
          "Il est co-porté par Réserves naturelles de France et la Fédération des Conservatoires d'espaces naturels, deux têtes de réseau des gestionnaires d'espaces naturels protégés, et est développé en partenariat avec la Ligue pour la protection des oiseaux, PatriNat et l'Office français de la biodiversité.",
        ],
        link: { label: 'En savoir plus sur le projet', href: null, route: '/', fragment: 'projet' },
      },
      {
        id: 'methode-ct88',
        question: "Qu'est-ce que la méthodologie CT88 ?",
        answer: [
          "La méthode CT88 (référant au Cahier technique n°88 de l'Office français de la biodiversité) est une démarche française utilisée pour élaborer et structurer les plans de gestion des aires protégées.",
          {
            intro:
              "Elle est le fruit d'un travail collectif et collaboratif associant les têtes de réseaux d'aires protégées, aujourd'hui piloté par l'OFB :",
            items: [
              'Réserves Naturelles de France (RNF)',
              "La Fédération des Conservatoires d'espaces naturels",
              'Les coordinateurs des Espaces Naturels Sensibles (ENS)',
              'Les gestionnaires des Réserves Biologiques (RBD) et des réserves de biosphère.',
            ],
          },
          "C'est une démarche structurée. Elle fournit un cadre méthodologique de référence permettant de passer d'un état des lieux du site à une stratégie de gestion concrète, pas à pas en se posant les bonnes questions.",
          "Elle propose une gestion resserrée sur les enjeux afin de concentrer les moyens sur les éléments les plus importants, en analysant leur état pour fixer les ambitions, puis les facteurs qui l'influencent pour mettre en place un plan d'action.",
          "Elle offre aussi la possibilité d'anticiper l'évaluation du plan de gestion en proposant l'utilisation de trois types d'indicateurs (Pression – État – Réponse) pour suivre les résultats des actions et adapter la gestion au fil du temps, en tenant compte des évolutions futures liées aux changements globaux.",
          "La méthode CT88 apporte surtout de la cohérence, de la hiérarchisation, de l'opérationnalité, de l'évaluation et de l'adaptabilité à la gestion d'une aire protégée.",
          {
            intro: 'Objectifs principaux :',
            items: [
              "Harmoniser les pratiques : proposer un cadre de référence unique pour tous les gestionnaires d'aires protégées (réserves naturelles, espaces naturels sensibles, etc.) et de sites Natura 2000 (documents d'objectifs ou DOCOB).",
              "Structurer l'action : aider à identifier les enjeux écologiques, analyser les pressions qui pèsent sur eux et définir des objectifs mesurables à long et court terme.",
            ],
          },
          "Tout l'outil est organisé autour du CT88, qui est le cadre de référence des plans de gestion de la plupart des aires protégées. Enjeux, objectifs, indicateurs et actions reprennent cette structure.",
        ],
        link: { label: 'En savoir plus sur la méthode', href: SITE_CONFIG.ct88GuideUrl },
      },
      {
        id: 'remplace-geonature',
        question: 'Cicada remplace-t-il GeoNature ?',
        answer: [
          "Non. Cicada ne reçoit pas de données naturalistes : il décrit les suivis et les inventaires réalisés (objectifs, protocoles, cibles…) c'est-à-dire ce qui est suivi, comment et pourquoi. La donnée d'observation reste dans les outils de saisie naturaliste.",
          "Une API publique expose les plans de gestion aux autres systèmes d'information, et un module « Travaux » interfacé avec GeoNature ou Geotrek fait partie des évolutions envisagées, qui dépendra des financements mobilisables.",
        ],
        link: {
          label: 'Voir les cinq modules',
          href: null,
          route: '/',
          fragment: 'fonctionnalites',
        },
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
          "Cicada est un logiciel libre : l'installer sur vos propres serveurs ne coûte rien en licence. Le coût correspond donc seulement à votre hébergement (serveurs) et le temps consacré à l'installation et la maintenance par votre équipe technique.",
          "Les instances de Réserves naturelles de France et de la Fédération des Conservatoires d'espaces naturels sont mises gratuitement à la disposition des structures de ces deux réseaux.",
          "Seul le service hébergé est payant : il s'adresse aux structures hors des deux réseaux, ou à celles qui veulent leur propre instance dédiée, qui souhaiteraient sous-traiter le déploiement et la maintenance de l'outil. Ses recettes contribuent par ailleurs au financement du développement.",
        ],
      },
      {
        id: 'sans-equipe-technique',
        question: 'Je n’ai pas d’équipe technique. Puis-je quand même utiliser Cicada ?',
        answer: [
          {
            intro:
              "Oui. Il existe trois voies pour utiliser l'outil, dont deux ne nécessitent pas d'équipe technique dédiée :",
            items: [
              "Si vous êtes un gestionnaire de réserve ou êtes un conservatoire d'espaces naturels, vous pouvez avoir gratuitement accès à l'instance de votre tête de réseau.",
              "Sinon il est possible de confier l'exploitation d'une instance dédiée à RNF : déploiement et maintenance (prestation payante).",
            ],
          },
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
          "Les arborescences des plans de gestion publiés sont consultables par les personnes ayant un compte CICADA : protocoles de suivi, indicateurs, grilles de lecture. C'est ce qui permet à chacun de s'inspirer du travail des autres au moment d'élaborer son propre plan.",
          "Les données de suivi de la mise en œuvre (temps passés, moyens engagés, avancement réel des actions) ne sont pas partagées et seule votre structure et celle hébergeant votre instance (hormis pour la prestation de sous-traitance RNF) peuvent les consulter. En cas de projet de valorisation de certaines de ces données à l'échelle territoriale, leur utilisation sera conditionnée à un consentement explicite des structures gestionnaires.",
        ],
      },
      {
        id: 'partage-obligatoire',
        question: 'Suis-je obligé de partager mes données ?',
        answer: [
          "Les données des arborescences des plans de gestion des gestionnaires saisissant sur l'instance de RNF ou de la FCEN seront automatiquement partagées via le module exploration des données. Celui-ci s'appuie sur une base commune, centralisée sur le serveur de RNF. Il fait la force de la mise en réseau et permet aux gestionnaires de s'inspirer des pratiques des autres. En saisissant sur une de ces instances, l'utilisateur consent au partage de ces données. Ces données centralisées pourront faire l'objet d'analyses visant à obtenir une vision territoriale des enjeux et des pratiques de gestion.",
          'Les données de suivis du plan de gestion ne sont quant à elles pas partagées, ni utilisables sans accord explicite de chaque structure gestionnaire, propriétaire de la donnée.',
          "Si vous souhaitez déployer votre propre instance, le partage de données de manière globale n'est pas obligatoire.",
          "Il relève d'un consentement explicite de votre structure, donné au moment du déploiement de l'instance. Si vous installez Cicada vous-même, vous décidez de contribuer ou non à cette base commune. Toutefois, si vous ne souhaitez pas partager vos données, l'ensemble du module exploration comportant toutes les données des gestionnaires contributeurs vous sera inaccessible : accéder aux données suppose d'y contribuer.",
        ],
      },
      {
        id: 'recuperer-mes-donnees',
        question: 'Puis-je récupérer mes données ?',
        answer: [
          "Oui, au-delà de la possibilité des différents exports qui vous permettent de valoriser les données saisies (première trame du volume stratégique du plan, fiches actions, alimentation des rapports d'activité et des évaluations à mi-parcours et de fin de parcours, graphiques de bilan…), vous pouvez contacter l'administrateur de l'instance sur laquelle vous saisissez vos données, afin de récupérer vos données brutes.",
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
          "Par le dépôt public du projet, qui accueille le code, les demandes d'évolution et les signalements d'anomalie. Les contributions sont examinées par l'équipe du projet. Vous pouvez aussi transmettre vos questions/suggestions via le formulaire de contact.",
          "Les discussions techniques (installation, architecture, entraide) se tiennent sur le salon Matrix, ouvert et consultable avec n'importe quel compte.",
        ],
        link: { label: 'Rejoindre la communauté', href: null, route: '/', fragment: 'communaute' },
      },
      {
        id: 'developper-un-module',
        question: 'Puis-je développer mon propre module ?',
        answer: [
          "Oui. L'architecture est modulaire et le code est ouvert : toute structure peut contribuer ou développer ses propres modules, dans le respect de l'architecture commune.",
          'Cicada entre dans une véritable démarche communautaire et collaborative. RNF et la FCEN recommandent vivement à ce que les nouveaux projets de développement leur soient communiqués afin de les ancrer dans cette démarche collaborative, et optimiser les nouveaux développements en leur permettant de répondre aux besoins du plus grand nombre.',
        ],
      },
      {
        id: 'qui-finance',
        question: 'Qui finance Cicada ?',
        answer: [
          "Le projet a vu le jour dans le cadre du programme européen LIFE BIODIV'FRANCE, cofinancé par l'Union européenne et le ministère de la Transition écologique, en partenariat avec la LPO, PatriNat et l'Office français de la biodiversité. Sa maintenance est donc garantie jusqu'à 2029.",
          "RNF et la FCEN œuvrent déjà afin de trouver les fonds nécessaires au maintien de l'outil à l'issue du LIFE Biodiv'France.",
          "Les recettes du service hébergé contribuent par ailleurs au financement de la maintenance et au développement de l'outil, qui reste libre et gratuit à installer.",
        ],
      },
    ],
  },
];
