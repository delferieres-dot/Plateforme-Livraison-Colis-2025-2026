document.getElementById('login-btn').addEventListener('click', function() {
    window.location.href = '/login.html';
})

document.getElementById('buttonFollow').addEventListener('click', function() {
    const trackingNumber = document.querySelector('input[type="text"]').value; // Récupère le numéro de suivi saisi

    if (!trackingNumber) {
        alert("Veuillez entrer un numéro de suivi.");
        return;
    }

    // Effectuer une requête GET pour vérifier si le numéro de suivi est valide
    fetch(`/api/packages/track/${trackingNumber}`)
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                // Si le numéro de suivi est invalide
                alert('Numéro de suivi invalide');
            } else {
                // Si le numéro de suivi est trouvé, redirige vers la page de suivi
                window.location.href = `tracking.html?trackingNumber=${trackingNumber}`;
            }
        })
        .catch(error => {
            console.error("Erreur:", error);
            alert("Une erreur s'est produite lors de la vérification.");
        });
});
