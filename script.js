let tuples = [];

// Add a new tuple to the dashboard
function addTuple() {
  const location = document.getElementById("location").value;
  const AQI = parseInt(document.getElementById("aqi").value);
  const traffic = document.getElementById("traffic").value;

  if (!location || isNaN(AQI) || !traffic) return;

  const tuple = { location, AQI, traffic };
  tuples.push(tuple);

  updateTable();
  updateChart();
  updateMap();
  updateAI();
}

// Delete a tuple by index
function deleteTuple(index) {
  tuples.splice(index, 1);
  updateTable();
  updateChart();
  updateMap();
  updateAI();
}

// Update the table UI
function updateTable() {
  const body = document.getElementById("tupleBody");
  body.innerHTML = "";
  tuples.forEach((t, i) => {
    const row = `<tr>
      <td>${t.location}</td>
      <td>${t.AQI}</td>
      <td>${t.traffic}</td>
      <td><button onclick="deleteTuple(${i})">🗑️</button></td>
    </tr>`;
    body.innerHTML += row;
  });
  filterTable();
  updateAI();
}

// Upload tuples via CSV
function uploadCSV(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split("\n");
    lines.forEach(line => {
      const [location, AQI, traffic] = line.split(",");
      if (location && AQI && traffic) {
        tuples.push({ location, AQI: parseInt(AQI), traffic: traffic.trim() });
      }
    });
    updateTable();
    updateChart();
    updateMap();
    updateAI();
  };
  reader.readAsText(file);
}

// Search/filter by location name
function filterTable() {
  const search = document.getElementById("search").value.toLowerCase();
  const range = document.getElementById("aqiRange").value;
  const rows = document.querySelectorAll("#tupleBody tr");

  rows.forEach(row => {
    const loc = row.cells[0].innerText.toLowerCase();
    const aqi = parseInt(row.cells[1].innerText);
    const inSearch = loc.includes(search);
    const inRange = (range === "all") || (range === "good" && aqi <= 100) ||
                    (range === "moderate" && aqi > 100 && aqi <= 200) ||
                    (range === "poor" && aqi > 200);
    row.style.display = (inSearch && inRange) ? "" : "none";
  });
}

// Live AQI trend chart
let chart;
function updateChart() {
  const ctx = document.getElementById("aqiChart").getContext("2d");
  const labels = tuples.map(t => t.location);
  const data = tuples.map(t => t.AQI);

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "AQI",
        data: data,
        backgroundColor: data.map(aqi =>
          aqi > 300 ? "red" : aqi > 200 ? "orange" : aqi > 100 ? "yellow" : "green"
        )
      }]
    }
  });
}

// AI analysis function
function smartAIAnalysis() {
  let pollute = tuples.filter(t => t.AQI > 300).length;
  let jammed = tuples.filter(t => t.traffic === "Severe").length;
  let result = [];

  const isEmergency = (pollute >= 3 && jammed >= 3);

  if (isEmergency) {
    result.push("🚨 Emergency Mode Activated: Critical Levels!");
    document.getElementById("emergencyBanner").style.display = "block";
    highlightEmergencyRows();

    // Play beep sound
    new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=").play().catch(err => {
      console.log("Sound blocked by browser:", err);
    });
  } else {
    if (pollute >= 3) result.push("🔴 Pollution Spike Detected in Multiple Zones");
    if (jammed >= 3) result.push("🟠 Traffic Congestion in Multiple Areas");
    if (result.length === 0) result.push("🟢 All Zones Operating Normally");

    document.getElementById("emergencyBanner").style.display = "none";
    removeRowHighlights();
  }

  return result.join("<br>");
}

function updateAI() {
  document.getElementById("aiReport").innerHTML = smartAIAnalysis();
}

function highlightEmergencyRows() {
  const rows = document.querySelectorAll("#tupleBody tr");
  rows.forEach(row => {
    const AQI = parseInt(row.cells[1].innerText);
    const traffic = row.cells[2].innerText;
    if (AQI > 300 && traffic === "Severe") {
      row.style.background = "#ffcccc";
      row.style.fontWeight = "bold";
    }
  });
}

function removeRowHighlights() {
  const rows = document.querySelectorAll("#tupleBody tr");
  rows.forEach(row => {
    row.style.background = "";
    row.style.fontWeight = "";
  });
}

// Theme switching
// 🌗 Theme Switcher Logic
const themeSelect = document.getElementById("themeSelect");
const colorPicker = document.getElementById("customColorPicker");

themeSelect.addEventListener("change", () => {
  document.body.className = ""; // reset
  document.body.style.backgroundColor = ""; // reset

  const selected = themeSelect.value;
  if (selected === "default") {
    document.body.classList.add("default");
  } else if (selected === "dark") {
    document.body.classList.add("dark");
  } else if (selected === "light") {
    document.body.classList.add("light");
  }
});

colorPicker.addEventListener("input", () => {
  document.body.className = "custom-theme";
  document.body.style.backgroundColor = colorPicker.value;
});
;



// Dynamic map update
let map, markers = [];

function initMap() {
  map = L.map('map').setView([28.61, 77.23], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
}

function updateMap() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  tuples.forEach(t => {
    const lat = 20 + Math.random() * 10;
    const lng = 70 + Math.random() * 10;
    const marker = L.marker([lat, lng])
      .bindPopup(`${t.location}<br>AQI: ${t.AQI}<br>Traffic: ${t.traffic}`)
      .addTo(map);
    markers.push(marker);
  });
}
