# Prince-Delice

Application web de commerce et de gestion de commandes de fruits frais, destinée au marché de Bangui, en République centrafricaine. Le dépôt contient une interface React/TypeScript, une API Node.js/Express avec tRPC et une couche de données MySQL gérée avec Drizzle ORM. Certains documents du projet utilisent aussi le nom « Prince Délice ».

> **À lire avant tout déploiement :** le code contient des intégrations liées à Manus/Forge et des parcours de démonstration. La présence d’un écran ou d’un mode de paiement dans l’interface ne signifie pas qu’un fournisseur de paiement réel est connecté. Les paiements, OTP/SMS et notifications doivent être configurés auprès de fournisseurs adaptés, puis testés avant tout usage réel. L’authentification OAuth dépend également d’un serveur OAuth configuré. Ne traite pas ce dépôt comme prêt pour une exploitation commerciale sans audit et tests de sécurité.

## Fonctionnalités

Le projet comprend des modules pour le catalogue, le panier et les commandes, les stocks et zones de livraison, les retours, l’administration, les avis et les demandes de support. Leur fonctionnement effectif dépend de la configuration de l’application, de la base de données et des services externes.

## Stack technique

- React, TypeScript et Vite
- Node.js, Express et tRPC
- MySQL/TiDB avec Drizzle ORM
- pnpm, Vitest et Prettier

## Prérequis

- Node.js compatible avec les dépendances du projet
- Corepack et pnpm (la version `packageManager` du projet est `pnpm@10.4.1`)
- MySQL ou TiDB si tu veux utiliser les fonctions nécessitant la base de données

## Installation

```bash
corepack enable
pnpm install
cp .env.example .env
```

Modifie ensuite `.env` avec les paramètres de ton environnement. Ne partage pas ce fichier et ne le committe jamais. Pour démarrer le serveur de développement :

```bash
pnpm dev
```

## Variables d’environnement

Le fichier [`.env.example`](.env.example) liste les variables reconnues par la configuration serveur. Les paramètres OAuth et Manus/Forge sont requis uniquement pour les fonctionnalités qui s’appuient sur ces services. `VITE_APP_ID` est un identifiant utilisé par l’application, pas un emplacement pour une clé secrète : toute variable préfixée par `VITE_` peut être intégrée au bundle client.

Génère un `JWT_SECRET` aléatoire et privé pour chaque environnement. Utilise une base de données de développement pour les essais. Les migrations peuvent modifier les données : vérifie la cible et sauvegarde la base avant toute migration, en particulier avant `pnpm db:push`.

## Commandes

```bash
pnpm dev       # Serveur de développement
pnpm check     # Vérification TypeScript
pnpm test      # Tests Vitest
pnpm build     # Build du client et du serveur
pnpm start     # Démarrage du build de production
pnpm db:push   # Génération et application des migrations Drizzle
```

Les commandes `check`, `test` et `build` sont documentées ici mais ne sont pas garanties comme exécutées ou validées par la publication de ce README. Lance-les dans ton environnement avant un déploiement.

## Base de données

Le schéma est défini dans `drizzle/schema.ts` et les migrations SQL se trouvent dans `drizzle/`. Configure `DATABASE_URL` vers une instance de développement avant d’exécuter les commandes Drizzle. Ne lance pas les migrations sur une base de production sans revue et sauvegarde préalable.

## Publication et sécurité

Avant de rendre le dépôt public ou de déployer l’application :

- vérifie le code et tout l’historique Git à la recherche de clés, mots de passe, jetons et données personnelles ;
- vérifie les rapports, archives, captures, images et autres ressources, ainsi que les droits de publication associés ;
- remplace ou configure les dépendances Manus/Forge et OAuth selon ton hébergement ;
- branche et teste de vrais fournisseurs avant de présenter des paiements ou notifications comme opérationnels ;
- lance `pnpm check`, `pnpm test` et `pnpm build`, puis réalise des tests de déploiement et de sécurité.

Les rapports présents dans le dépôt sont des documents de projet et peuvent décrire des objectifs ou des fonctionnalités de démonstration. Ils ne constituent pas une preuve d’intégration de production. Vérifie également les URLs, numéros de téléphone et affirmations commerciales avant publication.

## Licence

Le dépôt déclare la licence MIT dans `package.json` et le fichier [`LICENSE`](LICENSE). Vérifie que tu détiens les droits nécessaires sur le code et les ressources que tu publies, notamment les éléments provenant de tiers.
