# Fruits Centrafrique

Application web de vente et de gestion de commandes de fruits frais, conçue pour le marché de Bangui, en République centrafricaine. Le dépôt contient une interface React/TypeScript, une API Node.js/Express avec tRPC et une couche de données MySQL utilisant Drizzle ORM.

> **État et limites importantes** — Ce dépôt est le code source d’un projet applicatif ; sa présence sur GitHub ne signifie pas que toutes les intégrations sont prêtes pour une exploitation commerciale. Les paiements Orange Money et par carte, les SMS/OTP et certaines notifications peuvent être simulés ou dépendre de services externes. Ne les considérez pas comme des transactions réelles sans intégrer et tester les fournisseurs correspondants. L’authentification, le stockage et certaines fonctions de développement utilisent des composants Manus ; un déploiement indépendant peut nécessiter leur remplacement ou leur configuration.

## Fonctionnalités

Selon les modules présents dans le projet, l’application comprend notamment :

- catalogue de produits, panier et parcours de commande ;
- gestion de commandes, stocks, zones de livraison et retours ;
- interface d’administration, avis et demandes d’assistance ;
- prise en charge d’une base MySQL via Drizzle ORM ;
- interface React et API tRPC.

La disponibilité effective de chaque fonction dépend de la configuration, des services externes et de l’environnement d’exécution.

## Technologies

- React, TypeScript et Vite
- Node.js, Express et tRPC
- MySQL et Drizzle ORM
- pnpm, Vitest et Prettier

## Prérequis

- Node.js compatible avec les dépendances du projet ;
- pnpm (la version déclarée dans `package.json` est `pnpm@10.4.1`) ;
- MySQL/TiDB pour les fonctions nécessitant la base de données.

## Installation et commandes

```bash
corepack enable
pnpm install
pnpm dev
```

Autres commandes disponibles :

```bash
pnpm check       # Vérification TypeScript
pnpm test        # Tests Vitest
pnpm build       # Build du client et du serveur
pnpm start       # Démarrage du build de production
pnpm db:push     # Génération puis application des migrations Drizzle
```

Les commandes de base de données nécessitent une base configurée et accessible. Vérifie la cible et sauvegarde les données avant d’exécuter des migrations : ne lance pas `pnpm db:push` contre une base de production par défaut.

## Configuration

Le serveur charge les variables d’environnement avec `dotenv/config`. Crée un fichier `.env` local à la racine (il ne doit pas être ajouté à Git) et configure les variables nécessaires à ton environnement :

| Variable | Usage |
| --- | --- |
| `DATABASE_URL` | Connexion MySQL/TiDB ; nécessaire aux opérations de base de données et aux commandes Drizzle. |
| `JWT_SECRET` | Secret de session/JWT ; définis une valeur aléatoire et privée pour chaque environnement. |
| `VITE_APP_ID` | Identifiant d’application utilisé par l’intégration d’authentification. |
| `OAUTH_SERVER_URL` | URL du serveur OAuth configuré. |
| `OWNER_OPEN_ID` | Identifiant du compte propriétaire/admin attendu par l’application. |
| `PORT` | Port HTTP (3000 par défaut). |
| `NODE_ENV` | Mode d’exécution (`development` ou `production`). |
| `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` | Variables liées aux services Manus/Forge intégrés ; nécessaires uniquement aux fonctions qui les utilisent. La clé doit rester secrète. |

Les intégrations OAuth, Manus/Forge, stockage, paiement, SMS et notifications peuvent nécessiter des paramètres supplémentaires fournis par leurs services respectifs. Consulte le code de l’intégration concernée avant le déploiement ; ne publie jamais de clés, mots de passe, données clients ou fichiers `.env`.

## Base de données

Le schéma est dans `drizzle/schema.ts` et les migrations SQL dans `drizzle/`. Configure `DATABASE_URL` pour une instance de développement, puis exécute les commandes appropriées. Les migrations peuvent modifier les données ; vérifie-les avant application.

## Vérifications avant publication ou déploiement

```bash
pnpm check
pnpm test
pnpm build
```

Ces commandes sont documentées, mais leur présence ne garantit pas qu’elles passent dans tous les environnements. Vérifie aussi les secrets, les données personnelles, les contenus des documents et les droits sur les images et autres ressources avant de rendre le dépôt public.

## Documentation du dépôt

Les fichiers `project_report.md`, `rapport_final_actualise.md`, `rapport_technique_detaille.md` et les autres rapports sont des documents de projet. Leurs descriptions fonctionnelles ne constituent pas une preuve de l’intégration réelle d’un fournisseur de paiement, SMS ou d’un service externe. Vérifie et actualise ces rapports avant de les présenter comme documentation de production.

## Licence

Le projet déclare la licence MIT dans `package.json`. Voir [`LICENSE`](LICENSE). Vérifie que tu détiens les droits nécessaires sur tout le code et les ressources que tu publies, notamment les éléments provenant de tiers.
