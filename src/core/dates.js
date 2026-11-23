/** Dates on the person's own calendar (local time). Kinpital runs in real time: a bill due on the 10th is due on the 10th. */

const DAY = 86400000;

/** @param {Date} d */
export function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** @param {Date} d @param {number} n */
export function addDays(d, n) {
  const x = startOfDay(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Whole calendar days from `from` to `to` (negative when `to` is earlier). Rounds, so a DST change does not shift it. */
export function daysBetween(from, to) {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY);
}

/** The next date (today included) that falls on `day` of the month; short months use their last day. */
export function nextMonthDay(now, day) {
  const today = startOfDay(now);
  for (let k = 0; k < 2; k++) {
    const y = today.getFullYear();
    const m = today.getMonth() + k;
    const last = new Date(y, m + 1, 0).getDate();
    const d = new Date(y, m, Math.min(day, last));
    if (d >= today) return d;
  }
  return today;
}

/** @param {number} days from today */
export function dueLabel(days) {
  if (days < 0) return `${-days} day${days === -1 ? '' : 's'} late`;
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

/** @param {Date} d e.g. "Dec 10" */
export function shortDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** @param {Date} d e.g. "Mon, Nov 23 · 6:40 PM" */
export function clockLine(d) {
  const day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${day} · ${time}`;
}
