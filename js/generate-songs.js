const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'data', 'songs.json');
const htmlPath = path.join(__dirname, '..', 'songs.html');

const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const songs = Array.isArray(rawData) ? rawData : (rawData.songs || []);

// Sort alphabetically by song title
songs.sort((a, b) => a.title.localeCompare(b.title));

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const cardsHtml = songs.map(song => {
  const category = song.category || 'Dance, Funk & R&B';
  const badgeLabel = category === 'Dinner, Cocktail & Slow' ? 'Cocktail / Slow' : 'Dance / Party';
  return `        <div class="song-item" data-category="${escapeHtml(category)}">
          <div class="song-info">
            <span class="song-title">${escapeHtml(song.title)}</span>
            <span class="song-artist">${escapeHtml(song.artist)}</span>
          </div>
          <span class="song-badge">${badgeLabel}</span>
        </div>`;
}).join('\n');

let html = fs.readFileSync(htmlPath, 'utf8');
const containerRegex = /(<div id="songs-container" class="songs-grid">)([\s\S]*?)(<\/div>\s*<!-- \/songs-container -->)/;

if (!containerRegex.test(html)) {
  throw new Error('Could not find #songs-container markers in songs.html');
}

html = html.replace(containerRegex, `$1\n${cardsHtml}\n      $3`);
fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`Pre-rendered ${songs.length} songs into songs.html`);
