// Gestion de l'événement de soumission du formulaire de connexion
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();  // Empêche l'envoi traditionnel du formulaire (évite le rafraîchissement de la page)

    const email = document.getElementById('login').value; // Récupère l'email saisi
    const password = document.getElementById('password').value; // Récupère le mot de passe saisi

    try {
        // Envoie une requête POST pour tenter de connecter l'utilisateur
        const response = await fetch('http://localhost:3004/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  // Indique que les données envoyées sont en JSON
            },
            body: JSON.stringify({ email, password }),  // Convertit les données en JSON avant de les envoyer
        });

        const result = await response.json();  // Récupère la réponse en format JSON

        // Vérifie si la réponse est réussie (code HTTP 200)
        if (response.ok) {
            // Si la connexion réussit, enregistre le token et les informations de l'utilisateur dans le localStorage
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));

            // Redirige en fonction du rôle de l'utilisateur
            if (result.user.role === 'Administrateur') {
                window.location.href = '/admin.html'; // Redirige vers la page d'administration
            } else if (result.user.role === 'Livreur') {
                window.location.href = '/driver-next-delivery.html'; // Redirige vers la page de suivi des livraisons
            }
        } else {
            // Si la connexion échoue, affiche le message d'erreur retourné par l'API
            alert(result.message);
        }
    } catch (error) {
        // Si une erreur se produit lors de la requête, affiche un message générique
        alert('Une erreur est survenue. Veuillez réessayer.');
    }
});
