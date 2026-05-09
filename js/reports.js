const MOOD_META = {
  happy:     { color: '#7ed957', bg: '#2d4a1e', label: 'Happy'     },
  sad:       { color: '#5b8dee', bg: '#1a2a4a', label: 'Sad'       },
  energetic: { color: '#f97316', bg: '#4a2a1a', label: 'Energetic' },
  calm:      { color: '#2dd4bf', bg: '#1a3a3a', label: 'Calm'      },
  angry:     { color: '#ef4444', bg: '#4a1a1a', label: 'Angry'     },
  relaxed:   { color: '#a78bfa', bg: '#2d1a4a', label: 'Relaxed'   },
};

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadMoodDistribution(), loadTopRated()]);
  await loadStats();
  document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
});

async function loadMoodDistribution() {
  try {
    const data = await api.getMoodDistribution();
    if (!Array.isArray(data) || data.length === 0) {
      document.getElementById('mood-chart').innerHTML =
        '<p style="color:var(--text-muted);text-align:center;padding:32px">No data yet</p>';
      return;
    }

    const max = Math.max(...data.map(d => d.count));

    const html = data.map(d => {
      const meta    = MOOD_META[d.mood] || { color: '#888', bg: '#333', label: d.mood };
      const pct     = max > 0 ? Math.round((d.count / max) * 100) : 0;

      return `
        <div class="chart-row">
          <div class="chart-label" style="color:${meta.color}">
            ${meta.label}
          </div>
          <div class="chart-bar-wrap">
            <div class="chart-bar" style="width:${pct}%;background:${meta.bg};color:${meta.color}">
              ${d.count}
            </div>
          </div>
          <div class="chart-count">${d.count}</div>
        </div>`;
    }).join('');

    document.getElementById('mood-chart').innerHTML = html;
  } catch {
    showToast('Could not load mood distribution', 'error');
  }
}

async function loadTopRated() {
  try {
    const data = await api.getTopRated(10);
    if (!Array.isArray(data) || data.length === 0) {
      document.getElementById('top-rated').innerHTML =
        '<p style="color:var(--text-muted);text-align:center;padding:32px">No ratings yet</p>';
      return;
    }

    const rankClass = i => i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const rankEmoji = i => `${i + 1}`;
    const stars     = avg => {
      const full = Math.round(avg);
      return Array(5).fill(0).map((_, i) =>
        `<span style="color:${i < full ? '#f59e0b' : 'var(--surface-3)'}">★</span>`
      ).join('');
    };

    document.getElementById('top-rated').innerHTML = data.map((song, i) => `
      <div class="top-card" onclick="window.location.href='song.html?id=${song.song_id}'">
        <div class="top-rank ${rankClass(i)}">${rankEmoji(i)}</div>
        <div class="top-info">
          <div class="top-title">${song.title}</div>
          <div class="top-artist">${song.artist_name}</div>
          <div style="margin-top:4px;font-size:1rem">${stars(song.average_rating)}</div>
        </div>
        <div class="top-score">
          ${song.average_rating.toFixed(1)}
          <span>/ 5</span><br>
          <span style="font-size:0.72rem">${song.ratings_count} rating${song.ratings_count !== 1 ? 's' : ''}</span>
        </div>
      </div>`).join('');

    if (data[0]) {
      document.getElementById('stat-top-score').textContent = data[0].average_rating.toFixed(1);
      const totalRatings = data.reduce((sum, s) => sum + s.ratings_count, 0);
      document.getElementById('stat-top-count').textContent = totalRatings;
    }
  } catch {
    showToast('Could not load top rated songs', 'error');
  }
}

async function loadStats() {
  try {
    const res = await api.getSongs({ page: 1, limit: 1 });
    const el = document.getElementById('stat-total');
    el.className = '';
    el.style = '';
    el.textContent = res.total ?? '?';
  } catch {
    document.getElementById('stat-total').textContent = '?';
  }
}

async function exportCSV() {
  const btn = document.getElementById('btn-export-csv');
  btn.disabled    = true;
  btn.textContent = 'Exporting…';

  try {
    const res   = await api.getSongs({ page: 1, limit: 1000 });
    const songs = res.data || [];

    if (songs.length === 0) {
      showToast('No songs to export', 'error');
      return;
    }

    const escape = val => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const headers = ['ID', 'Title', 'Artist', 'Mood', 'Source', 'Album ID', 'Created At'];

    const rows = songs.map(s => [
      s.id,
      s.title,
      s.artist_name || s.artist_id,
      s.mood,
      s.source,
      s.album_id ?? '',
      new Date(s.created_at).toLocaleDateString('en-US'),
    ]);

    const csvLines = [
      headers.map(escape).join(','),
      ...rows.map(row => row.map(escape).join(',')),
    ];
    const csvContent = csvLines.join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);

    const anchor    = document.createElement('a');
    anchor.href     = url;
    anchor.download = `moodtracker-songs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    showToast(`Exported ${songs.length} songs to CSV`);
  } catch (err) {
    showToast('Export failed', 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Export CSV';
  }
}


function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className   = `toast show ${type === 'error' ? 'error' : ''}`;
  setTimeout(() => (toast.className = 'toast'), 3000);
}