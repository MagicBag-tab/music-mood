const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8009'
  : 'https://music-mood-api-1.onrender.com';

const api = {
  getSongs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_URL}/songs?${query}`).then(r => r.json());
  },
  getSong: (id) => fetch(`${API_URL}/songs/${id}`).then(r => r.json()),
  createSong: (data) => fetch(`${API_URL}/songs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  updateSong: (id, data) => fetch(`${API_URL}/songs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  deleteSong: (id) => fetch(`${API_URL}/songs/${id}`, {
    method: 'DELETE'
  }),
  uploadImage: (id, file) => {
    const form = new FormData();
    form.append('image', file);
    return fetch(`${API_URL}/songs/${id}/image`, {
      method: 'POST',
      body: form
    }).then(r => r.json());
  },

  getRatings: (songId) => fetch(`${API_URL}/songs/${songId}/rating`).then(r => r.json()),
  createRating: (songId, data) => fetch(`${API_URL}/songs/${songId}/rating`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  getArtists: () => fetch(`${API_URL}/artists`).then(r => r.json()),

  getAlbums: () => fetch(`${API_URL}/albums`).then(r => r.json()),

  getMoodDistribution: () => fetch(`${API_URL}/reports/moods`).then(r => r.json()),
  getTopRated: (limit = 5) => fetch(`${API_URL}/reports/top-rated?limit=${limit}`).then(r => r.json()),
};