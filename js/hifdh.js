function initHifdhHTML() {
  document.getElementById('hifdh').innerHTML = '<div class="countdown" id="juz1-countdown" style="background:linear-gradient(135deg,var(--accent),var(--accent2));"></div><div class="card"><h3>🕌 Today\'s Hifdh Log</h3><div class="day-nav"><button onclick="changeHifdhDay(-1)">◀</button><span class="date" id="hifdh-date"></span><button onclick="changeHifdhDay(1)">▶</button></div><div id="hifdh-form"></div></div><div class="card"><h3>📊 Recent Logs</h3><div id="hifdh-history" style="font-size:0.85rem;"></div></div>';
}

// === HIFDH LOG ===
const JUZ1_TEST = new Date('2026-06-01');
let hifdhDay = new Date(); hifdhDay.setHours(0,0,0,0);

const ALL_SURAHS = [
  {n:1,name:"Al-Fatihah",ayahs:7},{n:2,name:"Al-Baqarah",ayahs:286},{n:3,name:"Aal-Imran",ayahs:200},
  {n:4,name:"An-Nisa",ayahs:176},{n:5,name:"Al-Ma'idah",ayahs:120},{n:6,name:"Al-An'am",ayahs:165},
  {n:7,name:"Al-A'raf",ayahs:206},{n:8,name:"Al-Anfal",ayahs:75},{n:9,name:"At-Tawbah",ayahs:129},
  {n:10,name:"Yunus",ayahs:109},{n:11,name:"Hud",ayahs:123},{n:12,name:"Yusuf",ayahs:111},
  {n:13,name:"Ar-Ra'd",ayahs:43},{n:14,name:"Ibrahim",ayahs:52},{n:15,name:"Al-Hijr",ayahs:99},
  {n:16,name:"An-Nahl",ayahs:128},{n:17,name:"Al-Isra",ayahs:111},{n:18,name:"Al-Kahf",ayahs:110},
  {n:19,name:"Maryam",ayahs:98},{n:20,name:"Ta-Ha",ayahs:135},{n:21,name:"Al-Anbiya",ayahs:112},
  {n:22,name:"Al-Hajj",ayahs:78},{n:23,name:"Al-Mu'minun",ayahs:118},{n:24,name:"An-Nur",ayahs:64},
  {n:25,name:"Al-Furqan",ayahs:77},{n:26,name:"Ash-Shu'ara",ayahs:227},{n:27,name:"An-Naml",ayahs:93},
  {n:28,name:"Al-Qasas",ayahs:88},{n:29,name:"Al-Ankabut",ayahs:69},{n:30,name:"Ar-Rum",ayahs:60},
  {n:31,name:"Luqman",ayahs:34},{n:32,name:"As-Sajdah",ayahs:30},{n:33,name:"Al-Ahzab",ayahs:73},
  {n:34,name:"Saba",ayahs:54},{n:35,name:"Fatir",ayahs:45},{n:36,name:"Ya-Sin",ayahs:83},
  {n:37,name:"As-Saffat",ayahs:182},{n:38,name:"Sad",ayahs:88},{n:39,name:"Az-Zumar",ayahs:75},
  {n:40,name:"Ghafir",ayahs:85},{n:41,name:"Fussilat",ayahs:54},{n:42,name:"Ash-Shura",ayahs:53},
  {n:43,name:"Az-Zukhruf",ayahs:89},{n:44,name:"Ad-Dukhan",ayahs:59},{n:45,name:"Al-Jathiyah",ayahs:37},
  {n:46,name:"Al-Ahqaf",ayahs:35},{n:47,name:"Muhammad",ayahs:38},{n:48,name:"Al-Fath",ayahs:29},
  {n:49,name:"Al-Hujurat",ayahs:18},{n:50,name:"Qaf",ayahs:45},{n:51,name:"Adh-Dhariyat",ayahs:60},
  {n:52,name:"At-Tur",ayahs:49},{n:53,name:"An-Najm",ayahs:62},{n:54,name:"Al-Qamar",ayahs:55},
  {n:55,name:"Ar-Rahman",ayahs:78},{n:56,name:"Al-Waqi'ah",ayahs:96},{n:57,name:"Al-Hadid",ayahs:29},
  {n:58,name:"Al-Mujadila",ayahs:22},{n:59,name:"Al-Hashr",ayahs:24},{n:60,name:"Al-Mumtahina",ayahs:13},
  {n:61,name:"As-Saff",ayahs:14},{n:62,name:"Al-Jumu'ah",ayahs:11},{n:63,name:"Al-Munafiqun",ayahs:11},
  {n:64,name:"At-Taghabun",ayahs:18},{n:65,name:"At-Talaq",ayahs:12},{n:66,name:"At-Tahrim",ayahs:12},
  {n:67,name:"Al-Mulk",ayahs:30},{n:68,name:"Al-Qalam",ayahs:52},{n:69,name:"Al-Haqqah",ayahs:52},
  {n:70,name:"Al-Ma'arij",ayahs:44},{n:71,name:"Nuh",ayahs:28},{n:72,name:"Al-Jinn",ayahs:28},
  {n:73,name:"Al-Muzzammil",ayahs:20},{n:74,name:"Al-Muddaththir",ayahs:56},{n:75,name:"Al-Qiyamah",ayahs:40},
  {n:76,name:"Al-Insan",ayahs:31},{n:77,name:"Al-Mursalat",ayahs:50},{n:78,name:"An-Naba",ayahs:40},
  {n:79,name:"An-Nazi'at",ayahs:46},{n:80,name:"Abasa",ayahs:42},{n:81,name:"At-Takwir",ayahs:29},
  {n:82,name:"Al-Infitar",ayahs:19},{n:83,name:"Al-Mutaffifin",ayahs:36},{n:84,name:"Al-Inshiqaq",ayahs:25},
  {n:85,name:"Al-Buruj",ayahs:22},{n:86,name:"At-Tariq",ayahs:17},{n:87,name:"Al-A'la",ayahs:19},
  {n:88,name:"Al-Ghashiyah",ayahs:26},{n:89,name:"Al-Fajr",ayahs:30},{n:90,name:"Al-Balad",ayahs:20},
  {n:91,name:"Ash-Shams",ayahs:15},{n:92,name:"Al-Layl",ayahs:21},{n:93,name:"Ad-Duha",ayahs:11},
  {n:94,name:"Ash-Sharh",ayahs:8},{n:95,name:"At-Tin",ayahs:8},{n:96,name:"Al-Alaq",ayahs:19},
  {n:97,name:"Al-Qadr",ayahs:5},{n:98,name:"Al-Bayyinah",ayahs:8},{n:99,name:"Az-Zalzalah",ayahs:8},
  {n:100,name:"Al-Adiyat",ayahs:11},{n:101,name:"Al-Qari'ah",ayahs:11},{n:102,name:"At-Takathur",ayahs:8},
  {n:103,name:"Al-Asr",ayahs:3},{n:104,name:"Al-Humazah",ayahs:9},{n:105,name:"Al-Fil",ayahs:5},
  {n:106,name:"Quraysh",ayahs:4},{n:107,name:"Al-Ma'un",ayahs:7},{n:108,name:"Al-Kawthar",ayahs:3},
  {n:109,name:"Al-Kafirun",ayahs:6},{n:110,name:"An-Nasr",ayahs:3},{n:111,name:"Al-Masad",ayahs:5},
  {n:112,name:"Al-Ikhlas",ayahs:4},{n:113,name:"Al-Falaq",ayahs:5},{n:114,name:"An-Nas",ayahs:6}
];

const SURAH_OPTIONS = ALL_SURAHS.map(s => `<option value="${s.n}">${s.n}. ${s.name} (${s.ayahs})</option>`).join('');

function changeHifdhDay(delta) { hifdhDay.setDate(hifdhDay.getDate() + delta); renderHifdh(); }

function getHifdhLog(d) { return load('hifdh_' + dateKey(d), {sabaq:{surah:'',from:'',to:''},sabqi:{surah:'',from:'',to:''},manzil:{surah:'',from:'',to:''},online:{surah:'',from:'',to:''},notes:''}); }
function saveHifdhLog(d, data) { save('hifdh_' + dateKey(d), data); }

function hifdhFieldHTML(id, label, tag, log) {
  const field = log[id] || {surah:'',from:'',to:'',status:'',missed_reason:''};
  const status = field.status || '';
  return `<div class="hifdh-field">
    <label>${label} ${tag ? `<span class="teacher-tag">${tag}</span>` : ''}</label>
    <div style="display:flex;gap:6px;align-items:center;">
      <select style="flex:2;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:0.85rem;" onchange="updateHifdhField('${id}','surah',this.value)">
        <option value="">Surah...</option>${SURAH_OPTIONS.replace(`value="${field.surah}"`,`value="${field.surah}" selected`)}
      </select>
      <input style="flex:1;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:0.85rem;" type="number" min="1" placeholder="From" value="${field.from}" onchange="updateHifdhField('${id}','from',this.value)">
      <span style="color:var(--muted);">–</span>
      <input style="flex:1;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:0.85rem;" type="number" min="1" placeholder="To" value="${field.to}" onchange="updateHifdhField('${id}','to',this.value)">
    </div>
    <div style="display:flex;gap:6px;margin-top:6px;">
      <button class="btn btn-sm ${status==='complete'?'btn-primary':''}" style="flex:1;border:1px solid var(--border);${status==='complete'?'':'background:var(--bg);color:var(--text);'}" onclick="updateHifdhField('${id}','status','complete');renderHifdh();">✅ Complete</button>
      <button class="btn btn-sm ${status==='repeat'?'btn-primary':''}" style="flex:1;border:1px solid var(--border);${status==='repeat'?'':'background:var(--bg);color:var(--text);'}" onclick="updateHifdhField('${id}','status','repeat');renderHifdh();">🔁 Repeat</button>
      <button class="btn btn-sm ${status==='missed'?'btn-danger':''}" style="flex:1;border:1px solid var(--border);${status==='missed'?'':'background:var(--bg);color:var(--text);'}" onclick="updateHifdhField('${id}','status','missed');renderHifdh();">❌ Missed</button>
    </div>
    ${status==='missed' ? `<input style="width:100%;padding:8px;border:1px solid var(--danger);border-radius:8px;background:var(--bg);color:var(--text);font-size:0.85rem;margin-top:6px;" placeholder="Why was it missed?" value="${esc(field.missed_reason||'')}" onchange="updateHifdhField('${id}','missed_reason',this.value)">` : ''}
  </div>`;
}

function renderHifdh() {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('hifdh-date').textContent = `${days[hifdhDay.getDay()]}, ${months[hifdhDay.getMonth()]} ${hifdhDay.getDate()}`;

  const daysLeft = Math.max(0, Math.ceil((JUZ1_TEST - today()) / 86400000));
  document.getElementById('juz1-countdown').innerHTML = daysLeft > 0
    ? `<div class="days">${daysLeft}</div><div class="label">days until Juz 1 test (Sr. Amany) — June 1</div>`
    : `<div class="days">📝</div><div class="label">Juz 1 test day! بالتوفيق</div>`;

  const log = getHifdhLog(hifdhDay);
  document.getElementById('hifdh-form').innerHTML =
    hifdhFieldHTML('sabaq','📗 Sabaq (New Lesson)','Sr. Amany',log) +
    hifdhFieldHTML('sabqi','📘 Sabqi (Recent Revision)','Sr. Amany',log) +
    hifdhFieldHTML('manzil','📙 Manzil (Older Revision)','Sr. Amany',log) +
    hifdhFieldHTML('online','💻 Sabaq (New)','Hazrat Online',log) +
    hifdhFieldHTML('online_sabqi','💻 Sabqi (Revision)','Hazrat Online',log) +
    hifdhFieldHTML('online_manzil','💻 Manzil (Old)','Hazrat Online',log) +
    `<div class="hifdh-field" style="border-top:2px solid var(--border);padding-top:12px;margin-top:12px;">
      <label>🏠 Home Reading <span class="teacher-tag" style="background:var(--gold);">At Home</span></label>
    </div>` +
    `<div class="hifdh-field">
      <label>⏰ Time & Duration</label>
      <div style="display:flex;gap:6px;">
        <input style="flex:1;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:0.85rem;" type="time" value="${log.home_time||''}" onchange="updateHifdh('home_time',this.value)">
        <select style="flex:1;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:0.85rem;" onchange="updateHifdh('home_duration',this.value)">
          <option value="">Duration...</option>
          ${['10 min','15 min','20 min','30 min','45 min','1 hour'].map(d => `<option value="${d}" ${log.home_duration===d?'selected':''}>${d}</option>`).join('')}
        </select>
      </div>
    </div>` +
    hifdhFieldHTML('home_reading','🏠 What was practiced','At Home',log) +
    `<div class="hifdh-field">
      <label>👂 Tested by</label>
      <div style="display:flex;gap:6px;">
        <select style="flex:1;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:0.85rem;" onchange="updateHifdh('home_tester',this.value)">
          <option value="">No one tested</option>
          ${['Baba','Mama','Self-check','Sibling','Other'].map(t => `<option value="${t}" ${log.home_tester===t?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="hifdh-field">
      <label>📝 Home Notes</label>
      <textarea onchange="updateHifdh('home_notes',this.value)" placeholder="How did it go? Any mistakes? Confidence level...">${esc(log.home_notes||'')}</textarea>
    </div>` +
    `<div class="hifdh-field" style="border-top:2px solid var(--border);padding-top:12px;margin-top:12px;">
      <label>👩‍🏫 Sr. Amany's Feedback</label>
      <textarea onchange="updateHifdh('feedback',this.value)" placeholder="What did the teacher say? Any corrections, praise, or areas to improve...">${esc(log.feedback||'')}</textarea>
    </div>
    <div class="hifdh-field">
      <label>📸 Teacher's Sheet</label>
      <div id="photo-preview" style="margin-bottom:8px;">${log.photo ? `<img src="${log.photo}" style="max-width:100%;border-radius:8px;border:1px solid var(--border);" onclick="viewPhoto()">` : ''}</div>
      <div style="display:flex;gap:8px;">
        <label class="btn btn-primary" style="cursor:pointer;flex:1;text-align:center;">📷 Take Photo<input type="file" accept="image/*" capture="environment" style="display:none;" onchange="savePhoto(this)"></label>
        <label class="btn btn-primary" style="cursor:pointer;flex:1;text-align:center;background:var(--accent2);">🖼️ Upload<input type="file" accept="image/*" style="display:none;" onchange="savePhoto(this)"></label>
        ${log.photo ? `<button class="btn btn-sm btn-danger" onclick="removePhoto()">✕</button>` : ''}
      </div>
    </div>
    <div class="hifdh-field">
      <label>📝 Shireen's Notes</label>
      <textarea onchange="updateHifdh('notes',this.value)" placeholder="Anything else to remember...">${esc(log.notes)}</textarea>
    </div>`;

  // History
  const history = [];
  const d = new Date(today());
  for (let i = 0; i < 7; i++) {
    if (i > 0) d.setDate(d.getDate() - 1);
    const l = load('hifdh_' + dateKey(d), null);
    if (l && (l.sabaq?.surah || l.sabqi?.surah || l.manzil?.surah || l.online?.surah || l.online_sabqi?.surah || l.online_manzil?.surah || l.home_reading?.surah)) {
      history.push({date: new Date(d), ...l});
    }
  }
  function fmtField(f) {
    if (!f || !f.surah) return '';
    const s = ALL_SURAHS.find(x => x.n == f.surah);
    const name = s ? s.name : `Surah ${f.surah}`;
    const range = f.from ? ` ${f.from}${f.to ? '-'+f.to : ''}` : '';
    const badge = f.status === 'complete' ? ' ✅' : f.status === 'repeat' ? ' 🔁' : f.status === 'missed' ? ' ❌' : '';
    return `${name}${range}${badge}`;
  }
  document.getElementById('hifdh-history').innerHTML = history.length === 0
    ? '<p style="color:var(--muted)">No logs yet. Start filling in today!</p>'
    : history.map(h => `<div class="hifdh-entry">
        <div class="date-label">${days[h.date.getDay()]}, ${months[h.date.getMonth()]} ${h.date.getDate()}</div>
        ${fmtField(h.sabaq) ? `<div class="detail">📗 Sabaq: ${fmtField(h.sabaq)}</div>` : ''}
        ${fmtField(h.sabqi) ? `<div class="detail">📘 Sabqi: ${fmtField(h.sabqi)}</div>` : ''}
        ${fmtField(h.manzil) ? `<div class="detail">📙 Manzil: ${fmtField(h.manzil)}</div>` : ''}
        ${fmtField(h.online) ? `<div class="detail">💻 Sabaq: ${fmtField(h.online)}</div>` : ''}
        ${fmtField(h.online_sabqi) ? `<div class="detail">💻 Sabqi: ${fmtField(h.online_sabqi)}</div>` : ''}
        ${fmtField(h.online_manzil) ? `<div class="detail">💻 Manzil: ${fmtField(h.online_manzil)}</div>` : ''}
        ${fmtField(h.home_reading) ? `<div class="detail">🏠 Home: ${fmtField(h.home_reading)}${h.home_duration?' ('+h.home_duration+')':''}${h.home_tester?' — tested by '+h.home_tester:''}</div>` : ''}
        ${h.feedback ? `<div class="detail">👩‍🏫 ${h.feedback}</div>` : ''}
        ${h.notes ? `<div class="detail">📝 ${h.notes}</div>` : ''}
      </div>`).join('');
}

function updateHifdhField(id, key, value) {
  const log = getHifdhLog(hifdhDay);
  if (typeof log[id] === 'string') log[id] = {surah:'',from:'',to:''};
  log[id][key] = value;
  saveHifdhLog(hifdhDay, log);
}

function updateHifdh(field, value) {
  const log = getHifdhLog(hifdhDay);
  log[field] = value;
  saveHifdhLog(hifdhDay, log);
}

function savePhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    // Resize to save localStorage space
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxW = 800;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      const log = getHifdhLog(hifdhDay);
      log.photo = dataUrl;
      saveHifdhLog(hifdhDay, log);
      renderHifdh();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removePhoto() {
  const log = getHifdhLog(hifdhDay);
  delete log.photo;
  saveHifdhLog(hifdhDay, log);
  renderHifdh();
}

function viewPhoto() {
  const log = getHifdhLog(hifdhDay);
  if (!log.photo) return;
  const w = window.open();
  w.document.write(`<img src="${log.photo}" style="max-width:100%;margin:auto;display:block;">`);
}

function esc(s) { return (s||'').replace(/"/g,'&quot;'); }

