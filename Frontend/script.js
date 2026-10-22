// Sample data (later this will come from the backend)
const batches = [
  { id: "B-101", crop: "Tomatoes", kg: 120, loc: "Azadpur Mandi",      temp: 31, hum: 62, risk: 82, left: "8 hrs" },
  { id: "B-102", crop: "Spinach",  kg: 45,  loc: "Ghazipur Mandi",     temp: 24, hum: 88, risk: 55, left: "1.5 days" },
  { id: "B-103", crop: "Potatoes", kg: 800, loc: "Sonipat Cold Store", temp: 8,  hum: 90, risk: 12, left: "60 days" },
  { id: "B-104", crop: "Bananas",  kg: 200, loc: "Okhla Mandi",        temp: 29, hum: 70, risk: 71, left: "2 days" }
];

function level(r) { return r >= 70 ? "high" : r >= 40 ? "medium" : ""; }
function label(r) { return r >= 70 ? "High risk" : r >= 40 ? "Watch" : "Safe"; }

function renderCards() {
  document.getElementById("cards").innerHTML = batches.map(b => `
    <div class="card ${level(b.risk)}">
      <span class="badge">${label(b.risk)}</span>
      <h3>${b.crop}</h3>
      <p class="muted">${b.id} · ${b.kg} kg · ${b.loc}</p>
      <div class="bar"><div style="width:${b.risk}%"></div></div>
      <div class="small"><span>Spoilage risk ${b.risk}%</span><span>${b.left} left</span></div>
      <div class="small"><span>🌡 ${b.temp}°C</span><span>💧 ${b.hum}%</span></div>
      <button class="btn" onclick="declare('${b.id}')">Declare surplus</button>
    </div>`).join("");
}

function show(name) {
  ["dash", "declare", "result"].forEach(id =>
    document.getElementById(id).classList.toggle("hidden", id !== name));
  document.getElementById("tabDash").classList.toggle("active", name === "dash");
  document.getElementById("tabDeclare").classList.toggle("active", name === "declare");
}

function declare(id) {
  const b = batches.find(x => x.id === id);
  document.getElementById("crop").value = b.crop;
  document.getElementById("qty").value = b.kg;
  document.getElementById("loc").value = b.loc;
  show("declare");
}

document.getElementById("form").addEventListener("submit", e => {
  e.preventDefault();
  // Fake match. Later: fetch("/api/match", { method: "POST", body: JSON.stringify({...}) })
  document.getElementById("rNgo").textContent = "Robin Hood Army, Delhi";
  document.getElementById("rDist").textContent = "Distance: 6.2 km · ETA 25 min";
  document.getElementById("rSlot").textContent = "Pickup: Today, within 1 hour";
  show("result");
});

// Online / offline indicator
function net() {
  document.getElementById("net").textContent = navigator.onLine ? "Online" : "Offline mode";
}
window.addEventListener("online", net);
window.addEventListener("offline", net);

renderCards();