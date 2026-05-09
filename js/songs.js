const MOOD_COLORS = {
  happy:     { bg: '#2d4a1e', color: '#7ed957', label: 'Happy'     },
  sad:       { bg: '#1a2a4a', color: '#5b8dee', label: 'Sad'       },
  energetic: { bg: '#4a2a1a', color: '#f97316', label: 'Energetic' },
  calm:      { bg: '#1a3a3a', color: '#2dd4bf', label: 'Calm'      },
  angry:     { bg: '#4a1a1a', color: '#ef4444', label: 'Angry'     },
  relaxed:   { bg: '#2d1a4a', color: '#a78bfa', label: 'Relaxed'   },
};

let currentPage  = 1;
const LIMIT      = 12;
let searchTimeout = null;
let totalSongs   = 0;

document.addEventListener('DOMContentLoaded', () => {
  loadSongs();
  setupListeners();
});

function setupListeners() {
  document.getElementById('search').addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { currentPage = 1; loadSongs(); }, 400);
  });
  document.getElementById('mood-filter').addEventListener('change',  () => { currentPage = 1; loadSongs(); });
  document.getElementById('sort-filter').addEventListener('change',  loadSongs);
  document.getElementById('order-filter').addEventListener('change', loadSongs);
}

async function loadSongs() {
  const grid = document.getElementById('songs-grid');
  grid.innerHTML = renderSkeletons(12);

  const params = {
    page:  currentPage,
    limit: LIMIT,
    q:     document.getElementById('search').value,
    mood:  document.getElementById('mood-filter').value,
    sort:  document.getElementById('sort-filter').value,
    order: document.getElementById('order-filter').value,
  };
  Object.keys(params).forEach(k => !params[k] && delete params[k]);

  try {
    const res   = await api.getSongs(params);
    const songs = res.data  || [];
    totalSongs  = res.total || 0;

    document.getElementById('total-count').textContent =
      `${totalSongs} song${totalSongs !== 1 ? 's' : ''}`;

    if (songs.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--surface-3)">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <h3>No songs found</h3>
          <p>Try a different search or add a new song</p>
        </div>`;
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    grid.innerHTML = songs.map(renderSongCard).join('');
    renderPagination(totalSongs);
  } catch (err) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <h3>Could not load songs</h3>
        <p>Make sure the backend is running and accessible</p>
      </div>`;
  }
}

function renderSongCard(song) {
  const mood  = MOOD_COLORS[song.mood] || { bg: '#333', color: '#fff', label: song.mood };
  const cover = song.image_path
    ? `<img src="${API_URL}${song.image_path}" alt="${song.title}"
         onerror="this.src='assets/placeholder.jpg'">`
    : `<img src="assets/placeholder.jpg" alt="${song.title}">`;

  return `
    <div class="song-card" onclick="window.location.href='song.html?id=${song.id}'">
      <div class="song-card-image" style="background:${mood.bg}">${cover}</div>
      <div class="song-card-title">${song.title}</div>
      <div class="song-card-artist">${song.artist_name || `Artist #${song.artist_id}`}</div>
      <span class="mood-badge" style="background:${mood.bg};color:${mood.color}">
        ${mood.label}
      </span>
      <div class="song-card-play">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#000">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </div>`;
}

function renderSkeletons(n) {
  return Array(n).fill(`
    <div class="song-card">
      <div class="song-card-image skeleton" style="height:180px"></div>
      <div class="skeleton" style="height:16px;margin:12px 0 8px;border-radius:4px"></div>
      <div class="skeleton" style="height:12px;width:60%;border-radius:4px"></div>
    </div>`).join('');
}

function renderPagination(total) {
  const totalPages = Math.ceil(total / LIMIT);
  const container  = document.getElementById('pagination');
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = `
    <button class="page-btn" onclick="goToPage(${currentPage - 1})"
      ${currentPage === 1 ? 'disabled style="opacity:0.3;cursor:default"' : ''}>&#8249;</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}"
        onclick="goToPage(${i})">${i}</button>`;
    } else if (Math.abs(i - currentPage) === 2) {
      html += `<span class="page-info">…</span>`;
    }
  }

  html += `
    <button class="page-btn" onclick="goToPage(${currentPage + 1})"
      ${currentPage === totalPages ? 'disabled style="opacity:0.3;cursor:default"' : ''}>&#8250;</button>
    <span class="page-info">${currentPage} of ${totalPages}</span>`;

  container.innerHTML = html;
}

function goToPage(page) {
  const totalPages = Math.ceil(totalSongs / LIMIT);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  loadSongs();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className   = `toast show ${type === 'error' ? 'error' : ''}`;
  setTimeout(() => toast.className = 'toast', 3000);
}