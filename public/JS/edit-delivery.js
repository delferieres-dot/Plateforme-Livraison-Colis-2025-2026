// Gestion du bouton de déconnexion
document.getElementById('logout').addEventListener('click', async () => {
    window.location.href = '/login.html'; // Redirige vers la page de connexion
});

// Gestion du bouton d'annulation
document.getElementById('btn-cancel').addEventListener('click', async () => {
    window.location.href = 'admin.html'; // Redirige vers la page d'administration
});

// Lorsque le DOM est complètement chargé
document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search); // Récupère les paramètres d'URL
    const packageId = urlParams.get("id"); // Récupère l'ID du colis passé en paramètre
    let originalStatus = ''; // Variable pour stocker le statut original du colis

    // Fonction pour générer un nouveau numéro de suivi
    const generateTrackingNumber = async () => {
        try {
            const response = await fetch('http://localhost:3004/api/packages'); // Récupère la liste des colis existants
            if (!response.ok) throw new Error('Erreur lors de la récupération des colis');

            const packages = await response.json();
            if (packages.length === 0) return 'FD28465940BE'; // Premier numéro par défaut si aucun colis n'existe

            // Extraire et trier les numéros de suivi pour générer le prochain
            const lastTrackingNumber = packages
                .map(pkg => parseInt(pkg.trackingNumber.match(/\d+/)?.[0], 10)) // Extrait les numéros
                .sort((a, b) => b - a)[0]; // Trie les numéros par ordre décroissant

            const nextTrackingNumber = (lastTrackingNumber + 1).toString().padStart(8, '0'); // Incrémente et formate
            return `FD${nextTrackingNumber}BE`; // Retourne le prochain numéro de suivi
        } catch (error) {
            // En cas d'erreur, retourne "Erreur"
            return 'Erreur';
        }
    };

    // Si un ID de colis est passé dans l'URL, charger les données du colis
    if (packageId) {
        try {
            const response = await fetch(`http://localhost:3004/api/packages/${packageId}`); // Récupère le colis par son ID
            const packageData = await response.json();

            if (response.ok) {
                // Remplir les champs du formulaire avec les données du colis
                document.getElementById("tracking-number").value = packageData.trackingNumber;
                document.getElementById("display-tracking-number").textContent = packageData.trackingNumber; // Affiche le numéro de suivi
                document.getElementById("ship-date").value = packageData.shipDate;
                document.getElementById("status").value = packageData.status;
                document.getElementById("name").value = packageData.clientName;
                document.getElementById("email").value = packageData.clientEmail;
                document.getElementById("address").value = packageData.clientAddress;
                document.getElementById("delivery-person").value = packageData.deliveryPerson;
                document.getElementById("weight").value = packageData.weight || ''; // Valeur optionnelle
                document.getElementById("phone").value = packageData.phoneNumber || ''; // Valeur optionnelle
                document.getElementById("notes").value = packageData.note || ''; // Valeur optionnelle
                originalStatus = packageData.status; // Sauvegarde le statut original
            } else {
                throw new Error("Colis non trouvé.");
            }
        } catch (error) {
            // En cas d'erreur lors de la récupération des données du colis
            alert("Erreur lors du chargement des données.");
        }
    } else {
        // Si aucun ID n'est fourni, générer un nouveau numéro de suivi
        const newTrackingNumber = await generateTrackingNumber();
        document.getElementById("tracking-number").value = newTrackingNumber;
        document.getElementById("display-tracking-number").textContent = newTrackingNumber; // Affiche le nouveau numéro de suivi
    }

    // Fonction de validation des champs
    const validateFields = () => {
        const trackingNumber = document.getElementById("tracking-number").value;
        const shipDate = document.getElementById("ship-date").value;
        const status = document.getElementById("status").value;
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const address = document.getElementById("address").value;
        const deliveryPerson = document.getElementById("delivery-person").value;
        const weight = document.getElementById("weight").value;
        const phone = document.getElementById("phone").value;

        if (!trackingNumber || !shipDate || !status || !name || !email || !address || !deliveryPerson || !weight || !phone) {
            alert("Tous les champs doivent être remplis. Sauf la note.");
            return false;
        }
        return true;
    };

    // Gestion du bouton de sauvegarde (ajout ou modification du colis)
    document.getElementById("btn-save").addEventListener("click", async () => {
        if (!validateFields()) {
            return; // Si la validation échoue, arrête l'exécution de la fonction
        }

        // Récupère les données du formulaire
        const updatedPackage = {
            trackingNumber: document.getElementById("tracking-number").value,
            shipDate: document.getElementById("ship-date").value,
            status: document.getElementById("status").value,
            clientName: document.getElementById("name").value,
            clientEmail: document.getElementById("email").value,
            clientAddress: document.getElementById("address").value,
            deliveryPerson: document.getElementById("delivery-person").value,
            weight: parseFloat(document.getElementById("weight").value),  // Poids
            phoneNumber: document.getElementById("phone").value,          // Téléphone
            note: document.getElementById("notes").value                  // Note
        };

        try {
            // Détermine la méthode HTTP selon la présence de l'ID (PUT pour modification, POST pour ajout)
            const method = packageId ? 'PUT' : 'POST';
            const url = packageId
                ? `http://localhost:3004/api/packages/${packageId}`
                : 'http://localhost:3004/api/packages'; // URL cible de l'API

            // Effectue la requête HTTP pour sauvegarder les données
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPackage),
            });

            if (!response.ok) throw new Error("Erreur lors de la sauvegarde du colis.");

            // Si le statut du colis a changé, ajoute une entrée dans l'historique
            if (packageId && updatedPackage.status !== originalStatus) {
                const historyResponse = await fetch(`http://localhost:3004/api/packages/${packageId}/history`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: updatedPackage.status,
                        date: new Date().toISOString() // Ajoute la date et l'heure actuelles
                    }),
                });

                if (!historyResponse.ok) throw new Error("Erreur lors de la mise à jour de l'historique.");
            }

            // Affiche une alerte pour informer de la réussite de l'opération
            alert(packageId ? "Colis modifié avec succès !" : "Nouveau colis enregistré avec succès !");
            window.location.href = "admin.html"; // Redirige vers la page d'administration
        } catch (error) {
            // En cas d'erreur, affiche un message d'erreur
            alert(error.message);
        }
    });
});
