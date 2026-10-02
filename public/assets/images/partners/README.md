# Logos des partenaires

Fichiers fournis par les structures. Les chemins sont déclarés dans
`src/app/shared/components/partner-logos/partner.ts` : si un nom de fichier
change, c'est le seul endroit à mettre à jour.

| Fichier | Structure | Format |
|---------|-----------|--------|
| `rnf.svg` | Réserves naturelles de France | SVG |
| `cen.png` | Fédération des Conservatoires d'espaces naturels | PNG transparent |
| `ofb.svg` | Office français de la biodiversité | SVG |
| `lpo.png` | Ligue pour la protection des oiseaux | PNG transparent |
| `patrinat.png` | PatriNat | PNG transparent |

## Contraintes d'affichage

Les proportions vont du simple au quadruple d'un logo à l'autre : celui de la
Fédération est trois fois plus large que haut, celui de la LPO est plus haut que
large. Le composant fixe donc la **hauteur** (64 px dans la page, 44 px en pied
de page) et **bride la largeur**, avec `object-fit: contain` pour que ce bridage
réduise l'image au lieu de l'écraser. Un nouveau logo, quelle que soit sa forme,
s'inscrit dans la même boîte que les autres sans réglage supplémentaire.

Deux points à respecter en cas de remplacement :

- **Fond transparent.** Les sections claires affichent les logos sans aucun
  fond ; un fond blanc opaque y dessinerait un rectangle visible.
- **Dimensions intrinsèques pour un SVG.** Un SVG qui ne porte qu'un `viewBox`,
  sans attributs `width` et `height`, s'effondrerait si le composant laissait
  ses deux dimensions libres. C'est pour cela que la hauteur est fixée et non
  seulement plafonnée.

Le pied de page est bleu-vert, alors que ces logos sont dessinés en couleurs
sombres pour un fond clair : il les pose donc sur un bandeau blanc. C'est le
seul endroit où un fond est ajouté.

Un logo absent n'est pas un problème : le composant affiche alors le nom de la
structure en toutes lettres dans une pastille, jamais une image cassée.

## Bloc marque européen

Le bloc « UE + LIFE BIODIV'FRANCE » ne se dépose pas ici : il est déjà présent
(`../bloc-marque-ue-life-biodiv.jpg`) et ne doit **pas** être recomposé,
retouché ni reconstitué à partir de ses éléments.
