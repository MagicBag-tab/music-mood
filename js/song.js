const MOOD_COLORS = {
  happy:     { bg: '#2d4a1e', color: '#7ed957', label: 'Happy'     },
  sad:       { bg: '#1a2a4a', color: '#5b8dee', label: 'Sad'       },
  energetic: { bg: '#4a2a1a', color: '#f97316', label: 'Energetic' },
  calm:      { bg: '#1a3a3a', color: '#2dd4bf', label: 'Calm'      },
  angry:     { bg: '#4a1a1a', color: '#ef4444', label: 'Angry'     },
  relaxed:   { bg: '#2d1a4a', color: '#a78bfa', label: 'Relaxed'   },
};

let songID       = null;
let selectedStar = 0;
let artistName   = '';
let albumTitle   = '';

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  songID = parseInt(params.get('id'));
  if (!songID) { window.location.href = 'index.html'; return; }

  await loadSong();
  await loadRatings();
  setupStars();
});

async function loadSong() {
  try {
    const song = await api.getSong(songID);
    if (song.error) { window.location.href = 'index.html'; return; }

    try {
      const artist = await fetch(`${API_URL}/artists/${song.artist_id}`).then(r => r.json());
      artistName = artist.name || `Artist #${song.artist_id}`;
    } catch { artistName = `Artist #${song.artist_id}`; }

    if (song.album_id) {
      try {
        const album = await fetch(`${API_URL}/albums/${song.album_id}`).then(r => r.json());
        albumTitle = album.title || '';
      } catch { albumTitle = ''; }
    }

    renderHero(song);
    renderInfo(song);

    document.getElementById('song-actions').hidden = false;
    document.getElementById('song-body').hidden    = false;

    document.getElementById('btn-edit').onclick = () => {
      window.location.href = `create.html?id=${songID}`;
    };

    document.getElementById('btn-delete').onclick = () => deleteSong(song.title);

    document.getElementById('file-input').addEventListener('change', uploadCover);

  } catch (err) {
    showToast('Could not load song', 'error');
  }
}

function renderHero(song) {
  const mood  = MOOD_COLORS[song.mood] || { bg: '#333', color: '#fff', label: song.mood };
  const cover = song.image_path
    ? `<img src="${API_URL}${song.image_path}" alt="${song.title}"
         onerror="this.src='assets/placeholder.jpg'">`
    : `<img src="assets/placeholder.jpg" alt="${song.title}">`;

  document.getElementById('song-hero').innerHTML = `
    <div class="song-detail-cover" style="background:${mood.bg}">${cover}</div>
    <div class="song-detail-info">
      <span class="mood-badge" style="background:${mood.bg};color:${mood.color};margin-bottom:12px;display:inline-flex">
        ${mood.label}
      </span>
      <h1>${song.title}</h1>
      <p style="font-size:1.1rem;color:var(--text-muted);margin-top:8px">${artistName}</p>
      ${albumTitle ? `<p style="color:var(--text-muted);font-size:0.9rem">${albumTitle}</p>` : ''}
      <p style="color:var(--text-muted);font-size:0.85rem;margin-top:8px">
        Added ${new Date(song.created_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}
      </p>
    </div>`;
}

function renderInfo(song) {
  const rows = [
    { label: 'Source',     value: song.source.charAt(0).toUpperCase() + song.source.slice(1) },
    { label: 'Mood',       value: MOOD_COLORS[song.mood]?.label || song.mood },
    { label: 'Artist',     value: artistName },
    { label: 'Album',      value: albumTitle || '—' },
    { label: 'Last updated', value: new Date(song.updated_at).toLocaleDateString('en-US') },
  ];

  document.getElementById('song-info').innerHTML = rows.map(r => `
    <div style="display:flex;justify-content:space-between;align-items:center;
      border-bottom:1px solid var(--surface-3);padding-bottom:12px">
      <span style="color:var(--text-muted);font-size:0.85rem;font-weight:600;
        text-transform:uppercase;letter-spacing:0.5px">${r.label}</span>
      <span style="font-weight:500">${r.value}</span>
    </div>`).join('');
}

async function loadRatings() {
  try {
    const data = await api.getRatings(songID);
    const ratings = data.ratings || [];
    const avg     = data.average || 0;
    const total   = data.total   || 0;

    document.getElementById('avg-score').textContent =
      total > 0 ? avg.toFixed(1) : '—';
    document.getElementById('rating-count').textContent =
      total > 0 ? `${total} rating${total !== 1 ? 's' : ''}` : 'No ratings yet';
    document.getElementById('avg-stars').innerHTML = renderStars(Math.round(avg));

    if (ratings.length === 0) {
      document.getElementById('ratings-list').innerHTML = `
        <p style="color:var(--text-muted);font-size:0.9rem;text-align:center;padding:20px">
          No ratings yet. Be the first!
        </p>`;
      return;
    }

    document.getElementById('ratings-list').innerHTML = ratings.map(r => `
      <div class="rating-item">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div style="display:flex;gap:2px">${renderStars(r.score)}</div>
          <span style="font-size:0.75rem;color:var(--text-muted)">
            ${new Date(r.created_at).toLocaleDateString('en-US')}
          </span>
        </div>
        ${r.comment ? `<p style="font-size:0.88rem;color:var(--text-muted)">${r.comment}</p>` : ''}
      </div>`).join('');
  } catch {
    showToast('Could not load ratings', 'error');
  }
}

function renderStars(score) {
  return Array(5).fill(0).map((_, i) =>
    `<span style="color:${i < score ? '#f59e0b' : 'var(--surface-3)'}; font-size:1.1rem">&#9733;</span>`
  ).join('');
}

function setupStars() {
  const stars = document.querySelectorAll('#input-stars .star');

  stars.forEach(star => {
    star.addEventListener('mouseenter', () => highlightStars(+star.dataset.value));
    star.addEventListener('mouseleave', () => highlightStars(selectedStar));
    star.addEventListener('click',      () => {
      selectedStar = +star.dataset.value;
      highlightStars(selectedStar);
    });
  });

  document.getElementById('btn-rate').addEventListener('click', submitRating);
}

function highlightStars(value) {
  document.querySelectorAll('#input-stars .star').forEach((s, i) => {
    s.style.color = i < value ? '#f59e0b' : 'var(--surface-3)';
  });
}

async function submitRating() {
  if (!selectedStar) { showToast('Please select a star rating', 'error'); return; }

  const comment = document.getElementById('rating-comment').value.trim();
  try {
    await api.createRating(songID, { score: selectedStar, comment });
    showToast('Rating submitted!');
    selectedStar = 0;
    highlightStars(0);
    document.getElementById('rating-comment').value = '';
    await loadRatings();
  } catch {
    showToast('Could not submit rating', 'error');
  }
}

async function uploadCover(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    showToast('Uploading...');
    const res = await api.uploadImage(songID, file);
    if (res.image_path) {
      showToast('Cover updated!');
      await loadSong();
    } else {
      showToast(res.error || 'Upload failed', 'error');
    }
  } catch {
    showToast('Upload failed', 'error');
  }
}

async function deleteSong(title) {
  if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
  try {
    await api.deleteSong(songID);
    showToast('Song deleted');
    setTimeout(() => window.location.href = 'index.html', 1000);
  } catch {
    showToast('Could not delete song', 'error');
  }
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className   = `toast show ${type === 'error' ? 'error' : ''}`;
  setTimeout(() => toast.className = 'toast', 3000);
}