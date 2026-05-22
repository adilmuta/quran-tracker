// === DATA ===
const SURAHS = {
  juz28: [{n:58,name:"Al-Mujadila"},{n:59,name:"Al-Hashr"},{n:60,name:"Al-Mumtahina"},{n:61,name:"As-Saff"},{n:62,name:"Al-Jumu'ah"},{n:63,name:"Al-Munafiqun"},{n:64,name:"At-Taghabun"},{n:65,name:"At-Talaq"},{n:66,name:"At-Tahrim"}],
  juz27: [{n:52,name:"At-Tur"},{n:53,name:"An-Najm"},{n:54,name:"Al-Qamar"},{n:55,name:"Ar-Rahman"},{n:56,name:"Al-Waqi'ah"},{n:57,name:"Al-Hadid"}],
  juz26: [{n:46,name:"Al-Ahqaf"},{n:47,name:"Muhammad"},{n:48,name:"Al-Fath"},{n:49,name:"Al-Hujurat"},{n:50,name:"Qaf"},{n:51,name:"Adh-Dhariyat"}]
};
const EXAM_DATE = new Date('2026-06-02');
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

// === HELPERS ===
function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } }
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); syncToFirestore(k, v); }
function dateKey(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function today() { const d = new Date(); d.setHours(0,0,0,0); return d; }
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
