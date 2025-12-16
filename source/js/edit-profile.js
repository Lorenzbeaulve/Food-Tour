const API_BASE = window.API_BASE || 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // Load user data from sessionStorage or localStorage
    let userEmail = sessionStorage.getItem('editUserEmail');
    if (!userEmail) {
        // Try localStorage if not in session
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            window.location.href = 'index.html';
            return;
        }
        userEmail = JSON.parse(userStr).email;
    }

    // Save button
    const saveBtn = document.getElementById('save-profile-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const nome = document.getElementById('new-name').value.trim();
            const cognome = document.getElementById('new-surname').value.trim();
            const password = document.getElementById('new-password').value;

            clearEditError();

            if (!nome && !cognome && !password) {
                setEditError('Compila almeno un campo da aggiornare');
                return;
            }

            try {
                const body = { email: userEmail, nome, cognome };
                if (password) body.password = password;

                const res = await fetch(API_BASE + '/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const data = await res.json();

                if (res.ok && data && data.success) {
                    // Update localStorage user data
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        if (nome) user.nome = nome;
                        if (cognome) user.cognome = cognome;
                        localStorage.setItem('user', JSON.stringify(user));
                    }

                    setEditError('Profilo aggiornato con successo!', 'success');
                    setTimeout(() => {
                        window.location.href = 'profile.html';
                    }, 1500);
                } else if (data && data.msg) {
                    setEditError(data.msg);
                } else {
                    setEditError('Errore durante l\'aggiornamento del profilo');
                }
            } catch (err) {
                console.error('Update error:', err);
                setEditError('Errore di rete durante l\'aggiornamento del profilo');
            }
        });
    }
});

function setEditError(msg, type = 'error') {
    const el = document.getElementById('edit-error');
    if (el) {
        el.textContent = msg;
        el.style.display = 'block';
        el.style.color = type === 'success' ? 'green' : 'red';
        el.style.marginBottom = '15px';
    }
}

function clearEditError() {
    const el = document.getElementById('edit-error');
    if (el) {
        el.textContent = '';
        el.style.display = 'none';
    }
}
