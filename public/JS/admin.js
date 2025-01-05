// Ajout d'un écouteur d'événement pour la déconnexion
document.getElementById('logout').addEventListener('click', async () => {
    window.location.href = '/login.html'; // Redirige vers la page de connexion
});

// Événement qui s'exécute lorsque le DOM est complètement chargé
document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.querySelector(".package-table tbody"); // Récupère le corps du tableau des colis
    const searchBar = document.querySelector(".search-bar"); // Barre de recherche
    const datePicker = document.querySelector(".date-picker"); // Sélecteur de date
    const statusFilter = document.querySelector(".status-filter"); // Filtre de statut
    const resetButton = document.getElementById("reset-button"); // Bouton de réinitialisation

    try {
        // Récupère les colis depuis l'API
        const response = await fetch('http://localhost:3004/api/packages');
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const packages = await response.json(); // Parse la réponse en JSON

        // Fonction pour afficher les colis filtrés
        const renderPackages = (filterText = "", filterDate = "", filterStatus = "") => {
            // Filtrage des colis selon les critères
            const filteredPackages = packages.filter(pkg => {
                const matchesText =
                    pkg.trackingNumber?.toLowerCase().includes(filterText) || // Filtre par numéro de suivi, nom du client, adresse, ou livreur
                    pkg.clientName?.toLowerCase().includes(filterText) ||
                    pkg.clientAddress?.toLowerCase().includes(filterText) ||
                    pkg.deliveryPerson?.toLowerCase().includes(filterText);
                const matchesDate = filterDate ? pkg.shipDate === filterDate : true; // Filtre par date
                const matchesStatus = filterStatus ? (pkg.status?.toLowerCase() === filterStatus.toLowerCase()) : true; // Filtre par statut
                return matchesText && matchesDate && matchesStatus;
            });

            // Si aucun colis n'est trouvé, affiche un message
            if (filteredPackages.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='7'>Aucun colis trouvé.</td></tr>";
                return;
            }

            // Sinon, affiche les colis filtrés
            tableBody.innerHTML = "";
            filteredPackages.forEach(pkg => {
                const row = document.createElement("tr");

                // Déterminer la classe CSS en fonction du statut
                let statusClass = "";
                switch ((pkg.status || "").toLowerCase()) {
                    case "problème":
                        statusClass = "probleme";
                        break;
                    case "en préparation":
                        statusClass = "en-preparation";
                        break;
                    case "en livraison":
                        statusClass = "en-livraison";
                        break;
                    case "livré":
                        statusClass = "livre";
                        break;
                    default:
                        statusClass = "";
                }

                // Crée une ligne de tableau avec les informations du colis
                row.innerHTML = `
                    <td>${pkg.trackingNumber || 'Non disponible'}</td>
                    <td>${pkg.shipDate || 'Non spécifiée'}</td>
                    <td>${pkg.clientName || 'Inconnu'}</td>
                    <td>${pkg.clientAddress || 'Adresse inconnue'}</td>
                    <td><span class="status ${statusClass}">${pkg.status || 'Non précisé'}</span></td>
                    <td>${pkg.deliveryPerson || 'Non attribué'}</td>
                    <td>
                        <button class="edit-btn" data-id="${pkg.id}">✏️</button>
                        <button class="delete-btn" data-id="${pkg.id}">🗑️</button>
                    </td>
                `;
                tableBody.appendChild(row); // Ajoute la ligne au tableau
            });
        };

        // Rendu initial des colis
        renderPackages();

        // Afficher le bouton "Réinitialiser" lorsqu'un filtre est appliqué
        const showResetButton = () => {
            resetButton.style.display = "inline-block";
        };

        // Masquer le bouton "Réinitialiser" lorsqu'aucun filtre n'est appliqué
        const hideResetButton = () => {
            resetButton.style.display = "none";
        };

        // Gestion des filtres : recherche, date, et statut
        searchBar.addEventListener("input", () => {
            const filterText = searchBar.value.toLowerCase(); // Récupère le texte de recherche
            renderPackages(filterText, datePicker.value, statusFilter.value);
            showResetButton();
        });

        datePicker.addEventListener("input", () => {
            renderPackages(searchBar.value.toLowerCase(), datePicker.value, statusFilter.value);
            showResetButton();
        });

        statusFilter.addEventListener("change", () => {
            renderPackages(searchBar.value.toLowerCase(), datePicker.value, statusFilter.value);
            showResetButton();
        });

        // Réinitialisation des filtres
        resetButton.addEventListener("click", () => {
            searchBar.value = "";
            datePicker.value = "";
            statusFilter.value = "";
            renderPackages(); // Rendu des colis sans filtre
            hideResetButton();
        });

        // Gestion des clics pour supprimer ou éditer un colis
        tableBody.addEventListener('click', async (event) => {
            const target = event.target;

            // Suppression du colis
            if (target.classList.contains('delete-btn')) {
                const packageId = target.getAttribute('data-id');
                const confirmed = confirm("Êtes-vous sûr de vouloir supprimer ce colis ?");
                if (confirmed) {
                    try {
                        const response = await fetch(`http://localhost:3004/api/packages/${packageId}`, {
                            method: 'DELETE', // Méthode de suppression
                        });

                        if (!response.ok) {
                            throw new Error(`Erreur HTTP: ${response.status}`);
                        }

                        alert("Colis supprimé avec succès !");
                        window.location.reload(); // Recharge la page après la suppression
                    } catch (error) {
                        console.error('Erreur lors de la suppression du colis:', error);
                        alert('Une erreur est survenue lors de la suppression du colis.');
                    }
                }
            }

            // Redirection vers la page d'édition du colis
            if (target.classList.contains('edit-btn')) {
                const packageId = target.getAttribute('data-id');
                window.location.href = `edit-delivery.html?id=${packageId}`;
            }
        });

    } catch (error) {
        // Affiche une erreur si la récupération des colis échoue
        console.error("Erreur lors de la récupération des colis:", error);
        tableBody.innerHTML = `<tr><td colspan='7'>Erreur: ${error.message}</td></tr>`;
    }
});

// Nouveau colis : redirection vers la page d'ajout
document.getElementById("add-package-btn").addEventListener("click", () => {
    window.location.href = "edit-delivery.html"; // Redirige vers la page d'édition pour un nouveau colis
});
