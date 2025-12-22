// Recenti ristoranti
const API_BASE = window.API_BASE || 'http://localhost:3000';

function getLoggedEmail() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    const u = JSON.parse(userStr);
    return u.email || null;
  } catch {
    return null;
  }
}

async function loadRecent() {
  const email = getLoggedEmail();
  const list = document.getElementById("recent-list");
  const empty = document.getElementById("recent-empty");

  if (!email) {
    empty.textContent = "Devi effettuare il login per vedere i recenti.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/recent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      empty.textContent = "Errore nel caricamento dei recenti.";
      return;
    }

    const recent = data.recent || [];
    if (recent.length === 0) {
      empty.textContent = "Nessun ristorante recente.";
      return;
    }

    empty.textContent = "";
    list.innerHTML = recent
      .map(r => `
        <li class="favorite-item" style="margin-bottom: 12px;">
          <strong>${r.Name}</strong><br/>
          <span>${r.Location}</span><br/>
          <small>${r.Tipologia} • ${r.OpeningAndClosingTime || ""}</small>
        </li>
      `)
      .join("");
  } catch (e) {
    console.error(e);
    empty.textContent = "Errore di rete.";
  }
}

document.addEventListener("DOMContentLoaded", loadRecent);