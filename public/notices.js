const filters = ["All", "Jobs", "Events", "Alerts", "General"];
let announcements = [];
let activeFilter = "All";
let loading = true;

const filterButtonsDiv = document.getElementById("filter-buttons");
const grid = document.getElementById("announcements-grid");
const loadingDiv = document.getElementById("loading");
const emptyStateDiv = document.getElementById("empty-state");
const emptyStateText = document.getElementById("empty-state-text");

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function renderFilterButtons() {
  filterButtonsDiv.innerHTML = "";
  filters.forEach((filter) => {
    const btn = document.createElement("button");
    btn.className = "filter-button" + (activeFilter === filter ? " active" : "");
    btn.textContent = filter;
    btn.onclick = () => {
      activeFilter = filter;
      render();
    };
    filterButtonsDiv.appendChild(btn);
  });
}

function render() {
  renderFilterButtons();
  if (loading) {
    loadingDiv.style.display = "flex";
    grid.style.display = "none";
    emptyStateDiv.style.display = "none";
    return;
  }
  loadingDiv.style.display = "none";
  let filtered =
    activeFilter === "All"
      ? announcements
      : announcements.filter((a) => a.category === activeFilter);
  if (filtered.length === 0) {
    grid.style.display = "none";
    emptyStateDiv.style.display = "block";
    emptyStateText.textContent =
      activeFilter === "All"
        ? "There are no announcements at the moment. Check back later!"
        : `No announcements in the ${activeFilter} category.`;
    return;
  }
  emptyStateDiv.style.display = "none";
  grid.style.display = "grid";
  grid.innerHTML = "";
  filtered.forEach((a) => {
    const card = document.createElement("article");
    card.className = "announcement-card";
    card.innerHTML = `
      <div class="announcement-header">
        <h2 class="announcement-title">${a.title}</h2>
        <span class="category-badge ${a.category.toLowerCase()}">${a.category}</span>
      </div>
      <p class="announcement-content">${a.content}</p>
      <div class="announcement-footer">
        <span class="announcement-date">Posted ${formatDate(a.createdAt)}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function fetchAnnouncements() {
  loading = true;
  render();
  try {
    const response = await fetch('http://localhost:3001/api/announcements');
    if (!response.ok) throw new Error('Failed to fetch');
    announcements = await response.json();
  } catch (e) {
    announcements = [];
  }
  loading = false;
  render();
}

fetchAnnouncements();
