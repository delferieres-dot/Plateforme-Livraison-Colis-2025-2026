document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();  // Empêcher l'envoi traditionnel du formulaire

    const email = document.getElementById('login').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3004/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),  // Envoi des données en JSON
        });

        const result = await response.json();
        console.log(result);  // Debug pour afficher la réponse

        if (response.ok) {
            // Enregistrer les informations de l'utilisateur dans localStorage
            localStorage.setItem('user', JSON.stringify(result.user));

            if (result.user.role === 'Administrateur') {
                window.location.href = '/admin.html';
            } else if (result.user.role === 'Livreur') {
                window.location.href = '/driver-next-delivery.html';
            }
        } else {
            alert(result.message);  // Affiche le message d'erreur si la connexion échoue
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
    }
});
