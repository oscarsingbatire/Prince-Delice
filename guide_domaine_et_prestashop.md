# Guide de Liaison de Domaine (HTTPS) et d'Intégration PrestaShop

Ce document détaille les procédures pour associer un nom de domaine personnalisé avec un certificat SSL/TLS (HTTPS) à votre infrastructure, ainsi que la méthode pour intégrer les logiques et interfaces développées au sein d'un site **PrestaShop**.

---

## 1. Comment pointer un Nom de Domaine (ex: `https://fruits-centrafricains.com`) avec HTTPS ?

Pour qu'un nom de domaine pointe vers votre serveur d'hébergement (VPS ou conteneur) avec le protocole HTTPS activé, vous devez suivre les étapes fondamentales suivantes :

### Étape 1 : Configuration des DNS chez votre registrar
Connectez-vous auprès du bureau d'enregistrement de votre nom de domaine (Gandi, OVH, Namecheap, etc.) et créez les enregistrements DNS pointant vers l'adresse IP publique de votre serveur :
* **Enregistrement A** : Nom `@` (ou `fruits-centrafricains.com`) pointant vers l'IPv4 de votre serveur.
* **Enregistrement CNAME** (optionnel) : Nom `www` pointant vers `fruits-centrafricains.com`.

### Étape 2 : Configuration du Reverse Proxy Nginx et Certificat SSL (Let's Encrypt)
Sur votre serveur d'hébergement, installez **Certbot** pour générer et renouveler automatiquement un certificat SSL gratuit :
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d fruits-centrafricains.com -d www.fruits-centrafricains.com
```
Le certificat sera automatiquement configuré dans votre fichier de bloc serveur Nginx, activant instantanément le protocole **HTTPS** avec redirection forcée du trafic HTTP.

---

## 2. Comment récupérer le code complet et l'intégrer sur PrestaShop ?

Puisque PrestaShop repose sur un écosystème PHP / MySQL avec son propre moteur de thèmes (Smarty) et ses modules, l'intégration de fonctionnalités sur-mesure (comme le tunnel de commande adapté à Bangui, la gestion des retours sous 24h ou le MFA) s'effectue soit par le développement de **modules PrestaShop natifs**, soit par l'utilisation de la **boutique en tant que Headless Frontend** (connecté via les webservices PrestaShop).

### Option A : Intégration via des Modules PrestaShop Dédiés (Recommandé)
Pour retrouver les fonctionnalités de la plateforme dans le back-office PrestaShop :
1. **Module de Paiement Orange Money** : Installez un module tiers certifié (ex: passerelle CinetPay ou module officiel Orange Web Payment) et configurez vos clés API dans le back-office PrestaShop (`Modules > Gestion des modules`).
2. **Module de Livraison par Quartier (Bangui)** : Utilisez le module *Advanced Carrier* ou développez un module de transporteur basé sur les codes postaux ou les arrondissements (1er au 8e arrondissement de Bangui) pour appliquer dynamiquement les tarifs de livraison.
3. **Module MFA (Authentification Multi-Facteurs)** : Installez un module de sécurité 2FA compatible PrestaShop 8.x (ex: Google Authenticator / Two-Factor Authentication for Admin & Customers) pour activer l'authentification renforcée.
4. **Gestion des Retours** : Activez le module natif *Merchandise Returns* de PrestaShop et personnalisez les conditions générales de vente pour y inclure le délai de 24 heures et les modes de compensation (*avoir, remboursement, remplacement*).

### Option B : Récupération du Code Source pour un Déploiement Headless ou Personnalisé
Si vous souhaitez récupérer l'intégralité du code source React / Node.js / tRPC développé dans le cadre de ce projet :
1. **Téléchargement du projet** : Depuis le panneau de gestion de votre projet, cliquez sur l'option de téléchargement du code source (ZIP) ou exportez le dépôt Git lié au checkpoint.
2. **Structure des fichiers** :
   * `/client/src/pages/` : Contient les pages de la vitrine, du panier, du tunnel de commande, de l'espace client et du back-office admin.
   * `/server/routers.ts` : Contient toute la logique métier, les schémas tRPC, la gestion des stocks et les statuts de commande (*Validée, En préparation, En cours de livraison, Livrée*).
   * `/drizzle/schema.ts` : Contient le schéma relationnel complet (produits, stocks, zones de livraison, commandes, retours, utilisateurs MFA).
3. **Hébergement et Connexion API** : Vous pouvez déployer ce front-end en tant qu'application web autonome connectée aux webservices de votre boutique PrestaShop existante via les clés d'API REST PrestaShop.
