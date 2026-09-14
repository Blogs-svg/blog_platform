// Barcha sahifalarda ishlaydigan umumiy funksiyalar

async function getSession() {
  const res = await fetch('/api/session');
  const data = await res.json();
  return data.user;
}

function renderNavbar(user) {
  const nav = document.getElementById('nav-links');
  if (!nav) return;

  if (user) {
    nav.innerHTML = `
      <a href="/dashboard.html">Mening postlarim</a>
      <span style="color: var(--text-muted);">Salom, <strong>${escapeHtml(user.username)}</strong></span>
      <button class="btn btn-outline" id="logout-btn">Chiqish</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', async () => {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/index.html';
    });
  } else {
    nav.innerHTML = `
      <a href="/login.html">Kirish</a>
      <a href="/register.html" class="btn btn-primary">Ro'yxatdan o'tish</a>
    `;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

function showAlert(elId, message, type = 'error') {
  const el = document.getElementById(elId);
  el.textContent = message;
  el.className = `alert alert-${type}`;
  el.style.display = 'block';
}

// Har bir sahifa yuklanganda navbarni yangilash
document.addEventListener('DOMContentLoaded', async () => {
  const user = await getSession();
  renderNavbar(user);
  window.__currentUser = user;
  document.dispatchEvent(new CustomEvent('session-ready', { detail: user }));
});
