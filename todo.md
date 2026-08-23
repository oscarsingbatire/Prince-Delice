# Project TODO

- [x] Définition du schéma de base de données (produits, stocks, commandes, livraisons, retours, utilisateurs, MFA)
- [x] Génération et application des migrations SQL via drizzle-kit et webdev_execute_sql
- [x] Implémentation des procédures tRPC backend (catalogue, panier, checkout, paiements, commandes, retours, admin)
- [x] Développement de la page d'accueil publique avec catalogue de fruits de dessert et fiches produits
- [x] Implémentation du panier d'achat et du tunnel de commande (checkout) avec sélection de livraison par arrondissement/quartier à Bangui
- [x] Intégration des modes de paiement (Orange Money, Carte Visa/Mastercard, Paiement à la livraison)
- [x] Ajout de l'authentification MFA (SMS / App d'authentification) pour administrateurs et clients
- [x] Création de l'espace client avec suivi de commande en temps réel (Validée, En préparation, En cours de livraison, Livrée)
- [x] Implémentation du workflow de retours et réclamations (soumission de photos sous 24h, avoir, remboursement, remplacement)
- [x] Développement du back-office administrateur complet (gestion commandes, produits, stocks, zones de livraison)
- [x] Écriture et exécution des tests unitaires Vitest pour valider les fonctionnalités clés
- [x] Ajouter le programme de fidélité par points cumulés échangeables au panier
- [x] Ajouter un tableau de bord analytique graphique avancé pour l'administrateur
- [x] Ajouter la simulation de passerelle SMS pour les notifications et codes OTP

- [x] Enregistrer côté serveur les avis post-livraison avec la note, le commentaire, la commande et le livreur
- [x] Afficher les avis post-livraison dans le tableau de bord administrateur
- [x] Enregistrer les demandes du centre de messagerie intelligent nécessitant l'avis d'un expert
- [x] Afficher et suivre les demandes d'expertise du centre de messagerie dans l'administration
- [x] Ajouter les tests Vitest des mutations et requêtes d'avis et de demandes d'expertise
- [x] Vérifier le build et sauvegarder la correction

Bien vu — signalement utilisateur : les avis post-livraison et les demandes d'attente d'un expert n'apparaissent pas dans l'administration.
- [x] Persister le lien livreur par commande afin de conserver l’association pour les avis post-livraison
- [x] Ajouter une catégorie serveur explicite pour distinguer les demandes nécessitant un expert
- [x] Afficher un filtre et un indicateur dédiés aux demandes expertes dans l’administration
- [x] Compléter les tests de succès et de mise à jour des statuts
- [x] Sauvegarder un nouveau checkpoint après ces corrections
