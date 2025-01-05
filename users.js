import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';
import xss from 'xss';
import validator from 'validator';

// Connexion à la base de données SQLite
const dbPath = path.resolve('db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        // Erreur lors de la connexion à la base de données
        console.error('Erreur de connexion à la base de données:', err.message);
    }
});

// Fonction pour ajouter un utilisateur avec un mot de passe haché
const addUser = (name, email, password, role) => {
    // Vérification de la validité de l'email
    if (!validator.isEmail(email)) {
        throw new Error('E-mail invalide');
    }

    // Nettoyage des données pour éviter les attaques XSS
    const sanitizedName = xss(name);
    const sanitizedEmail = xss(email);
    const sanitizedRole = xss(role);

    // Nombre de rounds pour le hachage du mot de passe
    const saltRounds = 10;

    return new Promise((resolve, reject) => {
        // Hachage du mot de passe
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) {
                // Si une erreur se produit lors du hachage
                reject(`Erreur lors du hachage du mot de passe: ${err.message}`);
                return;
            }

            // Requête SQL pour insérer un nouvel utilisateur
            const query = `INSERT INTO usersData (name, email, password, role) VALUES (?, ?, ?, ?)`;

            // Exécution de la requête SQL avec les données nettoyées et le mot de passe haché
            db.run(query, [sanitizedName, sanitizedEmail, hashedPassword, sanitizedRole], function(err) {
                if (err) {
                    // Si une erreur se produit lors de l'insertion dans la base de données
                    reject(`Erreur lors de l'insertion dans la base de données: ${err.message}`);
                } else {
                    // Résolution de la promesse après l'ajout de l'utilisateur
                    resolve();
                }
            });
        });
    });
};

// Export de la fonction addUser pour utilisation dans d'autres modules
export { addUser };
