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

// Fonction pour ajouter un colis
const addPackage = (trackingNumber, shipDate, clientName, clientAddress, status, deliveryPerson, clientEmail, weight, phoneNumber, note) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO packages (trackingNumber, shipDate, clientName, clientAddress, status, deliveryPerson, clientEmail, weight, phoneNumber, note)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(query, [trackingNumber, shipDate, clientName, clientAddress, status, deliveryPerson, clientEmail, weight, phoneNumber, note], function (err) {
            if (err) {
                reject(`Erreur lors de l'insertion du colis: ${err.message}`);
            } else {
                resolve(`Colis ajouté avec succès: ${trackingNumber}`);
            }
        });
    });
};

// Insérer des utilisateurs et des colis séquentiellement
const users = [
    { name: "Jean Martin", email: "admin@fastdeliver.com", password: "admin123", role: "Administrateur" },
    { name: "Emma Roux", email: "emma@fastdeliver.com", password: "driver123", role: "Livreur" },
    { name: "Marc Bernard", email: "marc@fastdeliver.com", password: "driver123", role: "Livreur" },
    { name: "Lucas Dubois", email: "lucas@fastdeliver.com", password: "driver123", role: "Livreur" },
];

const packages = [
    { trackingNumber: "FD28465937BE", shipDate: "2025-01-01", clientName: "Alice Dupont", clientAddress: "1 Rue de Paris", status: "Livré", deliveryPerson: "Emma Roux", clientEmail: "alice@domain.com", weight: 5.2, phoneNumber: "0123456789", note: "Fragile" },
    { trackingNumber: "FD28465938BE", shipDate: "2025-01-02", clientName: "Bob Martin", clientAddress: "5 Avenue des Champs", status: "Problème", deliveryPerson: "Marc Bernard", clientEmail: "bob@domain.com", weight: 10.1, phoneNumber: "0987654321", note: "Livrer en main propre" },
    { trackingNumber: "FD28465939BE", shipDate: "2025-01-03", clientName: "Claire Lefevre", clientAddress: "12 Boulevard Saint-Michel", status: "En livraison", deliveryPerson: "Lucas Dubois", clientEmail: "claire@domain.com", weight: 2.8, phoneNumber: "0147259638", note: "N/A" },
    { trackingNumber: "FD28465940BE", shipDate: "2025-01-04", clientName: "David Lemoine", clientAddress: "7 Rue de Lyon", status: "En préparation", deliveryPerson: "Emma Roux", clientEmail: "david@domain.com", weight: 3.5, phoneNumber: "0654321789", note: "Urgent" }
];

// Créez les tables, insérez les utilisateurs et les colis
(async () => {
    createTables();

    // Ajout des utilisateurs
    for (const user of users) {
        try {
            const result = await addUser(user.name, user.email, user.password, user.role);
            console.log(result);
        } catch (error) {
            console.error(`Erreur pour l'utilisateur ${user.email}:`, error);
        }
    }

    // Ajout des colis
    for (const pkg of packages) {
        try {
            const result = await addPackage(pkg.trackingNumber, pkg.shipDate, pkg.clientName, pkg.clientAddress, pkg.status, pkg.deliveryPerson, pkg.clientEmail, pkg.weight, pkg.phoneNumber, pkg.note);
            console.log(result);
        } catch (error) {
            console.error(`Erreur pour le colis ${pkg.trackingNumber}:`, error);
        }
    }
})();
