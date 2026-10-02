# Déploiement sur un hébergement web OVH

Le site est entièrement prérendu : il n'y a rien à exécuter côté serveur, sauf
`api/contact.php` qui ouvre les tickets Zammad. Un hébergement mutualisé avec
PHP suffit — pas de base de données, pas de Node.

## 1. Préparer la configuration

Copier `cicada-vitrine-config.sample.php` sous le nom
`cicada-vitrine-config.php`, le remplir, puis le déposer **à côté** du dossier
`www`, jamais dedans :

```
/home/<compte>/
  ├── cicada-vitrine-config.php   ← secrets, hors de portée d'Apache
  └── www/                        ← le site
      ├── index.html
      ├── .htaccess
      └── api/contact.php
```

Les quatre valeurs attendues sont décrites dans le modèle. Côté Zammad, elles
viennent d'un **agent dédié** disposant de la seule permission `ticket.agent`
sur le groupe visé : si le jeton fuite, la portée reste limitée à la création de
tickets dans ce groupe.

## 2. Construire

```bash
nvm use && npm ci && npm run build
```

Le résultat complet — HTML prérendu, assets, PDF, `.htaccess` et
`api/contact.php` — se trouve dans `dist/cicada-vitrine/browser`. Environ 2,6 Mo.

## 3. Téléverser

Envoyer le **contenu** de `dist/cicada-vitrine/browser` dans `www`, par SFTP ou
par le gestionnaire de fichiers OVH. Par exemple :

```bash
rsync -av --delete dist/cicada-vitrine/browser/ <compte>@ftp.cluster0XX.hosting.ovh.net:www/
```

`--delete` retire les anciens fichiers JS et CSS, dont le nom change à chaque
build. Attention : il ne faut pas que `cicada-vitrine-config.php` se trouve dans
`www`, sinon il serait supprimé — et il n'a de toute façon rien à y faire.

## 4. Vérifier

```bash
curl -i https://votre-domaine/api/contact.php
```

La réponse attendue est `405 {"ok":false,"error":"method_not_allowed"}` : le
script est en place et refuse les requêtes qui ne sont pas des envois de
formulaire. Une réponse `500 misconfigured` signifie que le fichier de
configuration n'est pas trouvé ou qu'une valeur manque ; le détail est écrit
dans le journal d'erreurs PHP de l'hébergement.

Ensuite, envoyer une vraie demande depuis le formulaire et vérifier que le
ticket arrive dans Zammad.

## Prérequis de l'hébergement

| Besoin | Pourquoi |
|--------|----------|
| PHP 8.0 ou plus | `contact.php` utilise des types d'union et `never` |
| Sorties HTTPS autorisées | appels à Turnstile et à Zammad |
| `cURL` (ou `allow_url_fopen`) | le script gère les deux cas |
| ~3 Mo d'espace | le site pèse 2,6 Mo |

Pas de base de données, pas de cron, pas d'accès shell nécessaires.

## Tester en local

Avec PHP installé :

```bash
npm run build
ZAMMAD_URL=https://support.exemple.org ZAMMAD_TOKEN=xxx TURNSTILE_SECRET=yyy npm run api
```

puis `npm start` dans un autre terminal : le proxy du serveur de développement
route `/api` vers ce PHP. Les variables d'environnement l'emportent sur le
fichier de configuration, ce qui évite de poser des secrets dans `dist/`.

Sans PHP sur la machine, la même chose via Docker :

```bash
docker run --rm -p 8788:8080 -e PHP_CLI_SERVER_WORKERS=4 -e ZAMMAD_URL=... -e ZAMMAD_TOKEN=... -e TURNSTILE_SECRET=... -v "$PWD/dist/cicada-vitrine/browser:/app:ro" -w /app php:8.3-cli php -S 0.0.0.0:8080 -t /app
```

## Et si l'hébergement change ?

`functions/api/contact.ts` est l'équivalent strict de `contact.php` pour
Cloudflare Pages. Pour y basculer, il suffit de remplacer `contactEndpoint` par
`/api/contact` dans `src/app/core/site-config.ts` — et de corriger l'hébergeur
dans les mentions légales.
