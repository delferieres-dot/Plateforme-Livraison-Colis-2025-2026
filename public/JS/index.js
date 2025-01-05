// Gestion du bouton de connexion (redirige vers la page de connexion)
document.getElementById('login-btn').addEventListener('click', function() {
    window.location.href = '/login.html'; // Redirige vers la page de connexion
});

// Gestion du bouton de suivi (effectue la recherche du colis via le numéro de suivi)
document.getElementById('buttonFollow').addEventListener('click', function() {
    const trackingNumber = document.querySelector('input[type="text"]').value; // Récupère le numéro de suivi saisi par l'utilisateur

    // Vérifie si un numéro de suivi a été saisi
    if (!trackingNumber) {
        alert("Veuillez entrer un numéro de suivi."); // Affiche un message si aucun numéro de suivi n'est saisi
        return; // Arrête l'exécution si le champ est vide
    }

    // Effectue une requête GET pour vérifier si le numéro de suivi est valide
    fetch(`/api/packages/track/${trackingNumber}`)
        .then(response => response.json()) // Traite la réponse sous forme de JSON
        .then(data => {
            if (data.message) {
                // Si le numéro de suivi est invalide (message d'erreur retourné par l'API)
                alert('Numéro de suivi invalide'); // Affiche un message d'erreur
            } else {
                // Si le numéro de suivi est valide, redirige vers la page de suivi avec le numéro de suivi en paramètre
                window.location.href = `tracking.html?trackingNumber=${trackingNumber}`;
            }
        })
        .catch(error => {
            // En cas d'erreur lors de la requête
            alert("Une erreur s'est produite lors de la vérification."); // Affiche un message d'erreur
        });
});
