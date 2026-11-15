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

// Sample food banks (later this will come from the backend)
const ngos = [
  { name: "Robin Hood Army, Delhi",  capacity: 300,  area: "Central Delhi" },
  { name: "Feeding India, Gurugram", capacity: 600,  area: "Gurugram" },
  { name: "Goonj Food Bank, Noida",  capacity: 1000, area: "Noida" },
  { name: "Akshaya Patra, Vasant Kunj", capacity: 2000, area: "South Delhi" }
];

// Pseudo distance from the pickup text, so the same location always gives the same km
function fakeKm(text, seed) {
  let h = seed;
  for (const c of text.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) % 997;
  return Math.round((3 + (h % 180) / 10) * 10) / 10; // 3.0 to 21.0 km
}

function findMatch(crop, kg, loc) {
  const batch = batches.find(b => b.crop.toLowerCase() === crop.toLowerCase());
  const risk = batch ? batch.risk : 50;

  // Only NGOs that can take the full quantity; if none can, use the biggest one
  let options = ngos.filter(n => n.capacity >= kg);
  if (!options.length) options = [ngos.reduce((a, b) => (b.capacity > a.capacity ? b : a))];

  const ranked = options
    .map((n, i) => ({ ...n, km: fakeKm(loc, i + 7) }))
    .sort((a, b) => a.km - b.km);

  const best = ranked[0];
  const eta = Math.round(best.km * 3.5 + 10); // minutes
  const slot = risk >= 70 ? "Today, within 1 hour (urgent)"
             : risk >= 40 ? "Today, within 4 hours"
             : "Tomorrow, any time";
  return { best, eta, slot, partial: kg > best.capacity };
}

document.getElementById("form").addEventListener("submit", e => {
  e.preventDefault();
  const crop = document.getElementById("crop").value.trim();
  const kg   = Number(document.getElementById("qty").value);
  const loc  = document.getElementById("loc").value.trim();

  // Later: fetch("/api/match", { method: "POST", body: JSON.stringify({ crop, kg, loc }) })
  const m = findMatch(crop, kg, loc);
  document.getElementById("rNgo").textContent = m.best.name;
  document.getElementById("rDist").textContent =
    `Distance: ${m.best.km} km · ETA ${m.eta} min · Capacity ${m.best.capacity} kg`;
  document.getElementById("rSlot").textContent =
    `Pickup: ${m.slot}` + (m.partial ? " · Partial pickup only, split the rest" : "");
  show("result");
});

// Online / offline indicator
function net() {
  document.getElementById("net").textContent = navigator.onLine ? "Online" : "Offline mode";
}
window.addEventListener("online", net);
window.addEventListener("offline", net);

renderCards();