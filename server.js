import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3004;

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Route pour récupérer tous les colis
app.get('/api/packages', (req, res) => {
    const query = 'SELECT * FROM packages';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des colis:', err.message);
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
        res.status(200).json(rows);
    });
});

// Route pour récupérer un colis par ID
app.get('/api/packages/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM packages WHERE id = ?';
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Erreur lors de la récupération du colis:', err.message);
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        if (!row) {
            return res.status(404).json({ message: 'Colis non trouvé.' });
        }

        res.status(200).json(row);
    });
});

// Ajouter un colis
app.post('/api/packages', (req, res) => {
    const { trackingNumber, shipDate, clientName, clientEmail, clientAddress, deliveryPerson, weight, phoneNumber, note } = req.body;
    const status = 'En livraison'; // Set initial status to "En livraison"
    const query = `INSERT INTO packages (trackingNumber, shipDate, status, clientName, clientEmail, clientAddress, deliveryPerson, weight, phoneNumber, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [trackingNumber, shipDate, status, clientName, clientEmail, clientAddress, deliveryPerson, weight, phoneNumber, note], function (err) {
        if (err) {
            console.error('Erreur lors de l\'insertion des données:', err.message);
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        const packageId = this.lastID;

        // Ajouter les étapes de suivi initiales
        const historyQuery = `INSERT INTO package_history (packageId, status, date) VALUES (?, ?, ?)`;
        const initialSteps = [
            { status: 'En préparation', date: new Date().toISOString() },
            { status: 'En livraison', date: new Date().toISOString() }
        ];

        initialSteps.forEach(step => {
            db.run(historyQuery, [packageId, step.status, step.date], function (err) {
                if (err) {
                    console.error('Erreur lors de l\'insertion de l\'historique:', err.message);
                }
            });
        });

        res.status(201).json({ message: 'Colis ajouté avec succès', id: packageId });
    });
});

// Modifier un colis
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
            console.error('Erreur lors de la modification du colis:', err.message);
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Colis non trouvé.' });
        }

        res.status(200).json({ message: 'Colis modifié avec succès.' });
    });
});


// Supprimer un colis
app.delete('/api/packages/:id', (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'ID invalide.' });
    }

    const query = `DELETE FROM packages WHERE id = ?`;

    db.run(query, [id], function (err) {
        if (err) {
            console.error('Erreur lors de la suppression du colis:', err.message);
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Colis non trouvé.' });
        }

        res.status(200).json({ message: 'Colis supprimé avec succès.' });
    });
});

// Connexion utilisateur
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT * FROM usersData WHERE email = ?`;

    db.get(query, [email], (err, row) => {
        if (err) {
            console.error('Erreur de la base de données:', err.message);
            return res.status(500).json({ message: 'Erreur interne du serveur' });
        }

        if (row) {
            const hashedPassword = row.password;

            bcrypt.compare(password, hashedPassword, (err, isMatch) => {
                if (err) {
                    console.error('Erreur de comparaison des mots de passe:', err.message);
                    return res.status(500).json({ message: 'Erreur interne du serveur' });
                }

                if (isMatch) {
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
            console.error('Erreur lors de la récupération des colis pour le livreur:', err.message);
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
        res.status(200).json(rows);
    });
});
// Route pour marquer un colis comme "problème"
app.put('/api/packages/:id/problem', (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'ID invalide.' });
    }

    const query = `UPDATE packages SET status = ? WHERE id = ?`;
    const status = 'Problème';

    db.run(query, [status, id], function  (err) {
        if (err) {
            console.error('Erreur lors de la mise à jour du statut du colis:', err.message);
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Colis non trouvé.' });
        }

        res.status(200).json({ message: 'Statut du colis mis à jour avec succès.' });
    });
});


app.put('/api/packages/:id/livre', (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'ID invalide.' });
    }

    const query = `UPDATE packages SET status = ? WHERE id = ?`;
    const status = 'Livré';

    db.run(query, [status, id], function  (err) {
        if (err) {
            console.error('Erreur lors de la mise à jour du statut du colis:', err.message);
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
            console.error('Erreur lors de la récupération du colis:', err.message);
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
            console.error('Erreur lors de la récupération de l\'historique:', err.message);
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        res.status(200).json(rows);
    });
});

app.post('/api/packages/:id/history', (req, res) => {
    const { id } = req.params;
    const { status, date } = req.body;

    if (!status || !date) {
        return res.status(400).json({ error: 'Status and date are required.' });
    }

    const query = `INSERT INTO package_history (packageId, status, date) VALUES (?, ?, ?)`;

    db.run(query, [id, status, date], function (err) {
        if (err) {
            console.error('Erreur lors de la mise à jour de l\'historique:', err.message);
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        res.status(200).json({ message: 'Historique mis à jour avec succès.' });
    });
});


// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
