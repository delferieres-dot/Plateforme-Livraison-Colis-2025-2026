import sqlite3 from 'sqlite3';  // Importation du module sqlite3
import path from 'path';  // Importation du module path pour résoudre les chemins
import fs from 'fs';  // Importation du module fs pour manipuler le système de fichiers

// Spécification du chemin correct pour la base de données
const dbPath = path.resolve('db.sqlite');  // Résout le chemin relatif vers le fichier de base de données SQLite

// Vérifier si le fichier de la base de données existe déjà
if (fs.existsSync(dbPath)) {
    console.log('Connexion à la base de données SQLite existante');
} else {
    console.log('Création d\'une nouvelle base de données SQLite');
}

// Création d'une nouvelle connexion à la base de données SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    // Vérification des erreurs lors de la connexion
    if (err) {
        // Si une erreur survient lors de la connexion, elle est affichée
        console.error('Erreur de connexion à la base de données:', err.message);
    } else {
        // Si la connexion est réussie, un message de succès est affiché
        console.log('Connexion à la base de données SQLite réussie');
    }
});

// Exporter la connexion à la base de données pour l'utiliser dans d'autres fichiers
export default db;
