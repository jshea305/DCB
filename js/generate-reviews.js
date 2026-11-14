const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'data', 'testimonials.json');
const htmlPath = path.join(__dirname, '..', 'testimonials.html');

const rawData = fs.readFileSync(jsonPath, 'utf8');
const reviews = JSON.parse(rawData);

// Sort reviews by date (newest on top)
reviews.sort((a, b) => {
  const dateA = a.date ? new Date(a.date) : new Date(0);
  const dateB = b.date ? new Date(b.date) : new Date(0);
  const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
  const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
  return timeB - timeA;
});

function getInitials(author) {
  if (!author) return '★';
  const parts = author.split(/&|and|\s+/).filter(p => /^[a-zA-Z]/.test(p));
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return author.slice(0, 2).toUpperCase();
}

const htmlCards = reviews.map(review => {
  const initials = getInitials(review.author);
  const stars = '★★★★★';

  const ownerResponseHtml = review.reply ? `
      <div class="owner-response">
        <strong>Response from Down City Band:</strong>
        "${review.reply}"
      </div>
  ` : '';

  return `
    <article class="review-card-text">
      <div>
        <div class="review-header">
          <div class="author-info">
            <div class="avatar">${initials}</div>
            <div class="author-details">
              <h3>${review.author}</h3>
              <div class="review-stars">${stars}</div>
            </div>
          </div>
          <span class="source-badge">${review.date || ''}</span>
        </div>
        ${review.title ? `<h4 class="review-title">${review.title}</h4>` : ''}
        <p class="review-body">
          "${review.quote}"
        </p>
      </div>
      ${ownerResponseHtml}
    </article>
  `;
}).join('\n');

let pageHtml = fs.readFileSync(htmlPath, 'utf8');

// Flexible match targeting id="reviews-container" inside <main>
const containerRegex = /(<main[\s\S]*?id="reviews-container"[\s\S]*?>)([\s\S]*?)(<\/main>)/i;

if (containerRegex.test(pageHtml)) {
  pageHtml = pageHtml.replace(containerRegex, `$1\n${htmlCards}\n$3`);
  fs.writeFileSync(htmlPath, pageHtml, 'utf8');
  console.log('Successfully injected pre-rendered review cards into reviews.html!');
} else {
  console.error('ERROR: Could not find id="reviews-container" inside <main> in reviews.html');
  process.exit(1);
}
