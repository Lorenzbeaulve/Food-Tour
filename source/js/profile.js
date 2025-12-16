const API_BASE = window.API_BASE || 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // Load user data from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        // No user logged in, redirect to login
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(userStr);
    console.log('Loaded user from localStorage:', user);

    // Populate profile page with user data
    const userNameEl = document.getElementById('user-name');
    const userEmailEl = document.getElementById('user-email');
    if (userNameEl) {
        userNameEl.textContent = (user.nome || '') + ' ' + (user.cognome || '');
    }
    if (userEmailEl) {
        userEmailEl.textContent = user.email || '';
    }

    // Edit profile button
    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            // Store the email in sessionStorage so edit_profile.html can access it
            sessionStorage.setItem('editUserEmail', user.email);
            window.location.href = 'edit_profile.html';
        });
    }

    // Delete account button
    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            const confirmDelete = confirm('Sei sicuro di voler eliminare il tuo account? Questa azione non può essere annullata.');
            if (!confirmDelete) return;

            // Prompt for password confirmation
            const password = prompt('Inserisci la tua password per confermare l\'eliminazione:');
            if (!password) return;

            try {
                const res = await fetch(API_BASE + '/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, password })
                });
                const data = await res.json();
                if (res.ok && data && data.success) {
                    // Clear localStorage and redirect to login
                    localStorage.removeItem('user');
                    alert('Account eliminato con successo');
                    window.location.href = 'index.html';
                } else if (data && data.msg) {
                    alert('Errore: ' + data.msg);
                } else {
                    alert('Errore durante l\'eliminazione dell\'account');
                }
            } catch (err) {
                console.error('Delete error:', err);
                alert('Errore di rete durante l\'eliminazione dell\'account');
            }
        });
    }
});
