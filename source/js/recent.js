// Recenti ristoranti
const API_BASE = window.API_BASE || 'http://localhost:3000';

async function loadRecentRestaurants() {
    const userStr = localStorage.getItem('user');
    const userEmail = userStr ? (() => { try { return JSON.parse(userStr).email } catch { return null } })() : null;

    if (!userEmail) {
        const emptyEl = document.getElementById('recent-empty');
        if (emptyEl) emptyEl.textContent = getTranslation('no-data');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/recent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail })
        });

        const data = await response.json();

        if (data && data.success && Array.isArray(data.recent) && data.recent.length > 0) {
            const emptyEl = document.getElementById('recent-empty');
            if (emptyEl) emptyEl.style.display = 'none';
            const recentList = document.getElementById('recent-list');
            if (!recentList) return;
            recentList.innerHTML = '';

            data.recent.forEach(item => {
                const li = document.createElement('li');
                li.style.cssText = 'padding: 1rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;';
                
                const name = document.createElement('strong');
                name.textContent = item.Restaurant_Name;
                
                const time = document.createElement('span');
                time.style.color = '#888';
                time.textContent = new Date(item.Viewed_time).toLocaleString(getLanguage());
                
                li.appendChild(name);
                li.appendChild(time);
                recentList.appendChild(li);
            });
        } else {
            const emptyEl = document.getElementById('recent-empty');
            if (emptyEl) emptyEl.textContent = getTranslation('no-recent');
        }
    } catch (err) {
        console.error('Errore caricamento recenti:', err);
        const emptyEl = document.getElementById('recent-empty');
        if (emptyEl) emptyEl.textContent = getTranslation('error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const title = document.getElementById('recent-title'); if (title) title.textContent = getTranslation('recent');
    const homeText = document.getElementById('home-text'); if (homeText) homeText.textContent = getTranslation('Torna alla Home');
    loadRecentRestaurants();
});