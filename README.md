# Site vitrine de CICADA

Page unique de présentation de [CICADA](https://github.com/RNF-SI/Cicada), l'outil
de gestion des plans de gestion des aires protégées porté par la Fédération des
Conservatoires d'espaces naturels et Réserves naturelles de France.

Angular 22, rendu **statique prérendu** : le build produit du HTML complet,
déposable sur n'importe quel serveur web ou CDN. Le seul morceau dynamique est
une fonction serverless qui ouvre un ticket Zammad depuis le formulaire de
contact.

## Démarrer

Node **≥ 22.22.3** est requis (voir `.nvmrc`).

```bash
nvm use && npm install && npm start
```

Le site est servi sur <http://localhost:4200>. Le formulaire de contact a besoin
de la fonction serverless : voir « Formulaire de contact » plus bas.

| Commande                | Effet                                                                      |
| ----------------------- | -------------------------------------------------------------------------- |
| `npm start`             | Serveur de développement, avec proxy `/api` vers l'endpoint local          |
| `npm run build`         | Build prérendu dans `dist/cicada-vitrine/browser`, fichiers Apache compris |
| `npm test`              | Tests unitaires (Vitest)                                                   |
| `npm run format`        | Prettier sur `src/` et `functions/`                                        |
| `npm run api`           | Endpoint de contact en local (PHP, port 8788)                              |
| `npm run typecheck:api` | Typage de la variante Cloudflare                                           |

## Design

Le design suit **strictement** le Kit UI Biodiv' de l'application CICADA :
couleurs, typographie Nunito, espacements, rayons, ombres et motifs décoratifs
sont repris du dépôt. Les valeurs vivent dans
[`src/assets/scss/_tokens.scss`](src/assets/scss/_tokens.scss), qui cite sa
source — la charte fait foi dans le dépôt CICADA, pas ici.

La vitrine n'embarque pas Angular Material : les composants sont écrits à la
main sur ces mêmes tokens, ce qui évite de traîner la bibliothèque et ses 41 ko
de surcharges pour une page de contenu.

## Structure

```
src/app/
  core/                   Configuration du site, modèle et service de contact
  shared/components/      Bandeau, pied de page, mentions UE, logos partenaires,
                          aperçu PDF, captcha
  features/landing/       La page : une section par composant, contenu éditorial
                          centralisé dans landing-content.ts
  features/legal/         Mentions légales et données personnelles
src/environments/         Clé publique du captcha et instance Matomo : les vraies
                          valeurs en production, neutralisées en développement
                          (substitution par ng serve)
deploy/ovh/www/api/contact.php   Endpoint de contact → Zammad (celui qui est déployé)
deploy/ovh/www/.htaccess         Configuration Apache (404, cache, en-têtes)
deploy/ovh/               Modèle de configuration et procédure de déploiement
scripts/                  Copie des fichiers Apache dans le build
functions/api/contact.ts  Même chose que contact.php, pour Cloudflare Pages
```

Le contenu éditorial (modules, avantages des deux modes de déploiement,
documents, feuille de route) est regroupé dans
[`landing-content.ts`](src/app/features/landing/landing-content.ts) : c'est le
fichier à ouvrir pour faire évoluer le texte, pas les gabarits.

Les URL, l'endpoint de contact et la clé publique du captcha sont dans
[`site-config.ts`](src/app/core/site-config.ts).

## Mesure d'audience

La fréquentation est mesurée par le Matomo de Réserves naturelles de France
(`https://matomo.reserves-naturelles.org`, site n° 11), piloté par
[`core/matomo.ts`](src/app/core/matomo.ts).

Le traqueur est configuré **sans cookie** (`disableCookies`) et respecte « Do
Not Track » : le site reste ainsi exempté de bandeau de consentement, et les
mentions légales peuvent continuer d'affirmer qu'il ne dépose rien. Côté
instance, l'anonymisation des adresses IP doit rester active (Administration →
Confidentialité) : c'est le seul réglage que le site ne peut pas imposer.

Le site étant une application monopage, les pages vues sont signalées à la main
à chaque navigation. Les liens à ancre du bandeau (`/#contact`…) ne comptent
pas : seul un changement de chemin déclenche un comptage.

Rien n'est chargé ni compté pendant le prérendu, ni en développement —
`matomoUrl` y vaut `null`, ce qui désactive entièrement le traqueur. Pour
vérifier le câblage en local, lui donner temporairement une valeur dans
`src/environments/environment.development.ts` et lire `window._paq` dans la
console.

## Formulaire de contact

L'adresse de support **n'apparaît nulle part** dans le HTML servi. Le navigateur
poste sur `/api/contact.php` ; ce script vérifie le captcha puis crée le ticket
via l'API Zammad. Le jeton Zammad, la clé secrète du captcha et l'adresse de
support restent côté serveur.

Trois barrières anti-spam, complémentaires : aucune adresse à moissonner, une
vérification Cloudflare Turnstile revalidée côté serveur, et un champ piège
invisible.

### Configuration

Quatre valeurs, à déposer dans un fichier **au-dessus de la racine web** (ou en
variables d'environnement, qui l'emportent) :

| Variable           | Rôle                                                      |
| ------------------ | --------------------------------------------------------- |
| `ZAMMAD_URL`       | Racine de l'instance Zammad, sans slash final             |
| `ZAMMAD_TOKEN`     | Jeton d'API d'un agent dédié autorisé à créer des tickets |
| `ZAMMAD_GROUP`     | Groupe destinataire (défaut : `Users`)                    |
| `TURNSTILE_SECRET` | Clé secrète Cloudflare Turnstile                          |

Modèle et procédure : [`deploy/ovh/`](deploy/ovh/). Créer le jeton Zammad depuis
un **agent dédié**, avec les seules permissions nécessaires sur le groupe visé :
si le jeton fuite, la portée reste limitée.

Côté client, la clé **publique** du captcha vit dans `src/environments/` : la
vraie clé (restreinte au domaine) pour un build de production, la clé de test de
Cloudflare pour `ng serve`, qui fonctionne sur `localhost`. Il n'y a donc rien à
intervertir à la main.

### En local

```bash
npm run build
ZAMMAD_URL=... ZAMMAD_TOKEN=... TURNSTILE_SECRET=... npm run api
```

puis `npm start` dans un autre terminal : le proxy de `ng serve` route `/api`
vers ce PHP. Sans PHP installé, la variante Docker est dans
[`deploy/ovh/README.md`](deploy/ovh/README.md).

## Déploiement

Hébergement web OVH mutualisé, avec PHP. Rien d'autre à exécuter côté serveur.

- **Contenu à téléverser dans `www`** : tout `dist/cicada-vitrine/browser`
  (~2,6 Mo), `.htaccess` et `api/contact.php` compris
- **Commande de build** : `npm run build`
- **Secrets** : dans `cicada-vitrine-config.php`, à côté de `www`, jamais dedans

La procédure complète est dans [`deploy/ovh/README.md`](deploy/ovh/README.md).

Aucune réécriture d'URL n'est nécessaire : les deux pages sont prérendues en
fichiers (`index.html` et `mentions-legales/index.html`), et le `.htaccess`
renvoie l'accueil sur les URL inconnues.

Pour un autre hébergeur, `functions/api/contact.ts` est l'équivalent strict du
script PHP pour Cloudflare Pages.

## À compléter avant la mise en ligne

- [ ] **Logos partenaires** : les cinq fichiers présents sont extraits du flyer
      et de la note de présentation, donc limités à ~200 px de haut. Demander les
      SVG aux services communication. Voir
      [`public/assets/images/partners/README.md`](public/assets/images/partners/README.md).
- [ ] **`appUrl`** dans `site-config.ts` : URL de l'instance publique. Tant
      qu'elle vaut `null`, les boutons d'accès renvoient vers le formulaire.
- [ ] **Mentions légales** : le numéro de téléphone de l'hébergeur n'est pas
      renseigné, alors que la LCEN le demande. Ajouter celui d'OVHcloud dans
      `legal.html`.
- [ ] **Secrets Zammad et Turnstile** : déposer `cicada-vitrine-config.php` sur
      l'hébergement, cf. [`deploy/ovh/README.md`](deploy/ovh/README.md).
- [ ] **Validation LIFE** : le guide « Mentions et visuels obligatoires » impose
      de soumettre le support à la coordination communication du LIFE avant
      diffusion. Le bloc marque et la clause de non-responsabilité sont repris à
      l'identique de l'application et ne doivent pas être reformulés.

## Licence

Le code de cette vitrine suit la licence de CICADA : **GNU GPL v3**. Les logos et
le bloc marque européen restent la propriété de leurs titulaires.
