// Gestion du bouton de connexion qui redirige vers la page de connexion
document.getElementById('login-btn').addEventListener('click', () => {
    window.location.href = '/login.html';  // Redirige vers la page de connexion
});

// Gestion du contenu de la page lors du chargement
document.addEventListener('DOMContentLoaded', () => {
    // Récupère les paramètres de l'URL, en particulier le numéro de suivi
    const urlParams = new URLSearchParams(window.location.search);
    const trackingNumber = urlParams.get('trackingNumber');  // Récupère le numéro de suivi

    // Si un numéro de suivi est présent dans l'URL
    if (trackingNumber) {
        // Effectue une requête pour récupérer les informations du colis en fonction du numéro de suivi
        fetch(`/api/packages/track/${trackingNumber}`)
            .then(response => response.json())  // Transforme la réponse en JSON
            .then(data => {
                if (data.message) {
                    // Si le serveur retourne un message d'erreur (ex: colis non trouvé)
                    alert(data.message);
                } else {
                    // Mettre à jour l'affichage des informations du colis

                    // Mettre à jour le titre avec le numéro de suivi et le statut
                    document.querySelector('.tracking-title p').innerHTML =
                        `<strong>N° ${data.trackingNumber}</strong><span class="small-status"> ${data.status}</span>`;

                    // Mettre à jour les détails du colis (date estimée, poids, destinataire)
                    document.querySelector('.tracking-details').innerHTML =
                        `<h3>Détails de livraison</h3>
                        <div class="details-row">
                            <div class="details-block">
                                <p>Date estimée :</p>
                                <p>${data.shipDate}</p>
                            </div>
                            <div class="details-block">
                                <p>Poids :</p>
                                <p>${data.weight} kg</p>
                            </div>
                            <div class="details-block">
                                <p>Destinataire :</p>
                                <p>${data.clientName}</p>
                            </div>
                        </div>`;

                    // Mettre à jour l'adresse de livraison
                    document.querySelector('#clientAddress').textContent = data.clientAddress;

                    // Ajouter la timeline des étapes de livraison
                    fetch(`/api/packages/${data.id}/history`)
                        .then(response => response.json())  // Récupère l'historique des étapes de livraison
                        .then(history => {
                            const timeline = document.querySelector('.timeline');
                            timeline.innerHTML = ''; // Réinitialiser la timeline à chaque chargement

                            // Si l'historique existe, on l'affiche dans la timeline
                            if (history.length > 0) {
                                history.forEach((step, index) => {
                                    // Vérifie si c'est l'étape en cours (la dernière dans l'historique)
                                    const isCurrent = index === history.length - 1 && data.status === step.status;
                                    const statusMessage = getStatusMessage(step.status);  // Récupère le message associé au statut

                                    // Crée un élément pour chaque étape de la timeline
                                    const stepElement = document.createElement('div');
                                    stepElement.classList.add('timeline-step');

                                    stepElement.innerHTML =
                                        `<div class="status-circle ${isCurrent ? 'blue' : 'green'}"></div>
                                        <div class="status-info">
                                            <strong>${step.status}</strong>
                                            <p>${new Date(step.date).toLocaleString('fr-FR', { hour12: false })}</p>
                                            <p class="status-message">${statusMessage}</p>
                                        </div>`;

                                    timeline.appendChild(stepElement);  // Ajoute l'élément à la timeline
                                });
                            } else {
                                timeline.innerHTML = '<p>Aucune historique disponible pour ce colis.</p>';  // Si aucune étape n'est disponible
                            }
                        })
                        .catch(error => {
                            // En cas d'erreur lors de la récupération de l'historique
                            alert('Une erreur s\'est produite lors de la récupération de l\'historique.');
                        });
                }
            })
            .catch(error => {
                // En cas d'erreur lors de la récupération des informations du colis
                alert('Une erreur s\'est produite.');
            });
    }
});

// Fonction qui retourne un message associé à un statut de livraison
function getStatusMessage(status) {
    switch (status) {
        case 'En préparation':
            return 'Le colis est en cours de préparation.';
        case 'En livraison':
            return 'Le colis est en cours de livraison.';
        case 'Problème':
            return 'Il y a un problème avec le colis.';
        case 'Livré':
            return 'Le colis a été livré.';
        default:
            return 'Statut inconnu.';  // Cas où le statut est non défini ou inconnu
    }
}
