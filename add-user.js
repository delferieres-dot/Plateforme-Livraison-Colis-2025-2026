import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import path from 'path';

// Connexion à la base de données SQLite
const dbPath = path.resolve('db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
    } else {
        console.log('Connexion à la base de données SQLite réussie');
    }
});

const createTable = () => {
    // Requête SQL pour créer la table des utilisateurs
    const query = `CREATE TABLE IF NOT EXISTS usersData (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL)`;

    // Exécution de la requête pour créer la table
    db.run(query, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table:', err.message);
        } else {
            console.log('Table créée avec succès');
        }
    });
}

// Fonction pour ajouter un utilisateur avec un mot de passe haché
const addUser = (name, email, password, role) => {
    const saltRounds = 10;
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) {
                reject(`Erreur lors du hachage du mot de passe: ${err.message}`);
                return;
            }

            // Requête SQL pour insérer un utilisateur avec le mot de passe haché
            const query = `INSERT INTO usersData (name, email, password, role) VALUES (?, ?, ?, ?)`;
            db.run(query, [name, email, hashedPassword, role], function(err) {
                if (err) {
                    reject(`Erreur lors de l'insertion dans la base de données: ${err.message}`);
                } else {
                    console.log(`Utilisateur ajouté avec l'ID ${this.lastID}`);
                    resolve();
                }
            });
        });
    });
};

// Exemple d'ajout d'un utilisateur
const addUsers = async () => {
    try {
        await addUser('Jean Martin', 'admin@fastdeliver.com', 'admin123', 'Administrateur');
        await addUser('Emma Roux', 'emma@fastdeliver.com', 'driver123', 'Livreur');
        await addUser('Marc Bernard', 'marc@fastdeliver.com', 'driver123', 'Livreur');
        await addUser('Lucas Dubois', 'lucas@fastdeliver.com', 'driver123', 'Livreur');
    } catch (err) {
        console.error(err);
    } finally {
        db.close();  // Ferme la base de données après toutes les opérations
    }
};

await createTable()
await addUsers();
