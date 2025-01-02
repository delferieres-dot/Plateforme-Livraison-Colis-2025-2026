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

createTables();
db.close();
