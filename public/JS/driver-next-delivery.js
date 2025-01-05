document.addEventListener('DOMContentLoaded', () => {
    let packages = []; // Variable globale pour stocker les colis

    // Récupère les informations de l'utilisateur depuis le localStorage
    const user = JSON.parse(localStorage.getItem('user'));

    // Si l'utilisateur n'est pas connecté ou n'est pas un livreur, redirection vers la page de connexion
    if (!user || user.role !== 'Livreur') {
        window.location.href = '/login.html';
    } else {
        // Affiche le nom de l'utilisateur dans la section admin-info
        const adminInfoElement = document.querySelector('.admin-info p');
        adminInfoElement.textContent = user.name;

        // Charge les colis à livrer pour ce livreur
        fetchNextDelivery(user.name);
    }

    // Écouteur d'événement pour la déconnexion
    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem('user'); // Supprime les données utilisateur du localStorage
        window.location.href = "login.html"; // Redirige vers la page de connexion
    });

    // Fonction pour récupérer les colis à livrer pour un livreur
    async function fetchNextDelivery(deliveryPerson) {
        try {
            // Appel à l'API pour obtenir les colis du livreur
            const response = await fetch(`http://localhost:3004/api/packages/for-delivery-person/${deliveryPerson}`);
            if (!response.ok) throw new Error("Erreur lors de la récupération des colis");

            const allPackages = await response.json();

            // Filtre les colis qui ne sont pas encore livrés ou ayant un problème
            packages = allPackages.filter(pkg => pkg.status && pkg.status.toLowerCase() !== 'livré' && pkg.status.toLowerCase() !== 'problème');

            // Si des colis sont trouvés, affiche le premier colis et les suivants
            if (packages.length > 0) {
                displayCurrentPackage(packages[0]); // Affiche le premier colis
                showNextPackages(); // Affiche les colis suivants
            } else {
                showNoDeliveryMessage(); // Affiche un message si aucun colis n'est disponible
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des colis :", error);
        }
    }

    // Fonction pour afficher les informations du colis actuel
    function displayCurrentPackage(package) {
        // Met à jour les informations du colis sur la page
        document.getElementById("package-info").innerHTML = `Colis ${package.trackingNumber}`;
        document.getElementById('recipient-info').textContent = package.clientName || 'Non renseigné';
        document.getElementById('recipient-phone').textContent = package.phoneNumber || 'Non renseigné';
        document.getElementById('recipient-address').textContent = package.clientAddress || 'Non renseigné';

        const packageNote = document.getElementById("package-note");
        const noteSection = document.getElementById("note");

        // Affiche la note si elle existe, sinon la cache
        if (package.note) {
            packageNote.textContent = package.note;
            noteSection.style.display = 'block';
        } else {
            noteSection.style.display = 'none';
        }

        const instructionsSection = document.getElementById("instructions");
        // Affiche la section des instructions si une note ou des instructions existent
        if (package.note || package.instructions) {
            instructionsSection.style.display = 'block';
        } else {
            instructionsSection.style.display = 'none';
        }

        // Affiche le colis actuel
        document.getElementById("no-delivery").style.display = "none";
        document.getElementById("delivery-card").style.display = "block";
    }

    // Fonction pour afficher un message si aucun colis n'est disponible
    function showNoDeliveryMessage() {
        document.getElementById("delivery-card").style.display = "none";
        document.getElementById("no-delivery").style.display = "flex";
        document.getElementById("next-package-container").style.display = "none";
    }

    // Fonction pour afficher les colis suivants dans la liste
    function showNextPackages() {
        const nextPackagesList = document.getElementById('next-packages-list');
        const nextPackageContainer = document.getElementById('next-package-container'); // Conteneur de la section des prochaines livraisons

        nextPackagesList.innerHTML = ''; // Réinitialise la liste des colis suivants

        // Si plus d'un colis est disponible
        if (packages.length > 1 ) {
            nextPackageContainer.style.display = 'block'; // Affiche la section des prochaines livraisons

            // Affiche tous les colis suivants
            packages.slice(1).forEach(pkg => {
                const packageElement = document.createElement('div');
                packageElement.classList.add('next-package-item');

                const trackingNumber = pkg.trackingNumber || 'Non renseigné';
                const address = pkg.clientAddress || 'Non renseignée';

                // Ajoute un élément pour chaque colis suivant
                packageElement.innerHTML = `
                <p class="tracking-number">${trackingNumber}</p>
                <p class="address">${address}</p>
            `;
                nextPackagesList.appendChild(packageElement);
            });
        } else {
            // Si il n'y a qu'un seul colis ou aucun colis
            nextPackageContainer.style.display = 'none'; // Masque la section des prochains colis

            // Affiche un message s'il n'y a plus de colis
            const noMorePackagesMessage = document.createElement('p');
            noMorePackagesMessage.textContent = packages.length === 0 ? "Aucun colis à livrer." : "Aucun autre colis prévu.";
            noMorePackagesMessage.style.textAlign = 'center';

            nextPackagesList.appendChild(noMorePackagesMessage); // Ajoute le message dans la liste des colis
        }
    }

    // Écouteur d'événement pour signaler un problème avec le colis
    document.querySelector('.problem-btn').addEventListener('click', async () => {
        try {
            const packageId = packages[0].id; // ID du colis actuel
            const response = await fetch(`http://localhost:3004/api/packages/${packageId}/problem`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            // Si la mise à jour est réussie
            if (response.ok) {
                // Ajouter une entrée dans l'historique
                await fetch(`http://localhost:3004/api/packages/${packageId}/history`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: 'Problème',
                        date: new Date().toISOString() // Ajoute la date et l'heure actuelles
                    }),
                });

                fetchNextDelivery(user.name); // Recharge la liste des colis
            } else {
                const errorData = await response.json();
                alert(`Erreur: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Erreur lors du signalement du problème :", error);
            alert('Une erreur est survenue. Veuillez réessayer.');
        }
    });

    // Écouteur d'événement pour marquer un colis comme livré
    document.querySelector('.delivered-btn').addEventListener('click', async () => {
        try {
            const packageId = packages[0].id; // ID du colis actuel
            const response = await fetch(`http://localhost:3004/api/packages/${packageId}/livre`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            // Si la mise à jour est réussie
            if (response.ok) {
                // Ajouter une entrée dans l'historique
                await fetch(`http://localhost:3004/api/packages/${packageId}/history`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: 'Livré',
                        date: new Date().toISOString() // Ajoute la date et l'heure actuelles
                    }),
                });

                alert('Le colis a été marqué comme livré.');
                fetchNextDelivery(user.name); // Recharge la liste des colis
            } else {
                const errorData = await response.json();
                alert(`Erreur: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Erreur lors du signalement du livré :", error);
            alert('Une erreur est survenue. Veuillez réessayer.');
        }
    });
});