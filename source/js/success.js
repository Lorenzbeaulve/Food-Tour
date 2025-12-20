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
    alert("Impossibile determinare la posizione.");
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





// mostrare i dettagli nella sidebar
function showRestaurantDetails(restaurant) {
  selectedRestaurant = restaurant;
  favoriteBtn?.classList.add("visible"); // mostra il bottone preferiti
  refreshHeartStatus();

  const sidebar = document.getElementById("sidebar-content");
  sidebar.innerHTML = `
    <h2>${restaurant.Name}</h2>
    <p><strong>Tipologia:</strong> ${restaurant.Tipologia}</p>
    <p><strong>Orari:</strong> ${restaurant.OpeningAndClosingTime}</p>
    <p>${restaurant.Description}</p>
    <p><em>${restaurant.Location}</em></p>
  `;
}


// funzione per creare marker
function createRestaurantMarker(r) {
  const lat = Number(r.Latitude);
  const lng = Number(r.Longitude);
  if (isNaN(lat) || isNaN(lng)) return;

  L.marker([lat, lng], { icon: getIconByType(r.Tipologia) })
    .addTo(map)
    .bindPopup(`<strong>${r.Name}</strong>`)
    .on("click", () => showRestaurantDetails(r));
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








/* marker di esempio

// marker di esempio per ristorante
const sampleRestaurant = {
    name: "Ristorante Demo",
    lat: 40.856,
    lng: 14.268,
    address: "Via Roma 10, Napoli"
};

// creazione marker
const marker = L.marker([sampleRestaurant.lat, sampleRestaurant.lng]).addTo(map);

// popup quando clicchi il marker
marker.bindPopup(`<b>${sampleRestaurant.name}</b><br>${sampleRestaurant.address}`);

// apri dettagli nella sidebar al click
marker.on('click', () => {
    document.getElementById("sidebar-content").innerHTML = `
        <h3>${sampleRestaurant.name}</h3>
        <p><strong>Indirizzo:</strong> ${sampleRestaurant.address}</p>
    `;
});

*/