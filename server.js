import express from 'express'; // Pour créer un serveur web et gérer les routes HTTP
import path from 'path'; // Pour gérer les chemins de fichiers et répertoires dans le système de fichiers
import { fileURLToPath } from 'url'; // Pour convertir les URL de fichiers en chemins de fichiers locaux
import bcrypt from 'bcrypt'; // Pour sécuriser les mots de passe des utilisateurs avec des techniques de hachage
import db from './db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'votre_secret_pour_jwt'; // Utilisez une variable d'environnement pour plus de sécurité
const JWT_EXPIRATION = '1h'; // Durée de vie du token

// Donne le chemin absolu et extrait le dossier
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3004;

// Middleware pour analyser les données JSON et les données de formulaire
app.use(express.json()); // Permet de lire les données envoyées en JSON
app.use(express.urlencoded({ extended: true })); // Permet de lire les données envoyées via un formulaire

// Permet de servir tous les fichiers du dossier public lorsqu'un utilisateur en fait la demande
app.use(express.static(path.join(__dirname, 'public')));

// Route pour récupérer tous les colis depuis la base de données
app.get('/api/packages', (req, res) => {
    const query = 'SELECT * FROM packages';
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
        res.status(200).json(rows);
    });
});

// Route pour récupérer un colis spécifique par son ID
app.get('/api/packages/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM packages WHERE id = ?';
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        if (!row) {
            return res.status(404).json({ message: 'Colis non trouvé.' });
        }

        res.status(200).json(row);
    });
});

// Route pour ajouter un nouveau colis
app.post('/api/packages', (req, res) => {
    const { trackingNumber, shipDate, clientName, clientEmail, clientAddress, deliveryPerson, weight, phoneNumber, note, status } = req.body;
    const query = `INSERT INTO packages (trackingNumber, shipDate, status, clientName, clientEmail, clientAddress, deliveryPerson, weight, phoneNumber, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [trackingNumber, shipDate, status, clientName, clientEmail, clientAddress, deliveryPerson, weight, phoneNumber, note], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        const packageId = this.lastID;

        // Ajouter les étapes de suivi initiales
        const historyQuery = `INSERT INTO package_history (packageId, status, date) VALUES (?, ?, ?)`;
        const initialSteps = [
            { status: 'En préparation', date: new Date().toISOString() },
            { status: status, date: new Date().toISOString() }
        ];

        initialSteps.forEach(step => {
            db.run(historyQuery, [packageId, step.status, step.date], function (err) {
                if (err) {
                    return;
                }
            });
        });

        res.status(201).json({ message: 'Colis ajouté avec succès', id: packageId });
    });
});

// Route pour modifier un colis
app.put('/api/packages/:id', (req, res) => {
    const { id } = req.params;
    const { trackingNumber, shipDate, status, clientName, clientEmail, clientAddress, deliveryPerson, weight, phoneNumber, note } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'ID invalide.' });
    }

    const query = `UPDATE packages SET
                                           trackingNumber = ?,
                                           shipDate = ?,
                                           status = ?,
                                           clientName = ?,
                                           clientEmail = ?,
                                           clientAddress = ?,
                                           deliveryPerson = ?,
                                           weight = ?,
                                           phoneNumber = ?,
                                           note = ?
                       WHERE id = ?`;

    db.run(query, [trackingNumber, shipDate, status, clientName, clientEmail, clientAddress, deliveryPerson, weight, phoneNumber, note, id], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Colis non trouvé.' });
        }

        res.status(200).json({ message: 'Colis modifié avec succès.' });
    });
});

// Route pour supprimer un colis
app.delete('/api/packages/:id', (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'ID invalide.' });
    }

    const query = `DELETE FROM packages WHERE id = ?`;

    db.run(query, [id], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Colis non trouvé.' });
        }

        res.status(200).json({ message: 'Colis supprimé avec succès.' });
    });
});

// Middleware d'authentification JWT
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Accès interdit' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ message: 'Authentification requise' });
    }
};

// Route de connexion
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT * FROM usersData WHERE email = ?`;

    db.get(query, [email], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur interne du serveur' });
        }

        if (row) {
            const hashedPassword = row.password;

            bcrypt.compare(password, hashedPassword, (err, isMatch) => {
                if (err) {
                    return res.status(500).json({ message: 'Erreur interne du serveur' });
                }

                if (isMatch) {
                    const token = jwt.sign({ id: row.id, name: row.name, role: row.role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

                    // Envoi du token dans un cookie sécurisé
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: true,
                        maxAge: 3600000,
                        sameSite: 'Strict'
                    });

                    return res.status(200).json({
                        message: 'Connexion réussie',
                        user: { id: row.id, name: row.name, role: row.role }
                    });
                } else {
                    return res.status(401).json({ message: 'Mot de passe incorrect' });
                }
            });
        } else {
            return res.status(401).json({ message: 'Adresse mail incorrect' });
        }
    });
});

// Route pour récupérer les colis d'un livreur spécifique
app.get('/api/packages/for-delivery-person/:deliveryPerson', (req, res) => {
    const { deliveryPerson } = req.params;
    const query = 'SELECT * FROM packages WHERE deliveryPerson = ?';

    db.all(query, [deliveryPerson], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
        res.status(200).json(rows);
    });
});

// Route pour marquer un colis comme ayant un problème
app.put('/api/packages/:id/problem', (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'ID invalide.' });
    }

    const query = `UPDATE packages SET status = ? WHERE id = ?`;
    const status = 'Problème';

    db.run(query, [status, id], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Colis non trouvé.' });
        }

        res.status(200).json({ message: 'Statut du colis mis à jour avec succès.' });
    });
});

// Route pour marquer un colis comme "livré"
app.put('/api/packages/:id/livre', (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'ID invalide.' });
    }

    const query = `UPDATE packages SET status = ? WHERE id = ?`;
    const status = 'Livré';

    db.run(query, [status, id], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Colis non trouvé.' });
        }

        res.status(200).json({ message: 'Statut du colis mis à jour avec succès.' });
    });
});

// Route pour vérifier si un numéro de suivi existe
app.get('/api/packages/track/:trackingNumber', (req, res) => {
    const { trackingNumber } = req.params;
    const query = 'SELECT * FROM packages WHERE trackingNumber = ?';

    db.get(query, [trackingNumber], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        if (!row) {
            return res.status(404).json({ message: 'Numéro de suivi invalide' });
        }

        res.status(200).json(row); // Retourner les données du colis
    });
});

// Route pour récupérer l'historique complet d'un colis
app.get('/api/packages/:id/history', (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT status, date
        FROM package_history
        WHERE packageId = ?
        ORDER BY date ASC
    `;

    db.all(query, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        res.status(200).json(rows);
    });
});

// Route pour ajouter une étape dans l'historique d'un colis
app.post('/api/packages/:id/history', (req, res) => {
    const { id } = req.params;
    const { status, date } = req.body;

    if (!status || !date) {
        return res.status(400).json({ error: 'Le statut et la date sont requis.' });
    }

    const query = `INSERT INTO package_history (packageId, status, date) VALUES (?, ?, ?)`;

    db.run(query, [id, status, date], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        res.status(201).json({ message: 'Historique mis à jour avec succès.' });
    });
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
