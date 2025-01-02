import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';
import xss from 'xss';
import validator from 'validator';

// Connexion à la base de données SQLite
const dbPath = path.resolve('db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
    } else {
        console.log('Connexion à la base de données SQLite réussie');
    }
});

// Fonction pour ajouter un utilisateur avec un mot de passe haché
const addUser = (name, email, password, role) => {
    if (!validator.isEmail(email)) {
        throw new Error('E-mail invalide');
    }

    const sanitizedName = xss(name);
    const sanitizedEmail = xss(email);
    const sanitizedRole = xss(role);
    const saltRounds = 10;

    return new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) {
                reject(`Erreur lors du hachage du mot de passe: ${err.message}`);
                return;
            }

            const query = `INSERT INTO usersData (name, email, password, role) VALUES (?, ?, ?, ?)`;
            db.run(query, [sanitizedName, sanitizedEmail, hashedPassword, sanitizedRole], function(err) {
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

// Fonction pour ajouter des données d'exemple
const addSampleData = async () => {
    try {
        await addUser('Jean Martin', 'admin@fastdeliver.com', 'admin123', 'Administrateur');
        await addUser('Emma Roux', 'emma@fastdeliver.com', 'driver123', 'Livreur');
        await addUser('Marc Bernard', 'marc@fastdeliver.com', 'driver123', 'Livreur');
        await addUser('Lucas Dubois', 'lucas@fastdeliver.com', 'driver123', 'Livreur');
    } catch (err) {
        console.error(err);
    } finally {
        db.close();
    }
};

// Ajouter des données d'exemple
addSampleData();
