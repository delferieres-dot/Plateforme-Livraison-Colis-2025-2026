document.getElementById('logout').addEventListener('click', async () => {
    window.location.href = '/login.html';
});

document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.querySelector(".package-table tbody");
    const searchBar = document.querySelector(".search-bar");
    const datePicker = document.querySelector(".date-picker");
    const statusFilter = document.querySelector(".status-filter");
    const resetButton = document.getElementById("reset-button");

    try {
        const response = await fetch('http://localhost:3004/api/packages');
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const packages = await response.json();

        const renderPackages = (filterText = "", filterDate = "", filterStatus = "") => {
            const filteredPackages = packages.filter(pkg => {
                const matchesText =
                    pkg.trackingNumber?.toLowerCase().includes(filterText) ||
                    pkg.clientName?.toLowerCase().includes(filterText) ||
                    pkg.clientAddress?.toLowerCase().includes(filterText) ||
                    pkg.deliveryPerson?.toLowerCase().includes(filterText);
                const matchesDate = filterDate ? pkg.shipDate === filterDate : true;
                const matchesStatus = filterStatus ? (pkg.status?.toLowerCase() === filterStatus.toLowerCase()) : true;
                return matchesText && matchesDate && matchesStatus;
            });

            if (filteredPackages.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='7'>Aucun colis trouvé.</td></tr>";
                return;
            }

            tableBody.innerHTML = "";
            filteredPackages.forEach(pkg => {
                const row = document.createElement("tr");

                // Déterminer la classe pour le statut
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
                tableBody.appendChild(row);
            });
        };

        // Initial rendering
        renderPackages();

        // Afficher le bouton "Réinitialiser" lorsqu'un filtre est appliqué
        const showResetButton = () => {
            resetButton.style.display = "inline-block";
        };

        // Masquer le bouton "Réinitialiser" lorsqu'aucun filtre n'est appliqué
        const hideResetButton = () => {
            resetButton.style.display = "none";
        };

        // Gestion des filtres
        searchBar.addEventListener("input", () => {
            const filterText = searchBar.value.toLowerCase();
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
            renderPackages();
            hideResetButton();
        });

        // Gestion des clics pour supprimer ou éditer
        tableBody.addEventListener('click', async (event) => {
            const target = event.target;

            if (target.classList.contains('delete-btn')) {
                const packageId = target.getAttribute('data-id');
                const confirmed = confirm("Êtes-vous sûr de vouloir supprimer ce colis ?");
                if (confirmed) {
                    try {
                        const response = await fetch(`http://localhost:3004/api/packages/${packageId}`, {
                            method: 'DELETE',
                        });

                        if (!response.ok) {
                            throw new Error(`Erreur HTTP: ${response.status}`);
                        }

                        alert("Colis supprimé avec succès !");
                        window.location.reload(); // Recharge la page
                    } catch (error) {
                        console.error('Erreur lors de la suppression du colis:', error);
                        alert('Une erreur est survenue lors de la suppression du colis.');
                    }
                }
            }

            if (target.classList.contains('edit-btn')) {
                const packageId = target.getAttribute('data-id');
                window.location.href = `edit-delivery.html?id=${packageId}`;
            }
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des colis:", error);
        tableBody.innerHTML = `<tr><td colspan='7'>Erreur: ${error.message}</td></tr>`;
    }
});

// Nouveau colis
document.getElementById("add-package-btn").addEventListener("click", () => {
    window.location.href = "edit-delivery.html";
});
