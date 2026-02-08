const API_BASE = "http://localhost:3000";

// inizializza la mappa centrata sul Vico Equense
let map = L.map('map').setView([40.662381, 14.426408], 17);

// prova a localizzare l'utente
map.locate({ setView: true, maxZoom: 17 }); 

// se la posizione viene trovata (accesso consentito)
map.on('locationfound', (e) => {
    L.marker(e.latlng)
        .addTo(map)
        .bindPopup("Ti trovi qui.")
        .openPopup();
});

// se la posizione non viene trovata (accesso negato o errore)
map.on('locationerror', () => {
    console.warn("Impossibile ottenere la posizione.");
});

// aggiungi tile layer (sfondo mappa)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);




// definizione icone
const iconSize = [40, 40];
const icons = {
  pizzeria: L.icon({ iconUrl: "assets/icons/pizzeria.png", iconSize, iconAnchor:[16,32], popupAnchor:[0,-32] }),
  gelateria: L.icon({ iconUrl: "assets/icons/gelateria.png", iconSize, iconAnchor:[16,32], popupAnchor:[0,-32] }),
  pesce:    L.icon({ iconUrl: "assets/icons/pesce.png", iconSize, iconAnchor:[16,32], popupAnchor:[0,-32] }),
  cocktail: L.icon({ iconUrl: "assets/icons/cocktail.png", iconSize, iconAnchor:[16,32], popupAnchor:[0,-32] }),
  salumeria: L.icon({ iconUrl: "assets/icons/salumeria.png", iconSize, iconAnchor:[16,32], popupAnchor:[0,-32] }),
  rosticceria: L.icon({ iconUrl: "assets/icons/rosticceria.png", iconSize, iconAnchor:[16,32], popupAnchor:[0,-32] }),
  default:  L.icon({ iconUrl: "assets/icons/default.png", iconSize, iconAnchor:[16,32], popupAnchor:[0,-32] }),
};

// ottenere icona in base alla tipologia
function getIconByType(tipologia) {
  if (!tipologia) return icons.default;
  const key = tipologia.toLowerCase().trim();
  return icons[key] || icons.default;
}




// recensioni
async function loadRecentReviews(restaurantName) {
  const box = document.getElementById("reviews-preview");
  if (!box) return;

  box.innerHTML = "<p>Caricamento recensioni...</p>";

  try {
    const res = await fetch(`${API_BASE}/reviews/recent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurant: restaurantName })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      box.innerHTML = "<p>Errore nel caricamento recensioni.</p>";
      return;
    }

    const reviews = data.reviews || [];
    if (reviews.length === 0) {
      box.innerHTML = "<p>Nessuna recensione disponibile.</p>";
      return;
    }

    box.innerHTML = reviews.map(r => `
      <div class="review-item">
        <div class="review-author">
          ${r.Nome} ${r.Cognome}
          <span class="review-meta">
            • ${r.Consigliato === 'V' ? 'Consigliato' : 'Non consigliato'}
          </span>
        </div>
        <div class="review-text">${r.Review}</div>
      </div>
    `).join("");

  } catch (e) {
    console.error(e);
    box.innerHTML = "<p>Errore di rete.</p>";
  }
}




// mostrare i dettagli nella sidebar
function showRestaurantDetails(restaurant) {
  selectedRestaurant = restaurant;

  favoriteBtn?.classList.add("visible"); // mostra il bottone preferiti
  refreshHeartStatus();

  const email = getLoggedEmail();
  const sidebar = document.getElementById("sidebar-content");
  sidebar.innerHTML = `
    <h2>${restaurant.Name}</h2>

    <div class="restaurant-image-wrap">
      <img id="restaurantImage" class="restaurant-image" alt="Immagine ${restaurant.Name}">
    </div>

    <p><strong>Tipologia:</strong> ${restaurant.Tipologia}</p>
    <p><strong>Orari:</strong> ${restaurant.OpeningAndClosingTime}</p>
    <p>${restaurant.Description}</p>
    <p><em>${restaurant.Location}</em></p>

    <div class="reviews-section">
      <h3 class="reviews-title">Recensioni recenti</h3>

      <div id="reviews-preview">
        <p>Caricamento recensioni...</p>
      </div>

      <button id="openAllReviewsBtn" class="btn reviews-all-btn">
        Vedi tutte le recensioni
      </button>

      ${email ? `
        <div class="review-form">
          <h3>Lascia una recensione</h3>

          <textarea id="reviewText" rows="3"
            placeholder="Scrivi la tua recensione..."></textarea>

          <div class="review-form-actions">
            <select id="reviewConsigliato">
              <option value="V">Consigliato</option>
              <option value="F">Non consigliato</option>
            </select>

            <button id="sendReviewBtn" class="btn">
              Invia
            </button>
          </div>

          <div id="reviewMsg" class="review-msg"></div>
        </div>
      ` : `
        <p class="review-msg">Accedi per lasciare una recensione.</p>
      `}
    </div>
  `;

  // Imposta l'immagine del ristorante con fallback se non presente
  const imgEl = document.getElementById("restaurantImage");
  if (imgEl) {
    let tried = 0;
    const setSrc = (ext) => imgEl.src = `assets/ImgResturant/${encodeURIComponent(restaurant.Name)}.${ext}`;
    imgEl.onerror = function() {
      if (tried === 0) {
        tried++;
        setSrc('png');
      } else {
        this.onerror = null;
        this.src = null; // immagine vuota se nessun formato trovato
        this.style.display = 'none';
      }
    };
    setSrc('jpg');
  }

  loadRecentReviews(restaurant.Name); // carica le 3 recensioni più recenti

  document.getElementById("openAllReviewsBtn") // bottone per vedere tutte le recensioni
    ?.addEventListener("click", () => {
      window.location.href =
        `reviews.html?restaurant=${encodeURIComponent(restaurant.Name)}`;
    });

  document.getElementById("sendReviewBtn") // invio recensione
    ?.addEventListener("click", async () => {
      const text = document.getElementById("reviewText")?.value.trim();
      const cons = document.getElementById("reviewConsigliato")?.value || 'V';
      const msg = document.getElementById("reviewMsg");

      if (!email) return alert("Devi effettuare il login.");
      if (!text) return alert("Scrivi una recensione.");

      try {
        const res = await fetch(`${API_BASE}/reviews/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            restaurant: restaurant.Name,
            review: text,
            consigliato: cons
          })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          msg.textContent = data.msg || data.error || "Errore invio recensione";
          return;
        }

        document.getElementById("reviewText").value = ""; // reset e ricarica preview
        msg.textContent = "";
        loadRecentReviews(restaurant.Name);

      } catch (e) {
        console.error(e);
        alert("Errore di rete.");
      }
    });
}





// funzione per creare marker
function createRestaurantMarker(r) {
  const lat = Number(r.Latitude);
  const lng = Number(r.Longitude);
  if (isNaN(lat) || isNaN(lng)) return;

  L.marker([lat, lng], { icon: getIconByType(r.Tipologia) })
    .addTo(map)
    .bindPopup(`<strong>${r.Name}</strong>`)
    .on("click", async () => {
      showRestaurantDetails(r);
      await addToRecent(r.Name);   // <<< salva nei recenti
    });
}

// carica ristoranti dal backend
async function loadRestaurants() {
  try {
    console.log("CHIAMO /restaurants...");
    const res = await fetch(`${API_BASE}/restaurants`, {
      method: "POST"
    });
    console.log("STATUS:", res.status);

    const data = await res.json();
    console.log("RISPOSTA:", data);

    if (!data.success) return;

    data.restaurants.forEach(createRestaurantMarker);
  } catch (err) {
    console.error("Errore caricamento ristoranti", err);
  }
}

// chiamata funzione di inizializzazione
loadRestaurants();





// preferiti
let selectedRestaurant = null;

const favoriteBtn = document.getElementById("favoriteBtn");
const favoriteIcon = document.getElementById("favoriteIcon");

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

function setHeart(isFav) {
  if (!favoriteIcon) return;
  favoriteIcon.src = isFav ? "assets/icons/heart_full.png" : "assets/icons/heart_empty.png";
}

async function refreshHeartStatus() {
  const email = getLoggedEmail();
  if (!email || !selectedRestaurant) {
    setHeart(false);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/favorites/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, restaurant: selectedRestaurant.Name })
    });
    const data = await res.json();
    if (res.ok && data && data.success) setHeart(!!data.isFavorite);
  } catch (e) {
    console.error("Errore status preferito", e);
  }
}

favoriteBtn?.addEventListener("click", async () => {
  const email = getLoggedEmail();
  if (!email) {
    alert("Effettua il login per aggiungere preferiti.");
    return;
  }
  if (!selectedRestaurant) {
    alert("Seleziona prima un ristorante sulla mappa.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/favorites/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, restaurant: selectedRestaurant.Name })
    });
    const data = await res.json();
    if (res.ok && data && data.success) {
      setHeart(!!data.isFavorite);
    } else {
      alert((data && (data.msg || data.error)) || "Errore preferiti");
    }
  } catch (e) {
    console.error("Errore toggle preferito", e);
    alert("Errore di rete durante il salvataggio preferito.");
  }
});




// recenti
async function addToRecent(restaurantName) {
  const email = getLoggedEmail(); // getLoggedEmail definita sopra (sezione preferiti)
  if (!email || !restaurantName) return;

  try {
    await fetch(`${API_BASE}/recent/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, restaurant: restaurantName })
    });
  } catch (e) {
    console.error("Errore add recent", e);
  }
}



