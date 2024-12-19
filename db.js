import sqlite3 from 'sqlite3';
import path from 'path';

// Spécifiez le chemin correct pour la base de données
const dbPath = path.resolve('db.sqlite');  // Utilisez le bon chemin du fichier de base de données
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
    } else {
        console.log('Connexion à la base de données SQLite réussie');
    }
});

// Exporter la connexion pour l'utiliser dans d'autres fichiers
export default db;
