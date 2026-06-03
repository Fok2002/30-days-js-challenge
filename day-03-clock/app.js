const clockTimeEl = document.getElementById('clockTime');
const clockDateEl = document.getElementById('clockDate');
const clockUptimeEl = document.getElementById('clockUptime');
const toggleBtn = document.getElementById('toggleFormat');

let useTwelveHour = true;
const startTimestamp = Date.now();

function pad(number) {
  return String(number).padStart(2, '0');
}

function formatClock(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  if (useTwelveHour) {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const twelveHour = hours % 12 || 12;
    return `${pad(twelveHour)}:${pad(minutes)}:${pad(seconds)} ${ampm}`;
  }

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function formatDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function formatUptime(elapsedMs) {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function updateClock() {
  const now = new Date();
  clockTimeEl.textContent = formatClock(now);
  clockDateEl.textContent = formatDate(now);
  clockUptimeEl.textContent = `Session duration: ${formatUptime(Date.now() - startTimestamp)}`;
}

function toggleFormat() {
  useTwelveHour = !useTwelveHour;
  toggleBtn.textContent = useTwelveHour ? 'Switch to 24-hour' : 'Switch to 12-hour';
  updateClock();
}

toggleBtn.addEventListener('click', toggleFormat);

updateClock();
setInterval(updateClock, 1000);
