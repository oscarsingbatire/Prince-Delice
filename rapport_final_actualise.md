# RAPPORT TECHNIQUE ET FONCTIONNEL FINAL : PLATEFORME E-COMMERCE « PRINCE DÉLICE »

## 1. Introduction et Contexte du Projet
La plateforme e-commerce **Prince Délice** (initialement *Fruits Centrafrique*) a été développée sur mesure pour répondre aux besoins spécifiques de la vente et de la logistique des fruits de dessert frais à **Bangui, en République Centrafricaine**. Conçue pour offrir une expérience utilisateur haut de gamme, fluide et sécurisée sur mobile comme sur ordinateur, la plateforme intègre l'ensemble des exigences du commerce moderne (paiements mobiles Orange Money, authentification multifacteur MFA, gestion logistique par arrondissement, suivi GPS en temps réel des livreurs et calcul des commissions).

---

## 2. Architecture Technique & Choix des Frameworks

La robustesse et la scalabilité de l'application reposent sur une stack moderne hautement performante :

| Technologie / Framework | Rôle et Justification dans le Projet |
| :--- | :--- |
| **React 19** | **Bibliothèque UI Frontend** : Utilisée pour sa réactivité et sa gestion modulaire des composants, assurant une interface fluide et instantanée. |
| **Tailwind CSS 4** | **Framework CSS Utility-First** : Permet un design system élégant, des animations fluides et un responsive design rigoureux sur tous les formats de smartphones. |
| **tRPC (v11)** | **Couche API End-to-End** : Garantit un typage statique complet entre le serveur et le client sans avoir à maintenir des fichiers de contrats ou de schémas séparés, éliminant les erreurs d'API à la compilation. |
| **Drizzle ORM & MySQL** | **Gestion de Base de Données** : Offre des requêtes SQL ultra-rapides, un schéma fortement typé et une gestion sécurisée des transactions (utilisateurs, commandes, stocks, commissions, parrainages). |
| **Vite** | **Bundler & Serveur de Développement** : Assure des temps de compilation instantanés (HMR) et des builds de production optimisés. |

---

## 3. Fonctionnalités Clés et Modules Avancés

### A. Catalogue Bilingue & Internationalisation (Français / Sango)
- **Catalogue Dynamique** : Présentation des fruits de dessert locaux (Mangues, Ananas, Bananes, Papayes, Avocats, etc.) avec des prix adaptés (100 à 500 FCFA) et des badges de fraîcheur.
- **Sélecteur de Langue** : Bascule instantanée entre le **Français** et le **Sango** (langue nationale centrafricaine).
- **Sélecteur de Devises** : Conversion en temps réel des prix entre le **Franc CFA (XAF)** et l'**Euro (EUR)**.

### B. Tunnel de Commande & Paiement Sécurisé
- **Sélection des Arrondissements de Bangui** : Calcul automatique des frais de livraison et des délais selon le secteur (1er au 8e arrondissement, Bimbo, PK5...).
- **Modes de Paiement** : Intégration d'**Orange Money**, cartes bancaires et paiement à la livraison (COD).
- **Validation Animée** : Modale interactive avec étapes dynamiques et redirection vers la confirmation.

### C. Espace Client et Sécurité Avancée (MFA)
- **Authentification Multifacteur (MFA)** : Double sécurité via **Google Authenticator (TOTP)** et code **OTP par SMS**.
- **Programme de Parrainage & Fidélité** : Code unique de parrainage (`PRINCE-...`), système de points cumulés par tranche d'achat convertibles en bons de réduction, et tableau de suivi des filleuls.
- **Gestion des Retours (24h)** : Soumission de réclamations pour produits périssables avec choix visuel de photos.
- **Facturation PDF** : Génération et téléchargement instantané des factures officielles de commande.

### D. Back-Office Administrateur & Gestion des Livreurs
- **Suivi des Ventes & Statistiques** : Chiffre d'affaires en temps réel, rapports de vente automatisés et graphiques de performance par catégorie.
- **Gestion Logistique & Carte Interactive** : Inscription des livreurs (nom, téléphone, moto, secteur), assignation des commandes en un clic, et **suivi GPS en temps réel sur la carte interactive de Bangui**.
- **Tableau de Bord des Commissions** : Calcul automatique des primes de tournée (500 FCFA par livraison réussie) et **option de validation des paiements avec horodatage (« Marquer comme Réglé »)** pour le suivi de la paie des coursiers.

---

## 4. Conclusion & Perspectives
La plateforme **Prince Délice** est une solution e-commerce clé en main, sécurisée et parfaitement adaptée aux réalités logistiques de Bangui. Elle combine une expérience d'achat moderne pour les clients et un outil de pilotage complet pour les administrateurs et livreurs.
