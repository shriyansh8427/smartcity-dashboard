let map;
window.onload = () => {
  const t = localStorage.getItem("theme") || "light";
  applyTheme(t);
  document.getElementById("themeSwitcher").value = t;
  renderAQIChart();
  startTupleAnimation();
  startLiveTraffic();
  renderTrafficGraph();
  initMap();
  simulateAIAnalysis();
  updateClock();
  setInterval(updateClock, 1000);
};

function changeTheme(v) {
  applyTheme(v);
  localStorage.setItem("theme", v);
}
function applyTheme(m) {
  document.body.classList.toggle("dark", m === "dark");
}

function updateClock() {
  const now = new Date();
  document.getElementById("datetime").textContent = now.toLocaleString();
}

function startTupleAnimation() {
  const c = document.getElementById("tupleData");
  setInterval(() => {
    const txt = `🚦 Vehicle ${(Math.random() * 1000).toFixed(2)}, AQI ${Math.floor(Math.random() * 300)}`;
    const d = document.createElement("div");
    d.textContent = txt;
    c.prepend(d);
    if (c.children.length > 10) c.removeChild(c.lastChild);
  }, 1000);
}

function renderAQIChart() {
  const ctx = document.getElementById("aqiChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["6 AM", "9 AM", "12 PM", "3 PM", "6 PM"],
      datasets: [
        {
          label: "AQI Levels",
          data: [120, 200, 160, 180, 140],
          borderColor: "red",
          tension: 0.4,
          fill: false,
        },
      ],
    },
    options: { scales: { y: { beginAtZero: true } } },
  });
}

let trafficHistory = [];
function startLiveTraffic() {
  const roads = [
    "Ring Road",
    "MG Road",
    "Outer Circle",
    "NH-24",
    "Airport Expressway",
  ];
  setInterval(() => {
    const cards = document.getElementById("trafficCards");
    cards.innerHTML = "";
    const levels = ["low", "medium", "high"];
    const values = [];
    roads.forEach((r) => {
      const lvl = levels[Math.floor(Math.random() * 3)];
      const emoji = lvl === "low" ? "🟢" : lvl === "medium" ? "🟡" : "🔴";
      values.push(["low", "medium", "high"].indexOf(lvl));
      const card = document.createElement("div");
      card.className = `card ${lvl}`;
      card.innerHTML = `🛣️ <strong>${r}</strong><br>${emoji.toUpperCase()} ${lvl}`;
      cards.append(card);
    });
    trafficHistory.push(values.reduce((a, b) => a + b) / values.length);
    if (trafficHistory.length > 10) trafficHistory.shift();
    updateTrafficGraph();
  }, 3000);
}

let trafficChart;
function renderTrafficGraph() {
  const ctx = document.getElementById("trafficGraph").getContext("2d");
  trafficChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Avg Congestion",
          data: [],
          borderColor: "blue",
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 2,
          ticks: {
            stepSize: 1,
            callback: (v) => ["Low", "Med", "High"][v],
          },
        },
      },
    },
  });
}

function updateTrafficGraph() {
  const c = trafficChart;
  const l = trafficHistory.length;
  c.data.labels = Array.from({ length: l }, (_, i) => `${i * 3}s`);
  c.data.datasets[0].data = trafficHistory;
  c.update();
}

function initMap() {
  const iframe = document.createElement("iframe");
  iframe.src =
    "https://maps.google.com/maps?q=Delhi&t=&z=13&ie=UTF8&iwloc=&output=embed";
  iframe.width = "100%";
  iframe.height = "300";
  iframe.style.border = "0";
  document.getElementById("map").innerHTML = "";
  document.getElementById("map").appendChild(iframe);
}

function exportToCSV() {
  const arr = Array.from(document.querySelectorAll("#tupleData div")).map(
    (d) => d.textContent,
  );
  const blob = new Blob([arr.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data.csv";
  a.click();
}

function simulateAIAnalysis() {
  console.log(
    "[AI Pattern] Tuple trend detected: peak traffic correlates with AQI > 180",
  );
}
