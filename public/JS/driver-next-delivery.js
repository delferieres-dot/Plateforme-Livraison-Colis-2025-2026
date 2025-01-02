document.addEventListener('DOMContentLoaded', () => {
    let packages = []; // Variable globale pour stocker les colis

    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || user.role !== 'Livreur') {
        window.location.href = '/login.html'; // Redirige vers la page de connexion si non connecté
    } else {
        const adminInfoElement = document.querySelector('.admin-info p');
        adminInfoElement.textContent = user.name; // Affiche le nom de l'utilisateur

        fetchNextDelivery(user.name); // Charge les livraisons
    }

    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem('user');
        window.location.href = "login.html"; // Déconnexion
    });

    async function fetchNextDelivery(deliveryPerson) {
        try {
            const response = await fetch(`http://localhost:3004/api/packages/for-delivery-person/${deliveryPerson}`);
            if (!response.ok) throw new Error("Erreur lors de la récupération des colis");

            const allPackages = await response.json();
            console.log("Packages from API:", allPackages); // Debug

            // Filtrer les colis ayant un statut différent de "livré" et "problème"
            packages = allPackages.filter(pkg => {
                console.log(`Checking package ${pkg.trackingNumber}: status = ${pkg.status}`); // Debug
                return pkg.status && pkg.status.toLowerCase() !== 'livré' && pkg.status.toLowerCase() !== 'problème';
            });

            console.log("Filtered packages:", packages); // Debug

            if (packages.length > 0) {
                displayCurrentPackage(packages[0]); // Affiche le premier colis
                showNextPackages(); // Affiche les colis suivants
            } else {
                showNoDeliveryMessage(); // Aucun colis disponible
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des colis :", error);
        }
    }

    function displayCurrentPackage(package) {
        // Met à jour les informations du colis actuel
        document.getElementById("package-info").innerHTML = `Colis ${package.trackingNumber}`;
        document.getElementById('recipient-info').textContent = package.clientName || 'Non renseigné';
        document.getElementById('recipient-phone').textContent = package.phoneNumber || 'Non renseigné';
        document.getElementById('recipient-address').textContent = package.clientAddress || 'Non renseigné';

        const packageNote = document.getElementById("package-note");
        const noteSection = document.getElementById("note");

        if (package.note) {
            packageNote.textContent = package.note;
            noteSection.style.display = 'block'; // Affiche la note si elle existe
        } else {
            noteSection.style.display = 'none'; // Cache la note si elle est vide
        }

        const instructionsSection = document.getElementById("instructions");
        if (package.note || package.instructions) {
            instructionsSection.style.display = 'block';
        } else {
            instructionsSection.style.display = 'none';
        }

        document.getElementById("no-delivery").style.display = "none";
        document.getElementById("delivery-card").style.display = "block";
    }

    function showNoDeliveryMessage() {
        // Affiche le message lorsqu'il n'y a pas de livraison
        document.getElementById("delivery-card").style.display = "none";
        document.getElementById("no-delivery").style.display = "flex";

        document.getElementById("next-package-container").style.display = "none";
    }

    function showNextPackages() {
        const nextPackagesList = document.getElementById('next-packages-list');
        const nextPackageContainer = document.getElementById('next-package-container'); // Conteneur de la section des prochaines livraisons

        nextPackagesList.innerHTML = ''; // Réinitialise la liste des colis suivants

        // Si plus d'un colis est disponible
        if (packages.length > 1 ) {
            nextPackageContainer.style.display = 'block'; // Affiche la section des prochaines livraisons

            packages.slice(1).forEach(pkg => { // Commence à partir du deuxième colis
                const packageElement = document.createElement('div');
                packageElement.classList.add('next-package-item');

                const trackingNumber = pkg.trackingNumber || 'Non renseigné';
                const address = pkg.clientAddress || 'Non renseignée';

                packageElement.innerHTML = `
                <p class="tracking-number">${trackingNumber}</p>
                <p class="address">${address}</p>
            `;
                nextPackagesList.appendChild(packageElement);
            });
        } else {
            // Si il n'y a qu'un seul colis ou aucun colis
            nextPackageContainer.style.display = 'none'; // Masque la section entière

            const noMorePackagesMessage = document.createElement('p');
            noMorePackagesMessage.textContent = packages.length === 0 ? "Aucun colis à livrer." : "Aucun autre colis prévu.";
            noMorePackagesMessage.style.textAlign = 'center';

            nextPackagesList.appendChild(noMorePackagesMessage); // Ajoute le message dans la liste des colis
        }
    }


    document.querySelector('.problem-btn').addEventListener('click', async () => {
        try {
            const packageId = packages[0].id; // ID du colis actuel
            const response = await fetch(`http://localhost:3004/api/packages/${packageId}/problem`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                alert('Le colis a été marqué comme problème.');
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


    document.querySelector('.delivered-btn').addEventListener('click', async () => {
        try {
            const packageId = packages[0].id; // ID du colis actuel
            const response = await fetch(`http://localhost:3004/api/packages/${packageId}/livre`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
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
