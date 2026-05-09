let songID      = null;
let pendingFile = null;
let allAlbums   = [];

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  songID = params.get('id') ? parseInt(params.get('id')) : null;

  if (songID) {
    document.getElementById('page-title').textContent = 'Edit Song';
    document.title = 'Edit Song — MoodTracker';
  }

  await loadArtists();
  await loadAlbums();

  if (songID) await prefillForm();

  setupListeners();
});

async function loadArtists() {
  try {
    const artists = await api.getArtists();
    const select  = document.getElementById('artist-id');
    artists.forEach(a => {
      const opt = document.createElement('option');
      opt.value       = a.id;
      opt.textContent = a.name;
      select.appendChild(opt);
    });
  } catch {
    showToast('Could not load artists', 'error');
  }
}

async function loadAlbums() {
  try {
    allAlbums = await api.getAlbums();
    populateAlbums();

    document.getElementById('artist-id').addEventListener('change', populateAlbums);
  } catch {
    showToast('Could not load albums', 'error');
  }
}

function populateAlbums() {
  const artistID = parseInt(document.getElementById('artist-id').value);
  const select   = document.getElementById('album-id');
  const current  = select.value;

  select.innerHTML = '<option value="">No album</option>';

  const filtered = artistID
    ? allAlbums.filter(a => a.artist_id === artistID)
    : allAlbums;

  filtered.forEach(a => {
    const opt = document.createElement('option');
    opt.value       = a.id;
    opt.textContent = a.title;
    select.appendChild(opt);
  });

  if (current) select.value = current;
}

async function prefillForm() {
  try {
    const song = await api.getSong(songID);
    if (song.error) { window.location.href = 'index.html'; return; }

    document.getElementById('title').value      = song.title;
    document.getElementById('mood').value       = song.mood;
    document.getElementById('source').value     = song.source;
    document.getElementById('artist-id').value  = song.artist_id;

    populateAlbums();
    if (song.album_id) document.getElementById('album-id').value = song.album_id;

    if (song.image_path) {
      document.getElementById('image-preview').src =
        `${API_URL}${song.image_path}`;
    }
  } catch {
    showToast('Could not load song data', 'error');
  }
}

function setupListeners() {
  document.getElementById('btn-submit').addEventListener('click', handleSubmit);

  const uploadArea = document.getElementById('upload-area');
  const fileInput  = document.getElementById('file-input');
  const preview    = document.getElementById('image-preview');

  uploadArea.addEventListener('click', () => fileInput.click());

  uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
  uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  });

  fileInput.addEventListener('change', e => {
    if (e.target.files[0]) handleFileSelect(e.target.files[0]);
  });
}

function handleFileSelect(file) {
  if (file.size > 1024 * 1024) {
    showToast('Image must be under 1MB', 'error');
    return;
  }
  pendingFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('image-preview').src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function handleSubmit() {
  const title    = document.getElementById('title').value.trim();
  const artistID = parseInt(document.getElementById('artist-id').value);
  const mood     = document.getElementById('mood').value;
  const source   = document.getElementById('source').value;

  if (!title)    { showToast('Title is required', 'error');    return; }
  if (!artistID) { showToast('Artist is required', 'error');   return; }
  if (!mood)     { showToast('Mood is required', 'error');     return; }

  const albumVal = document.getElementById('album-id').value;
  const payload  = {
    title,
    artist_id:  artistID,
    album_id:   albumVal ? parseInt(albumVal) : null,
    mood,
    source,
  };

  const btn = document.getElementById('btn-submit');
  btn.disabled     = true;
  btn.textContent  = 'Saving...';

  try {
    let saved;
    if (songID) {
      saved = await api.updateSong(songID, payload);
    } else {
      saved = await api.createSong(payload);
    }

    if (saved.error) {
      showToast(saved.error, 'error');
      btn.disabled    = false;
      btn.textContent = 'Save Song';
      return;
    }

    if (pendingFile) {
      try {
        await api.uploadImage(saved.id, pendingFile);
      } catch {
        showToast('Song saved but image upload failed', 'error');
      }
    }

    showToast(songID ? 'Song updated!' : 'Song created!');
    setTimeout(() => window.location.href = `song.html?id=${saved.id}`, 1000);

  } catch (err) {
    showToast('Could not save song', 'error');
    btn.disabled    = false;
    btn.textContent = 'Save Song';
  }
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className   = `toast show ${type === 'error' ? 'error' : ''}`;
  setTimeout(() => toast.className = 'toast', 3000);
}