// Gestion du bouton de connexion
document.getElementById('login-btn').addEventListener('click', () => {
    window.location.href = '/login.html';
});

// Gestion du contenu de la page lors du chargement
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const trackingNumber = urlParams.get('trackingNumber');

    if (trackingNumber) {
        fetch(`/api/packages/track/${trackingNumber}`)
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(data.message);
                } else {
                    // Mettre à jour les informations principales du colis
                    document.querySelector('.tracking-title p').innerHTML =
                        `<strong>N° ${data.trackingNumber}</strong><span class="small-status"> ${data.status}</span>`;

                    // Mettre à jour les détails du colis
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
                        .then(response => response.json())
                        .then(history => {
                            const timeline = document.querySelector('.timeline');
                            timeline.innerHTML = ''; // Réinitialiser la timeline

                            if (history.length > 0) {
                                history.forEach((step, index) => {
                                    const isCurrent = index === history.length - 1 && data.status === step.status;
                                    const statusMessage = getStatusMessage(step.status);

                                    const stepElement = document.createElement('div');
                                    stepElement.classList.add('timeline-step');

                                    stepElement.innerHTML =
                                        `<div class="status-circle ${isCurrent ? 'blue' : 'green'}"></div>
                                        <div class="status-info">
                                            <strong>${step.status}</strong>
                                            <p>${new Date(step.date).toLocaleString('fr-FR', { hour12: false })}</p>
                                            <p class="status-message">${statusMessage}</p>
                                        </div>`;

                                    timeline.appendChild(stepElement);
                                });
                            } else {
                                timeline.innerHTML = '<p>Aucune historique disponible pour ce colis.</p>';
                            }
                        })
                        .catch(error => {
                            console.error("Erreur lors de la récupération de l'historique:", error);
                            alert('Une erreur s\'est produite lors de la récupération de l\'historique.');
                        });
                }
            })
            .catch(error => {
                console.error("Erreur:", error);
                alert('Une erreur s\'est produite.');
            });
    }
});

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
            return 'Statut inconnu.';
    }
}