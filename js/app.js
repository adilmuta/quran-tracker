// === PIN ===
let pinBuffer = '';
let pinMode = 'unlock'; // 'unlock', 'setup_child', 'setup_parent', 'change1', 'change2'
let newPinTemp = '';
let currentRole = 'child'; // 'child' or 'parent'

function initPin() {
  // Allow PIN reset via URL param
  if (window.location.search.includes('reset-pin')) {
    localStorage.removeItem('pin'); localStorage.removeItem('pin_child'); localStorage.removeItem('pin_parent');
    window.history.replaceState({}, '', window.location.pathname);
  }

  // Migrate old single PIN to child PIN
  const oldPin = localStorage.getItem('pin');
  if (oldPin && !localStorage.getItem('pin_child')) {
    // Old pin might be JSON-wrapped (e.g. "\"1234\"")
    let cleaned = oldPin.replace(/^"|"$/g, '');
    localStorage.setItem('pin_child', cleaned);
  }

  const childPin = localStorage.getItem('pin_child');
  const parentPin = localStorage.getItem('pin_parent');

  // Clean any JSON wrapping from Firestore sync
  if (childPin && childPin.startsWith('"')) localStorage.setItem('pin_child', JSON.parse(childPin));
  if (parentPin && parentPin.startsWith('"')) localStorage.setItem('pin_parent', JSON.parse(parentPin));

  if (!localStorage.getItem('pin_child')) {
    pinMode = 'setup_child';
    document.getElementById('pin-subtitle').textContent = 'Create Child PIN (4 digits)';
    document.getElementById('pin-setup-hint').textContent = 'First time setup';
    updateDots();
  } else if (!localStorage.getItem('pin_parent')) {
    pinMode = 'setup_parent';
    document.getElementById('pin-subtitle').textContent = 'Create Parent PIN (6 digits)';
    document.getElementById('pin-setup-hint').textContent = 'Parent gets full access';
    updateDots();
  } else {
    document.getElementById('pin-subtitle').textContent = 'Enter PIN';
    document.getElementById('pin-setup-hint').textContent = '4 digits = child · 6 digits = parent';
    updateDots();
  }
}

function pinInput(key) {
  if (key === 'del') { pinBuffer = pinBuffer.slice(0,-1); }
  else if (key === 'ok') { submitPin(); return; }
  else if (pinBuffer.length < 6) { pinBuffer += key; }
  updateDots();
  // Auto-submit at 4 digits if it matches child PIN (during unlock)
  if (pinMode === 'unlock' && pinBuffer.length === 4 && pinBuffer === (localStorage.getItem('pin_child')||'').replace(/^"|"$/g, '')) {
    setTimeout(submitPin, 200);
  }
  // Auto-submit at 6 digits during unlock
  if (pinMode === 'unlock' && pinBuffer.length === 6) {
    setTimeout(submitPin, 200);
  }
  // Auto-submit at 4 for child setup
  if (pinMode === 'setup_child' && pinBuffer.length === 4) {
    setTimeout(submitPin, 200);
  }
  // Auto-submit at 6 for parent setup
  if (pinMode === 'setup_parent' && pinBuffer.length === 6) {
    setTimeout(submitPin, 200);
  }
}

function updateDots() {
  const dots = document.querySelectorAll('#pin-dots .pin-dot');
  dots.forEach((d,i) => d.classList.toggle('filled', i < pinBuffer.length));
  // Show 4 or 6 dots depending on mode
  const container = document.getElementById('pin-dots');
  const needSix = (pinMode === 'setup_parent' || pinMode === 'change1' || pinMode === 'change2');
  if (needSix && dots.length === 4) {
    container.innerHTML = '<div class="pin-dot"></div>'.repeat(6);
    container.querySelectorAll('.pin-dot').forEach((d,i) => d.classList.toggle('filled', i < pinBuffer.length));
  } else if (!needSix && dots.length === 6 && pinMode !== 'unlock') {
    container.innerHTML = '<div class="pin-dot"></div>'.repeat(4);
    container.querySelectorAll('.pin-dot').forEach((d,i) => d.classList.toggle('filled', i < pinBuffer.length));
  } else if (pinMode === 'unlock') {
    // Dynamic: show as many dots as typed (up to 6)
    const count = Math.max(4, pinBuffer.length);
    if (dots.length !== count) {
      container.innerHTML = '<div class="pin-dot"></div>'.repeat(count);
      container.querySelectorAll('.pin-dot').forEach((d,i) => d.classList.toggle('filled', i < pinBuffer.length));
    } else {
      dots.forEach((d,i) => d.classList.toggle('filled', i < pinBuffer.length));
    }
  }
}

function submitPin() {
  const pin = pinBuffer;
  pinBuffer = '';

  if (pinMode === 'setup_child') {
    localStorage.setItem('pin_child', pin);
    pinMode = 'setup_parent';
    document.getElementById('pin-subtitle').textContent = 'Create Parent PIN (6 digits)';
    document.getElementById('pin-setup-hint').textContent = 'Parent gets full access';
    updateDots();
    return;
  }

  if (pinMode === 'setup_parent') {
    localStorage.setItem('pin_parent', pin);
    currentRole = 'parent';
    unlockApp();
    return;
  }

  if (pinMode === 'change1') {
    newPinTemp = pin;
    pinMode = 'change2';
    document.getElementById('pin-subtitle').textContent = 'Confirm new Parent PIN (6 digits)';
    updateDots();
    return;
  }

  if (pinMode === 'change2') {
    if (pin === newPinTemp) {
      localStorage.setItem('pin_parent', pin);
      unlockApp();
    } else {
      document.getElementById('pin-error').textContent = 'PINs don\'t match';
      pinMode = 'change1';
      document.getElementById('pin-subtitle').textContent = 'Enter new Parent PIN (6 digits)';
      updateDots();
    }
    return;
  }

  // Unlock mode — check both PINs
  const storedChild = (localStorage.getItem('pin_child')||'').replace(/^"|"$/g, '');
  const storedParent = (localStorage.getItem('pin_parent')||'').replace(/^"|"$/g, '');
  if (pin === storedChild) {
    currentRole = 'child';
    unlockApp();
  } else if (pin === storedParent) {
    currentRole = 'parent';
    unlockApp();
  } else {
    document.getElementById('pin-error').textContent = 'Wrong PIN';
    updateDots();
    setTimeout(() => document.getElementById('pin-error').textContent = '', 2000);
  }
}

function unlockApp() {
  document.getElementById('pin-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  initTabHTML(); initHifdhHTML(); initFeaturesHTML(); initReportsHTML();
  applyRole();
  renderDashboard();
}

function applyRole() {
  // Hide parent-only menu items for child
  const menuItems = document.querySelectorAll('.menu-item');
  const parentOnly = ['juzmap', 'goals', 'routine', 'report'];
  menuItems.forEach(item => {
    const target = item.getAttribute('onclick')?.match(/navTo\('(\w+)'\)/)?.[1];
    if (target && parentOnly.includes(target) && currentRole === 'child') {
      item.style.display = 'none';
    } else {
      item.style.display = '';
    }
  });
  // Show role indicator in header
  const header = document.querySelector('header h1');
  header.innerHTML = `<span>📖</span> Quran Tracker <span style="font-size:0.6rem;background:${currentRole==='parent'?'var(--accent)':'var(--gold)'};color:white;padding:2px 8px;border-radius:10px;vertical-align:middle;">${currentRole==='parent'?'👨‍👩‍👧 Parent':'👧 Shireen'}</span>`;
}

function lockApp() {
  pinMode = 'unlock';
  pinBuffer = '';
  document.getElementById('pin-subtitle').textContent = 'Enter PIN';
  document.getElementById('pin-error').textContent = '';
  document.getElementById('pin-setup-hint').textContent = '4 digits = child · 6 digits = parent';
  document.getElementById('pin-dots').innerHTML = '<div class="pin-dot"></div>'.repeat(4);
  document.getElementById('pin-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

function changePin() {
  pinMode = 'change1';
  pinBuffer = '';
  document.getElementById('pin-subtitle').textContent = 'Enter new Parent PIN (6 digits)';
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
  // Block child from parent-only tabs
  const parentOnly = ['juzmap', 'goals', 'routine', 'report'];
  if (currentRole === 'child' && parentOnly.includes(id)) return;

  document.querySelectorAll('.tab-content').forEach(e => e.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
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
