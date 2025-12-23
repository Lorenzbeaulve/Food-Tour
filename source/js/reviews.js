const API_BASE = "http://localhost:3000";

function getRestaurantFromQuery() {
  const p = new URLSearchParams(window.location.search);
  return p.get("restaurant");
}

async function loadAllReviews() {
  const restaurant = getRestaurantFromQuery();
  const title = document.getElementById("reviews-restaurant");
  const list = document.getElementById("reviews-list");
  const empty = document.getElementById("reviews-empty");

  if (!restaurant) {
    empty.textContent = "Ristorante non specificato.";
    return;
  }
  title.textContent = restaurant;

  try {
    const res = await fetch(`${API_BASE}/reviews/all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurant })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      empty.textContent = "Errore nel caricamento.";
      return;
    }

    const reviews = data.reviews || [];
    if (reviews.length === 0) {
      empty.textContent = "Nessuna recensione disponibile.";
      return;
    }

    empty.textContent = "";
    list.innerHTML = reviews.map(r => `
      <li class="favorite-item" style="display:block;">
        <div class="favorite-title">${r.Nome} ${r.Cognome}
          <span style="font-weight:400; color:#666;">• ${r.Consigliato === 'V' ? 'Consigliato' : 'Non consigliato'}</span>
        </div>
        <div class="favorite-desc">${r.Review}</div>
      </li>
    `).join("");

  } catch (e) {
    console.error(e);
    empty.textContent = "Errore di rete.";
  }
}

document.addEventListener("DOMContentLoaded", loadAllReviews);
