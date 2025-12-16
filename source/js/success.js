const API_BASE = "http://localhost:3000";

// inizializza la mappa centrata sul Vico Equense
let map = L.map('map').setView([40.6608, 14.4333], 15);

/* chiede posizione e localizza utente

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

*/

// aggiungi tile layer (sfondo mappa)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);




// definizione icone
const iconSize = [32, 32];
const icons = {
  pizzeria: L.icon({ iconUrl: "assets/icons/temp.png", iconSize, iconAnchor:[16,32], popupAnchor:[0,-32] }),
  gelateria: L.icon({ iconUrl: "assets/icons/temp.png", iconSize, iconAnchor:[16,32], popupAnchor:[0,-32] }),
  pesce:    L.icon({ iconUrl: "assets/icons/temp.png", iconSize, iconAnchor:[16,32], popupAnchor:[0,-32] }),
  cocktail: L.icon({ iconUrl: "assets/icons/temp.png", iconSize, iconAnchor:[16,32], popupAnchor:[0,-32] }),
  ristorante:L.icon({ iconUrl: "assets/icons/temp.png", iconSize, iconAnchor:[16,32], popupAnchor:[0,-32] }),
  default:  L.icon({ iconUrl: "assets/icons/temp.png", iconSize, iconAnchor:[16,32], popupAnchor:[0,-32] }),
};

// ottenere icona in base alla tipologia
function getIconByType(tipologia) {
  if (!tipologia) return icons.default;
  const key = tipologia.toLowerCase().trim();
  return icons[key] || icons.default;
}





// mostrare i dettagli nella sidebar
function showRestaurantDetails(restaurant) {
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