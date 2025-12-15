// inizializza la mappa centrata sull'Italia
let map = L.map('map').setView([41.8719, 12.5674], 6);

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