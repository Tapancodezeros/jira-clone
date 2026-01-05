// small utility helpers
export function debounce(fn, wait = 300) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

export function noop() { }

export function parseTime(str) {
  if (!str) return 0;
  if (typeof str === 'number') return str;
  const s = str.toString().toLowerCase().replace(/\s/g, '');
  let totalMinutes = 0;

  const regex = /(\d+(?:\.\d+)?)([wdhm]?)/g;
  let match;

  while ((match = regex.exec(s)) !== null) {
    const val = parseFloat(match[1]);
    const unit = match[2] || 'm'; // default to minutes if no unit

    switch (unit) {
      case 'w': totalMinutes += val * 5 * 8 * 60; break; // 1 week = 5 days
      case 'd': totalMinutes += val * 8 * 60; break;     // 1 day = 8 hours
      case 'h': totalMinutes += val * 60; break;
      case 'm': totalMinutes += val; break;
      default: totalMinutes += val;
    }
  }
  return Math.round(totalMinutes);
}

export function formatTime(minutes) {
  if (!minutes) return '';
  minutes = parseInt(minutes);
  const w = Math.floor(minutes / (5 * 8 * 60));
  minutes %= 5 * 8 * 60;
  const d = Math.floor(minutes / (8 * 60));
  minutes %= 8 * 60;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  let str = '';
  if (w > 0) str += `${w}w `;
  if (d > 0) str += `${d}d `;
  if (h > 0) str += `${h}h `;
  if (m > 0 || str === '') str += `${m}m`;

  return str.trim();
}
