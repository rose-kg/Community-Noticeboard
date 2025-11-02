
const adminAuthenticated = localStorage.getItem("adminAuthenticated");
if (!adminAuthenticated) {
  window.location.href = "admin-login.html";
}


const announcementsList = document.getElementById("announcements-list");
const createForm = document.getElementById("create-form");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const categoryInput = document.getElementById("category");
const successMessage = document.getElementById("success-message");
const errorMessage = document.getElementById("error-message");
const logoutBtn = document.getElementById("logout-btn");

let announcements = [];
let editingId = null;
let editForm = { title: "", content: "", category: "General" };


const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.ADMIN_PASSWORD || 'admin123'}`
  };
}

function showSuccess(msg) {
  successMessage.textContent = msg;
  successMessage.style.display = "block";
  setTimeout(() => (successMessage.style.display = "none"), 3000);
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.display = "block";
  setTimeout(() => (errorMessage.style.display = "none"), 3000);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


function renderAnnouncements() {
  announcementsList.innerHTML = "";
  if (announcements.length === 0) {
    announcementsList.innerHTML =
      '<p style="text-align:center;color:var(--color-neutral-700)">No announcements yet. Create your first one above!</p>';
    return;
  }
  announcements.forEach((a) => {
    const item = document.createElement("div");
    item.className = "announcement-item";
    if (editingId === a.id) {
      item.innerHTML = `
        <div class="edit-form">
          <div class="form-group">
            <label class="form-label">Title</label>
            <input type="text" class="form-input" value="${editForm.title}" id="edit-title" />
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-select" id="edit-category">
              <option value="General" ${editForm.category === "General" ? "selected" : ""}>General</option>
              <option value="Jobs" ${editForm.category === "Jobs" ? "selected" : ""}>Jobs</option>
              <option value="Events" ${editForm.category === "Events" ? "selected" : ""}>Events</option>
              <option value="Alerts" ${editForm.category === "Alerts" ? "selected" : ""}>Alerts</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Content</label>
            <textarea class="form-textarea" id="edit-content">${editForm.content}</textarea>
          </div>
          <div style="display:flex;gap:var(--spacing-sm)">
            <button class="action-button save-button" onclick="saveEdit('${a.id}')">Save Changes</button>
            <button class="action-button cancel-button" onclick="cancelEdit()">Cancel</button>
          </div>
        </div>
      `;
    } else {
      item.innerHTML = `
        <div class="announcement-item-header">
          <h3 class="announcement-item-title">${a.title}</h3>
          <div class="announcement-item-actions">
            <button class="action-button edit-button" onclick="editAnnouncement('${a.id}')">Edit</button>
            <button class="action-button delete-button" onclick="deleteAnnouncement('${a.id}')">Delete</button>
          </div>
        </div>
        <p class="announcement-item-content">${a.content}</p>
        <div class="announcement-item-footer">
          <span class="category-badge ${a.category.toLowerCase()}">${a.category}</span>
          <span>Posted ${formatDate(a.createdAt)}</span>
        </div>
      `;
    }
    announcementsList.appendChild(item);
  });
}


window.editAnnouncement = function (id) {
  const a = announcements.find((x) => x.id == id);
  editingId = id;
  editForm = { title: a.title, content: a.content, category: a.category };
  renderAnnouncements();
  setTimeout(() => {
    document.getElementById("edit-title").oninput = (e) => (editForm.title = e.target.value);
    document.getElementById("edit-content").oninput = (e) => (editForm.content = e.target.value);
    document.getElementById("edit-category").onchange = (e) => (editForm.category = e.target.value);
  }, 0);
};


window.cancelEdit = function () {
  editingId = null;
  editForm = { title: "", content: "", category: "General" };
  renderAnnouncements();
};


window.saveEdit = async function (id) {
  try {
    const response = await fetch(`${API_BASE}/api/announcements/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(editForm),
    });
    if (!response.ok) throw new Error('Failed to update');
    editingId = null;
    showSuccess("Announcement updated successfully!");
    await fetchAnnouncements();
  } catch (e) {
    showError("Failed to update announcement");
  }
};


window.deleteAnnouncement = async function (id) {
  if (!confirm("Are you sure you want to delete this announcement?")) return;
  try {
    const response = await fetch(`${API_BASE}/api/announcements/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete');
    showSuccess("Announcement deleted successfully!");
    await fetchAnnouncements();
  } catch (e) {
    showError("Failed to delete announcement");
  }
};


createForm.onsubmit = async function (e) {
  e.preventDefault();
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const category = categoryInput.value;
  if (!title || !content) {
    showError("Title and content are required.");
    return;
  }
  try {
    const response = await fetch(`${API_BASE}/api/announcements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, content, category }),
    });
    if (!response.ok) throw new Error('Failed to create');
    showSuccess("Announcement created successfully!");
    createForm.reset();
    await fetchAnnouncements();
  } catch (e) {
    showError("Failed to create announcement");
  }
};


logoutBtn.onclick = function () {
  localStorage.removeItem("adminAuthenticated");
  window.location.href = "admin-login.html";
};


async function fetchAnnouncements() {
  try {
    const response = await fetch(`${API_BASE}/api/announcements`);
    if (!response.ok) throw new Error('Failed to fetch');
    announcements = await response.json();
  } catch (e) {
    announcements = [];
  }
  renderAnnouncements();
}

fetchAnnouncements();
