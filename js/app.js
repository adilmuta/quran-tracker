// === PIN ===
let pinBuffer = '';
let pinMode = 'unlock'; // 'unlock', 'setup', 'change1', 'change2'
let newPinTemp = '';

function initPin() {
  const stored = localStorage.getItem('pin');
  if (!stored) {
    pinMode = 'setup';
    document.getElementById('pin-subtitle').textContent = 'Create a 4-digit PIN';
    document.getElementById('pin-setup-hint').textContent = 'First time setup';
  }
}
function pinInput(key) {
  if (key === 'del') { pinBuffer = pinBuffer.slice(0,-1); }
  else if (key === 'ok') { submitPin(); return; }
  else if (pinBuffer.length < 4) { pinBuffer += key; }
  updateDots();
  if (pinBuffer.length === 4) setTimeout(submitPin, 200);
}
function updateDots() {
  const dots = document.querySelectorAll('#pin-dots .pin-dot');
  dots.forEach((d,i) => d.classList.toggle('filled', i < pinBuffer.length));
}
function submitPin() {
  const pin = pinBuffer;
  pinBuffer = '';
  if (pinMode === 'setup') {
    localStorage.setItem('pin', pin);
    unlockApp();
  } else if (pinMode === 'change1') {
    newPinTemp = pin;
    pinMode = 'change2';
    document.getElementById('pin-subtitle').textContent = 'Confirm new PIN';
    updateDots();
  } else if (pinMode === 'change2') {
    if (pin === newPinTemp) {
      localStorage.setItem('pin', pin);
      unlockApp();
    } else {
      document.getElementById('pin-error').textContent = 'PINs don\'t match. Try again.';
      pinMode = 'change1';
      document.getElementById('pin-subtitle').textContent = 'Enter new PIN';
      updateDots();
    }
  } else {
    if (pin === localStorage.getItem('pin')) { unlockApp(); }
    else { document.getElementById('pin-error').textContent = 'Wrong PIN'; updateDots(); setTimeout(() => document.getElementById('pin-error').textContent = '', 2000); }
  }
}
function unlockApp() {
  document.getElementById('pin-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  initTabHTML(); initHifdhHTML(); initFeaturesHTML(); initReportsHTML();
  renderDashboard();
}
function lockApp() {
  pinMode = 'unlock';
  pinBuffer = '';
  document.getElementById('pin-subtitle').textContent = 'Enter PIN';
  document.getElementById('pin-error').textContent = '';
  document.getElementById('pin-setup-hint').textContent = '';
  updateDots();
  document.getElementById('pin-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}
function changePin() {
  pinMode = 'change1';
  pinBuffer = '';
  document.getElementById('pin-subtitle').textContent = 'Enter new PIN';
  document.getElementById('pin-error').textContent = '';
  document.getElementById('pin-setup-hint').textContent = '';
  updateDots();
  document.getElementById('pin-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

// === THEME ===
function toggleTheme() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', dark ? '' : 'dark');
  document.querySelector('.theme-toggle').textContent = dark ? '🌙' : '☀️';
  save('theme', dark ? 'light' : 'dark');
}
if (load('theme','light') === 'dark') { document.documentElement.setAttribute('data-theme','dark'); document.querySelector('.theme-toggle').textContent = '☀️'; }

// === TABS / NAV ===
function navTo(id) {
  document.querySelectorAll('.tab-content').forEach(e => e.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  // Update bottom nav active state
  document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
  const navItems = document.querySelectorAll('.nav-item');
  if (id==='dashboard') navItems[0].classList.add('active');
  else if (id==='hifdh') navItems[1].classList.add('active');
  else if (id==='rewards') navItems[2].classList.add('active');
  closeMenu();
  if (id==='dashboard') renderDashboard();
  if (id==='hifdh') renderHifdh();
  if (id==='juzmap') renderJuzMap();
  if (id==='quran') renderQuran();
  if (id==='planner') renderPlanner();
  if (id==='academics') renderAcademics();
  if (id==='goals') renderGoals();
  if (id==='badges') renderBadges();
  if (id==='weekly') renderWeekly();
  if (id==='report') renderReport();
  if (id==='rewards') renderRewards();
  if (id==='routine') renderRoutine();
}
function showTab(id, el) { navTo(id); }
function openMenu() { document.getElementById('menu-overlay').classList.add('open'); }
function closeMenu() { document.getElementById('menu-overlay').classList.remove('open'); }

