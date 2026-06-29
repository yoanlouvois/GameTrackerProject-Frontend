# GameTracker Frontend

## Présentation

GameTracker est une plateforme web full-stack dédiée aux jeux HTML5 en ligne. Ce dépôt contient le **frontend** de l'application, développé avec **Angular**.

L'application permet aux utilisateurs de découvrir de nouveaux jeux, gérer leur profil, consulter leurs trophées, suivre leur activité, interagir avec leurs amis et recevoir des recommandations personnalisées.

Le frontend est **conteneurisé avec Docker** et servi par **Nginx**. Il communique avec le backend via une **API REST**.


<p align="center">
  <img src="https://github.com/user-attachments/assets/a9642a87-d1a6-4757-ae98-701fba457dfe" alt="Liste des jeux" width="49%"/>
  <img src="https://github.com/user-attachments/assets/bd615b60-e1e0-46e9-9a3c-ced1c7e2c0de" alt="Accueil" width="49%"/>
</p>



### Dépôts associés

**Backend**

https://github.com/yoanlouvois/GameTrackerProject-Backend

**Infrastructure**

https://github.com/yoanlouvois/GameTrackerProject-Infra

---

## Fonctionnalités

L'application permet notamment de :

### Authentification

* Création de compte
* Connexion utilisateur

### Gestion du profil

* Consultation et modification du profil
* Visualisation des statistiques
* Gestion des trophées

### Catalogue de jeux

* Consultation des jeux disponibles
* Recherche et navigation
* Lancement des jeux HTML5

### Gestion des amis

* Ajout et suppression d'amis
* Consultation des profils

### Recommandations

* Consultation des recommandations reçues
* Recommandation de jeux à d'autres utilisateurs

---

## Technologies utilisées

### Frontend

* Angular
* TypeScript
* HTML
* CSS

### Déploiement

* Docker
* Nginx

### Communication

* API REST
* OpenAPI Generator

### Outils

* Angular CLI

---

# Configuration de l'environnement GameTracker

## Étape 1 : Cloner le projet

```bash
git clone https://github.com/yoanlouvois/Front-End-GameTracker.git
cd Front-End-GameTracker
```

## Étape 2 : Construire l'image Docker

```bash
docker build -t gametracker-front .
```

## Étape 3 : Lancer le conteneur

```bash
docker run -d -p 80:80 --name gametracker-front gametracker-front
```

L'application sera accessible à l'adresse :

```text
http://localhost
```

Le frontend communique avec le backend via les API REST exposées par celui-ci. Assurez-vous que le backend soit démarré et que l'URL de l'API soit correctement configurée avant de lancer l'application.

---

## Développement

Pour lancer le frontend sans Docker (mode développement) :

```bash
npm install
ng serve
```

L'application sera alors accessible sur :

```text
http://localhost:4200
```

---

## Build de production

Pour générer les fichiers statiques Angular :

```bash
ng build --configuration production
```

Les fichiers générés sont ensuite servis par **Nginx** à l'intérieur du conteneur Docker.
