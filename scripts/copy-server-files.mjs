/**
 * Copie les fichiers destinés au serveur Apache dans le résultat du build.
 *
 * Pourquoi un script et non une entrée `assets` d'`angular.json` : le serveur de
 * développement sert tout ce qui est déclaré dans `assets`. Il renverrait donc
 * le **code source** de `contact.php` sur `/api/contact.php`, au lieu de laisser
 * le proxy router la requête vers un vrai PHP — rendant le formulaire
 * intestable en local. Ces fichiers ne sont pas des ressources du navigateur :
 * ils n'ont rien à faire dans `assets`.
 */

import { cp } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'deploy/ovh/www');
const destination = resolve(root, 'dist/cicada-vitrine/browser');

await cp(source, destination, { recursive: true });

console.log(`Fichiers serveur copiés : ${source} → ${destination}`);
