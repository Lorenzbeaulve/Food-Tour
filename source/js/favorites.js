const API_BASE = window.API_BASE || 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        // not logged in
        document.getElementById('favorites-empty').textContent = 'Nessun utente autenticato.';
        return;
    }

    const user = JSON.parse(userStr);
    const email = user.email;
    if (!email) {
        document.getElementById('favorites-empty').textContent = 'Nessun utente autenticato.';
        return;
    }

    loadFavorites(email);
});

async function loadFavorites(email) {
    const listEl = document.getElementById('favorites-list');
    const emptyEl = document.getElementById('favorites-empty');
    listEl.innerHTML = '';
    emptyEl.textContent = 'Caricamento...';

    try {
        const res = await fetch(API_BASE + '/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok || !data || !data.success) {
            emptyEl.textContent = data && data.msg ? data.msg : 'Errore durante il caricamento';
            return;
        }

        const favs = data.favorites || [];
        if (favs.length === 0) {
            emptyEl.textContent = 'Nessun preferito.';
            return;
        }

        emptyEl.textContent = '';
        for (const r of favs) {
            const li = document.createElement('li');
            li.className = 'favorite-item';

            const info = document.createElement('div');
            info.className = 'favorite-info';
            const title = document.createElement('div');
            title.className = 'favorite-title';
            title.textContent = r.Name;
            const desc = document.createElement('div');
            desc.className = 'favorite-desc';
            desc.textContent = r.Description || '';
            info.appendChild(title);
            info.appendChild(desc);

            const btn = document.createElement('button');
            btn.className = 'btn icon-btn trash-btn';
            btn.title = 'Rimuovi preferito';
            btn.innerHTML = '🗑️';
            btn.addEventListener('click', async () => {
                // disable button while processing
                btn.disabled = true;
                try {
                    const rres = await fetch(API_BASE + '/favorites/remove', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, restaurant: r.Name })
                    });

                    // log status for debugging
                    console.log('[FAVORITES] remove response status:', rres.status);

                    let rdata;
                    try {
                        rdata = await rres.json();
                    } catch (parseErr) {
                        console.error('[FAVORITES] failed to parse remove response', parseErr);
                        rdata = null;
                    }

                    if (rres.ok && rdata && rdata.success) {
                        // animate removal
                        li.classList.add('fade-out');
                        setTimeout(() => {
                            li.remove();
                            // if list empty after removal, show message
                            if (document.querySelectorAll('.favorite-item').length === 0) {
                                document.getElementById('favorites-empty').textContent = 'Nessun preferito.';
                            }
                        }, 220);
                    } else {
                        btn.disabled = false;
                        const msg = rdata && (rdata.msg || rdata.error) ? (rdata.msg || rdata.error) : 'Errore durante la rimozione';
                        alert(msg + ' (status ' + rres.status + ')');
                    }
                } catch (err) {
                    // network or other fetch error
                    console.error('Remove favorite error', err);
                    btn.disabled = false;
                    alert('Errore di rete durante la rimozione: ' + (err && err.message ? err.message : String(err)));
                }
            });

            li.appendChild(info);
            li.appendChild(btn);
            listEl.appendChild(li);
        }
    } catch (err) {
        console.error('Fetch favorites error', err);
        document.getElementById('favorites-empty').textContent = 'Errore durante il caricamento';
    }
}
