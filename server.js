import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';  // Importer bcrypt
import db from './db.js';      // Connexion à la base de données

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3004;

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

bcrypt.hash('admin123', 10, (err, hash) => {
    console.log('Mot de passe haché:', hash);
})

// Route pour la connexion (avec comparaison du mot de passe haché)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Vérifier si l'email existe dans la base de données
    const query = `SELECT * FROM usersData WHERE email = ?`;
    db.get(query, [email], (err, row) => {
        if (err) {
            console.error('Erreur de la base de données:', err.message);
            return res.status(500).json({ message: 'Erreur interne du serveur' });
        }

        if (row) {
            // Log pour vérifier le mot de passe haché dans la base
            console.log("Mot de passe haché dans la base de données:", row.password);

            // Log pour vérifier le mot de passe envoyé
            console.log("Mot de passe envoyé:", password);

            // Vérifier le préfixe et l'adapter si nécessaire
            let hashedPassword = row.password;

            // Comparer le mot de passe soumis avec celui stocké dans la base (haché)
            bcrypt.compare(password, hashedPassword, (err, isMatch) => {
                if (err) {
                    console.error('Erreur de comparaison des mots de passe:', err.message);
                    return res.status(500).json({ message: 'Erreur interne du serveur' });
                }

                // Log pour vérifier si les mots de passe correspondent
                console.log("Les mots de passe correspondent :", isMatch);

                if (isMatch) {
                    // Le mot de passe correspond, la connexion est réussie
                    return res.status(200).json({
                        message: 'Connexion réussie',
                        user: { id: row.id, name: row.name, role: row.role }
                    });
                } else {
                    // Le mot de passe ne correspond pas
                    return res.status(401).json({ message: 'Mot de passe incorrect' });
                }
            });
        } else {
            // Utilisateur non trouvé
            return res.status(401).json({ message: 'Adresse mail incorrect' });
        }
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
