# Rapport Technique et Fonctionnel – Plateforme E-Commerce « Prince Délice »
**URL Officielle :** `https://princedelice.manus.space`  
**Date :** Août 2026  
**Contexte :** Plateforme e-commerce haut de gamme dédiée à la vente de fruits de dessert frais en République Centrafricaine (Bangui), intégrant des paiements mobiles sécurisés (Orange Money), une gestion logistique par arrondissements, un suivi GPS des livreurs, une double authentification (MFA) et une expérience bilingue (Français/Sango).

---

## 1. Introduction et Objectifs du Projet

La plateforme **Prince Délice** a été conçue pour répondre aux défis spécifiques de la distribution de produits frais (fruits de dessert) à Bangui :
- **Fraîcheur et Périssabilité :** Gestion rigoureuse des stocks, affichage de badges de fraîcheur, et politique stricte de retour sous 24h avec sélection visuelle de photos.
- **Logistique Urbaine Locale :** Découpage des livraisons par arrondissements de Bangui avec calcul automatique des frais et des délais (30-45 min).
- **Inclusion Financière :** Paiements par Orange Money, cartes bancaires (Visa/Mastercard) et paiement à la livraison.
- **Sécurité et Confiance :** Authentification multifacteur (MFA) par Google Authenticator et codes OTP par SMS pour sécuriser les comptes et les transactions.

---

## 2. Analyse Détaillée des Frameworks et Choix Technologiques

Pour garantir des performances optimales, une maintenabilité exemplaire et une scalabilité à toute épreuve, la plateforme s'appuie sur une stack technologique moderne et rigoureusement sélectionnée :

### A. Frontend : React 19 + TypeScript
- **Pourquoi ce choix ?** React 19 apporte les dernières optimisations du DOM virtuel, une gestion ultra-fluide des états asynchrones et une excellente compatibilité avec les composants interactifs. TypeScript garantit un typage statique strict, éliminant les erreurs de manipulation de données (produits, paniers, commandes) dès la compilation.
- **Rôle dans le projet :** Construction de l'interface utilisateur (catalogue, tunnel de commande, espace client, back-office administrateur, sélecteur de devises XAF/EUR, mode sombre).

### B. Style & Design : Tailwind CSS 4
- **Pourquoi ce choix ?** Tailwind CSS 4 utilise un moteur de compilation JIT (Just-In-Time) extrêmement rapide et un système de classes utilitaires basé sur des tokens CSS modernes. Il permet de concevoir un design épuré, élégant et entièrement responsive sans alourdir le poids des feuilles de style.
- **Rôle dans le projet :** Uniformisation de la charte graphique aux teintes chaleureuses et naturelles (vert forêt `#1E3F20`, accents dorés `#D97706`, fonds sable `#FDFBF7`) et adaptation parfaite sur tous les écrans mobiles (smartphones à Bangui).

### C. Communication Client-Serveur : tRPC (v11)
- **Pourquoi ce choix ?** tRPC permet d'obtenir un typage de bout en bout (*end-to-end type safety*) entre le serveur Node.js et le client React sans avoir à rédiger manuellement des fichiers de contrats (Swagger/OpenAPI) ou des clients Axios redondants. Si une structure de données change en base, le compilateur prévient immédiatement si le front l'utilise mal.
- **Rôle dans le projet :** Gestion de l'ensemble des procédures API (catalogue produits, création de commandes, gestion du panier, authentification MFA, programme de parrainage et tableau de bord des livreurs).

### D. Base de Données & ORM : MySQL (TiDB) + Drizzle ORM
- **Pourquoi ce choix ?** MySQL/TiDB offre une robustesse relationnelle indispensable pour un site e-commerce (intégrité des transactions financières et des commandes). **Drizzle ORM** est un ORM TypeScript léger, ultra-rapide et sécurisé qui génère des requêtes SQL optimisées tout en conservant un schéma déclaratif clair.
- **Rôle dans le projet :** Stockage structuré des tables utilisateurs, produits, commandes, lignes de commande, zones de livraison, programmes de parrainage, abonnements push, points de fidélité, logs SMS et gestion des livreurs.

### E. PWA (Progressive Web App) & Mobile-First
- **Pourquoi ce choix ?** Les utilisateurs accèdent majoritairement au site via des smartphones sur des réseaux mobiles fluctuants à Bangui. La technologie PWA (via `manifest.json` et des en-têtes anti-traduction DOM) permet d'installer l'application directement sur l'écran d'accueil du téléphone et d'assurer une résilience accrue.

---

## 3. Fonctionnalités Clés et Architecture Fonctionnelle

### A. Catalogue Bilingue (Français / Sango) & Devises (XAF / EUR)
- Bascule instantanée de la langue de l'interface et affichage des bienfaits santé spécifiques pour chaque fruit (mangues, ananas, bananes, papayes, avocats, etc.).
- Sélecteur de devises permettant de visualiser les prix en Francs CFA (XAF) ou en Euros (EUR).

### B. Tunnel de Commande & Paiement Sécurisé
- Sélection précise de l'arrondissement de Bangui (1er au 8e) avec calcul des frais de port et du délai estimé.
- Simulation animée de la validation du paiement **Orange Money** avec étapes dynamiques.
- Options de paiement par carte bancaire et paiement à la livraison.

### C. Espace Client et Programme de Fidélité / Parrainage
- **Suivi des Commandes :** Affichage en temps réel des statuts (*Validée*, *En préparation*, *En cours de livraison*, *Livré avec succès*).
- **Fidélité par Points :** 1 point gagné par tranche de 100 FCFA, échangeable en bons de réduction immédiats sur le panier.
- **Parrainage :** Génération d'un code unique (`PRINCE-...`) avec suivi des filleuls et boutons de partage direct sur WhatsApp et SMS.
- **Facturation PDF :** Génération et téléchargement instantané de la facture détaillée pour chaque commande.

### D. Back-Office Administrateur & Gestion des Livreurs
- **Gestion du Catalogue & des Stocks :** Ajout de produits, mise à jour des prix (100 à 500 FCFA) et des stocks.
- **Suivi et Assignation des Livreurs :**
  - Inscription des coursiers (Nom, téléphone, type de véhicule, arrondissement assigné).
  - Assignation des commandes en cours à un livreur disponible en un clic.
  - Suivi GPS en direct de la tournée et validation du retour au dépôt central (PK0).
- **Rapports de Vente & Analytique :** Tableaux de bord graphiques des ventes par catégorie et par quartier de Bangui, avec génération de rapports quotidiens.

---

## 4. Conclusion
La plateforme **Prince Délice** représente une solution e-commerce de pointe, parfaitement adaptée aux réalités opérationnelles et culturelles de la République Centrafricaine. Grâce à une architecture technique moderne, sécurisée et modulaire, elle garantit une expérience utilisateur fluide, rapide et hautement professionnelle.
