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

// Requête pour créer les tables
const createTables = () => {
    const queryUsersData = `CREATE TABLE IF NOT EXISTS usersData (
                                                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                     name TEXT NOT NULL,
                                                                     email TEXT NOT NULL UNIQUE,
                                                                     password TEXT NOT NULL,
                                                                     role TEXT NOT NULL
                            )`;

    const queryPackages = `CREATE TABLE IF NOT EXISTS packages (
                                                                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                   trackingNumber TEXT NOT NULL,
                                                                   shipDate TEXT,
                                                                   clientName TEXT NOT NULL,
                                                                   clientAddress TEXT NOT NULL,
                                                                   status TEXT NOT NULL,
                                                                   deliveryPerson TEXT NOT NULL,
                                                                   clientEmail TEXT,
                                                                   weight REAL,
                                                                   phoneNumber TEXT,
                                                                   note TEXT
                           )`;

    const queryPackageHistory = `CREATE TABLE IF NOT EXISTS package_history (
                                                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                                packageId INTEGER NOT NULL,
                                                                                status TEXT NOT NULL,
                                                                                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                                                FOREIGN KEY (packageId) REFERENCES packages(id)
        )`;

    db.serialize(() => {
        db.run(queryUsersData);
        db.run(queryPackages);
        db.run(queryPackageHistory);
        console.log("Tables créées avec succès.");
    });
};

// Fonction pour ajouter un utilisateur avec sécurité
const addUser = async (name, email, password, role) => {
    // Vérification de la validité de l'email
    if (!validator.isEmail(email)) {
        throw new Error(`E-mail invalide: ${email}`);
    }

    // Nettoyage des données pour éviter les attaques XSS
    const sanitizedName = xss(name);
    const sanitizedEmail = xss(email);
    const sanitizedRole = xss(role);

    // Hachage du mot de passe avec bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    return new Promise((resolve, reject) => {
        const query = `INSERT INTO usersData (name, email, password, role) VALUES (?, ?, ?, ?)`;
        db.run(query, [sanitizedName, sanitizedEmail, hashedPassword, sanitizedRole], function (err) {
            if (err) {
                reject(`Erreur lors de l'insertion dans la base de données: ${err.message}`);
            } else {
                resolve(`Utilisateur ajouté avec succès: ${sanitizedEmail}`);
            }
        });
    });
};

// Insérer chaque utilisateur séquentiellement
const users = [
    { name: "Jean Martin", email: "admin@fastdeliver.com", password: "admin123", role: "Administrateur" },
    { name: "Emma Roux", email: "emma@fastdeliver.com", password: "driver123", role: "Livreur" },
    { name: "Marc Bernard", email: "marc@fastdeliver.com", password: "driver123", role: "Livreur" },
    { name: "Lucas Dubois", email: "lucas@fastdeliver.com", password: "driver123", role: "Livreur" },
];

// Créez les tables et insérez les utilisateurs
(async () => {
    createTables();

    for (const user of users) {
        try {
            const result = await addUser(user.name, user.email, user.password, user.role);
            console.log(result);
        } catch (error) {
            console.error(`Erreur pour l'utilisateur ${user.email}:`, error);
        }
    }
})();
