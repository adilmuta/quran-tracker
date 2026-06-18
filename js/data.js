// === DATA ===
const SURAHS = {
  juz28: [{n:58,name:"Al-Mujadila"},{n:59,name:"Al-Hashr"},{n:60,name:"Al-Mumtahina"},{n:61,name:"As-Saff"},{n:62,name:"Al-Jumu'ah"},{n:63,name:"Al-Munafiqun"},{n:64,name:"At-Taghabun"},{n:65,name:"At-Talaq"},{n:66,name:"At-Tahrim"}],
  juz27: [{n:52,name:"At-Tur"},{n:53,name:"An-Najm"},{n:54,name:"Al-Qamar"},{n:55,name:"Ar-Rahman"},{n:56,name:"Al-Waqi'ah"},{n:57,name:"Al-Hadid"}],
  juz26: [{n:46,name:"Al-Ahqaf"},{n:47,name:"Muhammad"},{n:48,name:"Al-Fath"},{n:49,name:"Al-Hujurat"},{n:50,name:"Qaf"},{n:51,name:"Adh-Dhariyat"}]
};
const EXAM_DATE = new Date('2026-06-02'); // (legacy) Juz 26-28 exam — passed

// === MEMORIZATION (15-line Madani mushaf: 20 pages per juz) ===
const PAGES_PER_JUZ = 20;
const ACTIVE_JUZ = [1, 2, 3];                // Juz 1 done; working on Juz 2-3 this summer
const GOAL_DATE = new Date('2026-09-12');    // summer goal: finish Juz 2, well into Juz 3
const GOAL_LABEL = 'days until summer goal (Juz 2 + into Juz 3)';
const DAILY_SABAQ = '½ page · ~7-8 lines · 5 days/week';  // sustainable summer pace

// Per-juz page progress, stored as { juzNum: [pageNumbers...] }
function getJuzPages() { return load('juz_pages', {}); }
function juzPagesDone(j) { return (getJuzPages()[j] || []).length; }
function togglePage(j, page) {
  const m = getJuzPages();
  const arr = m[j] || [];
  const i = arr.indexOf(page);
  const wasDone = i >= 0;
  if (wasDone) arr.splice(i, 1); else arr.push(page);
  arr.sort((a, b) => a - b);
  m[j] = arr;
  save('juz_pages', m);
  if (!wasDone && typeof addStars === 'function') addStars(2, `Memorized Juz ${j} p.${page}`);
  syncJuzStatusFromPages(j);
  renderQuran();
}
function syncJuzStatusFromPages(j) {
  const n = juzPagesDone(j);
  const status = load('juz_status', {});
  const prev = status[j];
  status[j] = n >= PAGES_PER_JUZ ? 'complete' : n > 0 ? 'in_progress' : 'not_started';
  save('juz_status', status);
  if (prev !== 'complete' && status[j] === 'complete' && typeof addStars === 'function') {
    addStars(20, `Juz ${j} complete! 🎉`);
  }
  if (typeof checkBadges === 'function') checkBadges();
}
const DEFAULT_ROUTINE = [
  {time:"06:00",task:"Fajr & Morning Adhkar"},
  {time:"06:30",task:"Quran Revision — Morning (45 min)"},
  {time:"07:30",task:"Breakfast"},
  {time:"08:00",task:"Free play / Outdoor"},
  {time:"10:00",task:"Study / Homework"},
  {time:"12:00",task:"Dhuhr & Lunch"},
  {time:"13:00",task:"Quran Revision — Afternoon (30 min)"},
  {time:"14:00",task:"Rest / Nap"},
  {time:"15:30",task:"Asr & Snack"},
  {time:"16:00",task:"Play / Activity"},
  {time:"18:00",task:"Maghrib & Dinner"},
  {time:"19:00",task:"Quran Revision — Evening (20 min)"},
  {time:"19:30",task:"Family time / Reading"},
  {time:"20:30",task:"Isha & Bedtime"},
  {time:"21:00",task:"Sleep 😴"}
];
const DEFAULT_REWARDS = [
  {name:"30 min screen time 📱", cost: 10},
  {name:"Ice cream 🍦", cost: 15},
  {name:"Choose dinner 🍕", cost: 20},
  {name:"New book / toy 📚", cost: 50},
  {name:"Day trip / outing 🎢", cost: 100}
];
const DEFAULT_GOALS = [
  {name:'Complete Juz 1', date:'2026-06-01', done:false},
  {name:'Pass Juz 26-28 exam', date:'2026-06-02', done:false}
];

// === HELPERS ===
function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } }
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); syncToFirestore(k, v); }
function dateKey(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function today() { const d = new Date(); d.setHours(0,0,0,0); return d; }
function esc(s) { return (s||'').replace(/"/g,'&quot;'); }
let currentDay = new Date(); currentDay.setHours(0,0,0,0);


// Migration: fix keys saved with old UTC-based dateKey
function migrateLocalDateKeys() {
  if (localStorage.getItem('_migrated_datekeys')) return;
  const prefixes = ['hifdh_','tasks_','acad_'];
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    const prefix = prefixes.find(p => key.startsWith(p));
    if (!prefix) continue;
    const datePart = key.slice(prefix.length);
    // Check if it's a valid date and re-key it using local format
    const d = new Date(datePart + 'T12:00:00'); // noon to avoid timezone shift
    if (isNaN(d)) continue;
    const correctKey = prefix + dateKey(d);
    if (correctKey !== key && !localStorage.getItem(correctKey)) {
      localStorage.setItem(correctKey, localStorage.getItem(key));
      localStorage.removeItem(key);
    }
  }
  localStorage.setItem('_migrated_datekeys', '1');
}
migrateLocalDateKeys();

// === ONE-TIME SEEDS (idempotent) ===
// Called by applySeeds() AFTER data is loaded (Firestore or PIN path), so they
// run against the user's real data and then sync back to Firestore via save().

// Shireen finished Juz 1 over the school year but never logged it — seed it complete.
function seedJuz1Complete() {
  if (localStorage.getItem('_seed_juz1_v1')) return;
  const pages = load('juz_pages', {});
  if (!pages[1] || pages[1].length < PAGES_PER_JUZ) {
    pages[1] = Array.from({ length: PAGES_PER_JUZ }, (_, i) => i + 1);
    save('juz_pages', pages);
  }
  const status = load('juz_status', { 26:'complete',27:'complete',28:'complete',29:'complete',30:'complete' });
  status[1] = 'complete';
  save('juz_status', status);
  localStorage.setItem('_seed_juz1_v1', '1');
}

// Summer goal: complete Juz 2-5 by 2nd week of Sept, with per-juz milestones.
function seedSummerGoal() {
  if (localStorage.getItem('_seed_summer_goal_v1')) return;
  const goals = load('goals', DEFAULT_GOALS.slice());
  goals.forEach(g => { if (/juz\s*1\b/i.test(g.name)) g.done = true; }); // Juz 1 done
  if (!goals.some(g => /summer|juz\s*2[\s\u2013-]*5/i.test(g.name))) {
    goals.push(
      { name:'Complete Juz 2-5 (summer)', date:'2026-09-12', done:false },
      { name:'Juz 2 memorized', date:'2026-07-10', done:false },
      { name:'Juz 3 memorized', date:'2026-07-31', done:false },
      { name:'Juz 4 memorized', date:'2026-08-21', done:false },
      { name:'Juz 5 memorized', date:'2026-09-11', done:false }
    );
  }
  save('goals', goals);
  localStorage.setItem('_seed_summer_goal_v1', '1');
}

function applySeeds() {
  try { seedJuz1Complete(); seedSummerGoal(); seedSummerGoalV2(); } catch (e) { console.log('applySeeds error', e); }
}

// Re-scope to a sustainable summer pace (½ page x 5 days): finish Juz 2, into Juz 3.
function seedSummerGoalV2() {
  if (localStorage.getItem('_seed_summer_goal_v2')) return;
  let goals = load('goals', DEFAULT_GOALS.slice());
  // Remove the old over-ambitious Juz 2-5 milestone set
  goals = goals.filter(g => !/complete juz 2-5|juz 2 memorized|juz 3 memorized|juz 4 memorized|juz 5 memorized/i.test(g.name));
  goals.forEach(g => { if (/juz\s*1\b/i.test(g.name)) g.done = true; });
  if (!goals.some(g => /finish juz 2/i.test(g.name))) {
    goals.push(
      { name:'Finish Juz 2', date:'2026-08-14', done:false },
      { name:'Into Juz 3 — 10+ pages', date:'2026-09-12', done:false }
    );
  }
  save('goals', goals);
  localStorage.setItem('_seed_summer_goal_v2', '1');
}
