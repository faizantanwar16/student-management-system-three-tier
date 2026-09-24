// ------------------------------------------------------------------
// CONFIG
// Replace this with your actual Render backend URL after deployment.
// Example: "https://student-api.onrender.com/api/students"
// ------------------------------------------------------------------
//const API_BASE_URL = "https://YOUR-RENDER-BACKEND-URL.onrender.com/api/students";
const API_BASE_URL_LOCAL = "http://localhost:5000/api/students"; // For local development
const API_BASE_URL = API_BASE_URL_LOCAL; // Change this to the Render URL in production
const API_BASE_URL_RENDER = "https://student-management-system-three-tier-1.onrender.com/api/students"; // Example Render URL
const API_BASE_URL_PROD = API_BASE_URL_RENDER; // Use this in production
const API_BASE_URL_FINAL = API_BASE_URL_PROD; // Final URL to use in production
const API_BASE_URL_ACTIVE = API_BASE_URL_FINAL; // Active URL for API calls
const API_BASE_URL_CURRENT = API_BASE_URL_ACTIVE; // Current URL for API calls
// DOM references
const form = document.getElementById("studentForm");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const editingIdInput = document.getElementById("editingId");
const formMessage = document.getElementById("formMessage");
const listMessage = document.getElementById("listMessage");
const tableBody = document.getElementById("studentsTableBody");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const refreshBtn = document.getElementById("refreshBtn");

const fields = {
  studentId: document.getElementById("studentId"),
  name: document.getElementById("name"),
  email: document.getElementById("email"),
  department: document.getElementById("department"),
  semester: document.getElementById("semester"),
  contact: document.getElementById("contact"),
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function showMessage(el, text, type) {
  el.textContent = text;
  el.className = `message ${type || ""}`;
  if (text) {
    setTimeout(() => {
      el.textContent = "";
      el.className = "message";
    }, 4000);
  }
}

function resetForm() {
  form.reset();
  editingIdInput.value = "";
  formTitle.textContent = "Add Student";
  submitBtn.textContent = "Add Student";
  cancelEditBtn.style.display = "none";
  fields.studentId.disabled = false;
}

function renderStudents(students) {
  tableBody.innerHTML = "";

  if (!students || students.length === 0) {
    tableBody.innerHTML = `<tr class="empty-row"><td colspan="7">No student records found.</td></tr>`;
    return;
  }

  students.forEach((s) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(s.studentId)}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.department)}</td>
      <td>${escapeHtml(String(s.semester))}</td>
      <td>${escapeHtml(s.contact || "-")}</td>
      <td class="actions-cell">
        <button class="btn btn-secondary btn-small" data-action="edit" data-id="${s.studentId}">Edit</button>
        <button class="btn btn-danger btn-small" data-action="delete" data-id="${s.studentId}">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ------------------------------------------------------------------
// API calls
// ------------------------------------------------------------------
async function fetchStudents(search) {
  try {
    const url = search ? `${API_BASE_URL}?search=${encodeURIComponent(search)}` : API_BASE_URL;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to load students");
    }

    renderStudents(data.data);
  } catch (err) {
    showMessage(listMessage, `Error: ${err.message}`, "error");
    renderStudents([]);
  }
}

async function createStudent(payload) {
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

async function updateStudent(id, payload) {
  const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

async function deleteStudent(id) {
  const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

async function getStudent(id) {
  const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`);
  return res.json().then((data) => ({ ok: res.ok, data }));
}

// ------------------------------------------------------------------
// Event handlers
// ------------------------------------------------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    studentId: fields.studentId.value.trim(),
    name: fields.name.value.trim(),
    email: fields.email.value.trim(),
    department: fields.department.value.trim(),
    semester: Number(fields.semester.value),
    contact: fields.contact.value.trim(),
  };

  const editingId = editingIdInput.value;
  submitBtn.disabled = true;

  try {
    let result;
    if (editingId) {
      result = await updateStudent(editingId, payload);
    } else {
      result = await createStudent(payload);
    }

    if (!result.ok || !result.data.success) {
      throw new Error(result.data.message || "Something went wrong");
    }

    showMessage(formMessage, result.data.message, "success");
    resetForm();
    fetchStudents();
  } catch (err) {
    showMessage(formMessage, `Error: ${err.message}`, "error");
  } finally {
    submitBtn.disabled = false;
  }
});

cancelEditBtn.addEventListener("click", resetForm);

tableBody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === "delete") {
    if (!confirm(`Delete student ${id}? This cannot be undone.`)) return;
    try {
      const result = await deleteStudent(id);
      if (!result.ok || !result.data.success) {
        throw new Error(result.data.message || "Delete failed");
      }
      showMessage(listMessage, result.data.message, "success");
      fetchStudents();
    } catch (err) {
      showMessage(listMessage, `Error: ${err.message}`, "error");
    }
  }

  if (action === "edit") {
    try {
      const result = await getStudent(id);
      if (!result.ok || !result.data.success) {
        throw new Error(result.data.message || "Could not load student");
      }
      const s = result.data.data;
      fields.studentId.value = s.studentId;
      fields.name.value = s.name;
      fields.email.value = s.email;
      fields.department.value = s.department;
      fields.semester.value = s.semester;
      fields.contact.value = s.contact || "";

      fields.studentId.disabled = true; // studentId is the lookup key, keep it fixed while editing
      editingIdInput.value = s.studentId;
      formTitle.textContent = `Edit Student: ${s.studentId}`;
      submitBtn.textContent = "Update Student";
      cancelEditBtn.style.display = "inline-block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      showMessage(listMessage, `Error: ${err.message}`, "error");
    }
  }
});

searchBtn.addEventListener("click", () => fetchStudents(searchInput.value.trim()));
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") fetchStudents(searchInput.value.trim());
});
refreshBtn.addEventListener("click", () => {
  searchInput.value = "";
  fetchStudents();
});

// Initial load
fetchStudents();
