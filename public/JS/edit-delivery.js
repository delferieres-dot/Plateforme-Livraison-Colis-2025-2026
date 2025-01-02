// Gestion du bouton de déconnexion
document.getElementById('logout').addEventListener('click', async () => {
    window.location.href = '/login.html';
});

// Gestion du bouton d'annulation
document.getElementById('btn-cancel').addEventListener('click', async () => {
    window.location.href = 'admin.html';
});

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const packageId = urlParams.get("id");
    let originalStatus = '';

    // Fonction pour générer le prochain numéro de suivi
    const generateTrackingNumber = async () => {
        try {
            const response = await fetch('http://localhost:3004/api/packages');
            if (!response.ok) throw new Error('Erreur lors de la récupération des colis');

            const packages = await response.json();
            if (packages.length === 0) return 'FD28465940BE'; // Premier numéro par défaut

            // Extraire le dernier numéro de suivi
            const lastTrackingNumber = packages
                .map(pkg => parseInt(pkg.trackingNumber.match(/\d+/)?.[0], 10))
                .sort((a, b) => b - a)[0];

            const nextTrackingNumber = (lastTrackingNumber + 1).toString().padStart(8, '0');
            return `FD${nextTrackingNumber}BE`;
        } catch (error) {
            console.error('Erreur lors de la génération du numéro de suivi:', error);
            return 'Erreur';
        }
    };

    // Charger les données du colis si un ID est passé
    if (packageId) {
        try {
            const response = await fetch(`http://localhost:3004/api/packages/${packageId}`);
            const packageData = await response.json();

            if (response.ok) {
                document.getElementById("tracking-number").value = packageData.trackingNumber;
                document.getElementById("display-tracking-number").textContent = packageData.trackingNumber; // Mettez à jour ici
                document.getElementById("ship-date").value = packageData.shipDate;
                document.getElementById("status").value = packageData.status;
                document.getElementById("name").value = packageData.clientName;
                document.getElementById("email").value = packageData.clientEmail;
                document.getElementById("address").value = packageData.clientAddress;
                document.getElementById("delivery-person").value = packageData.deliveryPerson;
                document.getElementById("weight").value = packageData.weight || '';
                document.getElementById("phone").value = packageData.phoneNumber || '';
                document.getElementById("notes").value = packageData.note || '';
                originalStatus = packageData.status; // Stockez le statut original
            } else {
                throw new Error("Colis non trouvé.");
            }
        } catch (error) {
            console.error("Erreur lors du chargement des données du colis:", error);
            alert("Erreur lors du chargement des données.");
        }
    } else {
        // Générer un nouveau numéro de suivi si aucun ID n'est passé
        const newTrackingNumber = await generateTrackingNumber();
        document.getElementById("tracking-number").value = newTrackingNumber;
        document.getElementById("display-tracking-number").textContent = newTrackingNumber; // Mettez à jour ici
    }

    // Gestion du bouton de sauvegarde
    document.getElementById("btn-save").addEventListener("click", async () => {
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
            const method = packageId ? 'PUT' : 'POST'; // Si packageId existe, modification (PUT), sinon création (POST)
            const url = packageId
                ? `http://localhost:3004/api/packages/${packageId}`
                : 'http://localhost:3004/api/packages';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPackage),
            });

            if (!response.ok) throw new Error("Erreur lors de la sauvegarde du colis.");

            // Mise à jour de l'historique si un statut est modifié
            if (packageId && updatedPackage.status !== originalStatus) {
                const historyResponse = await fetch(`http://localhost:3004/api/packages/${packageId}/history`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: updatedPackage.status,
                        date: new Date().toISOString() // Ajouter l'heure actuelle
                    }),
                });

                if (!historyResponse.ok) throw new Error("Erreur lors de la mise à jour de l'historique.");
            }

            alert(packageId ? "Colis modifié avec succès !" : "Nouveau colis enregistré avec succès !");
            window.location.href = "admin.html"; // Rediriger vers la page d'administration
        } catch (error) {
            console.error("Erreur:", error);
            alert(error.message);
        }
    });
});
