# Projet Web Q1 B2 

### Membre du groupe : Sacha Delferiere 

---

## 1. Fonctionnalités, complétion et respect du design

1. Une page d'accueil pour les clients (`index.html`).
2. Une page d'authentification pour les administrateurs et les livreurs (`login.html`).
3. Un tableau de bord d'administration (`admin.html`) et une page de création/édition de livraison (`edit-delivery.html`).
4. Un espace de suivi de livraison pour les livreurs (`driver-next-delivery.html`).
5. Une page de suivi de livraison pour les clients (`tracking.html`).

- **CSS & Responsive Design :** L'interface est responsive et s'adapte à différents écrans. Des frameworks CSS comme Bootstrap ou TailwindCSS peuvent être utilisés pour faciliter le développement.
- **Scripts :** Des scripts JavaScript gèrent les fonctionnalités de filtrage, la manipulation de données et les actions utilisateur (comme la connexion et la gestion des livraisons). Le client web est donc un client lourd qui communique avec l'API pour récupérer et mettre à jour les données.

| Page HTML                  | JavaScript | CSS  | Responsive|
|----------------------------|--------------|--------|---------------|
| `index.html`               | ✅           | ✅     | ✅            |
| `login.html`               | ✅           | ✅     | ✅            |
| `admin.html`               | ✅           | ✅     | ✅            |
| `driver-next-delivery.html`| ✅           | ✅     | ✅            |
| `tracking.html`            | ✅           | ✅     | ✅            |
| `edit-delivery.html`       | ✅           | ✅     | ✅            |

🚨 **Toutes les pages sont complètes. Cependant, le responsive de certaines pages n'est pas toujours respecté à la lettre. Le design des pages statiques est néanmoins conforme.**

---

## 2. Librairies utilisées pour le projet

Voici les librairies utilisées dans le projet :

- **express** : Framework web minimaliste pour Node.js.
- **bcrypt** : Librairie pour le hashage des mots de passe.
- **jsonwebtoken** : Librairie pour générer et vérifier des JSON Web Tokens.
- **nodemon** : Utilitaire pour redémarrer automatiquement l'application lors des changements de fichiers.
- **sqlite3** : Driver SQLite3 pour Node.js.
- **express-validator** : Middleware pour la validation et la gestion des erreurs des requêtes HTTP.
- **body-parser** : Middleware pour parser les corps des requêtes HTTP.
- **validator** : Librairie pour les validations de chaînes de caractères.
- **express-session** : Middleware pour gérer les sessions dans Express.
- **xss** : Protection contre les attaques XSS.

---

## 3. Utilisation de l'API et gestion des données

L'API utilisée pour ce projet permet de gérer les livraisons, les clients et les livreurs via des requêtes HTTP.

### Fonctionnalités principales

| Fonctionnalité                            | Description                                                   | Complété |
|-------------------------------------------|---------------------------------------------------------------|----------|
| **Base de données SQLite**                | Stockage des données dans une base SQLite sans ORM.           | ✅       |
| **Données échangées en JSON**             | Les données entre le client et le serveur sont en JSON.       | ✅       |
| **API REST avec NodeJS & Express**        | API construite avec NodeJS et Express respectant REST.        | ✅       |
| **Authentification des utilisateurs**    | Authentification avec JWT pour les pages protégées.           | ✅       |
| **Gestion sécurisée des mots de passe**  | Utilisation de bcrypt pour le hashage des mots de passe.      | ✅       |
| **Requêtes HTTP**                         | Gestion des requêtes HTTP pour récupérer et envoyer des données. | ✅    |
| **Structure des données logique**        | Réponses API bien structurées et adaptées à chaque utilisateur. | ✅    |
| **Sécurisation de l'API**                 | Protection contre les attaques XSS et SQL injection.          | ✅       |
| **Scripts de démarrage (npm)**           | `npm init` pour initialiser la base de données et `npm start` pour démarrer l'application. | ✅ |

---

## 4. Documentation et API

L'API respecte les standards REST. Des commentaires ont été ajoutés dans les fichiers JavaScript et CSS. Cependant, il n'y avait pas d'utilité à en mettre dans les fichiers HTML.

---

## 5. Originalité et effort additionnel (bonus)

| Fonctionnalité                            | Description                                          | Complété |
|-------------------------------------------|------------------------------------------------------|----------|
| **Originalité et effort additionnel**    | Ajout de nouvelles fonctionnalités                  | ❌        |

🚨 **Je n'ai pas ajouté d'autres fonctionnalités pour ne pas alourdir le projet ou introduire des complexités inutiles, qui pourraient rendre les modifications du design trop encombrantes.**

---

## 5.Commandes

### Initialisation du projet

**Commandes init et start** : Ces sections expliquent comment utiliser les commandes définies dans votre fichier package.json (comme décrit précédemment). Vous pouvez copier et coller ces commandes dans un terminal.

Pour initialiser le projet (base de donnée), exécutez la commande suivante dans votre terminal :

```bash
npm run init
```


Pour demarré le projet, exécutez la commande suivante dans votre terminal :
```bash
npm run start
```

## 6. Vidéo explicative

Pour mieux comprendre le fonctionnement de ce projet, vous pouvez regarder cette vidéo explicative qui détaille le code, son architecture et son utilisation.

### Contenu de la vidéo :
- **Présentation générale** : Une vue d'ensemble du projet et de ses objectifs.
- **Design** : Démonstration du responsive et du code design.
- **Fonctionnalités principales** : Démonstration des principales fonctionnalités et leur implémentation.
- **Exemples d'utilisation** : Tutoriel pour montrer comment utilisé l'application.


📹 **Lien vers la vidéo :**  
[Regarder la vidéo explicative](https://youtu.be/0H6vFL9O5FY)

### https://youtu.be/0H6vFL9O5FY

## 7. Lien :
**Lien de la page** : [Fast-Deliver](http://localhost:3004/)

**Lien de la page d'index** : http://localhost:3004/index.html 