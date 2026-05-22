function initReportsHTML() {
  document.getElementById('academics').innerHTML = '<div class="card"><h3>📚 Academics</h3><div class="day-nav"><button onclick="changeAcadDay(-1)">◀</button><span class="date" id="acad-date"></span><button onclick="changeAcadDay(1)">▶</button></div><div id="acad-form"></div></div><div class="card"><h3>➕ Add Subject</h3><div class="routine-editor"><input id="new-subject" placeholder="Subject name"><button class="btn btn-primary" onclick="addSubject()">Add</button></div><div id="subject-list" style="margin-top:12px;"></div></div>';
  document.getElementById('weekly').innerHTML = '<div class="day-nav"><button onclick="changeWeek(-1)">◀</button><span class="date" id="weekly-date"></span><button onclick="changeWeek(1)">▶</button></div><div class="card" id="weekly-summary"></div><div class="card" id="weekly-hifdh"></div><div class="card" id="weekly-highlights"></div>';
  document.getElementById('report').innerHTML = '<div class="day-nav"><button onclick="changeMonth(-1)">◀</button><span class="date" id="report-month"></span><button onclick="changeMonth(1)">▶</button></div><div class="card" id="report-summary"></div><div class="card" id="report-hifdh"></div><div class="card" id="report-planner"></div>';
}

// === ACADEMICS ===
const DEFAULT_SUBJECTS = ['Math','English','Science','Arabic','Islamic Studies'];
let acadDay = new Date(); acadDay.setHours(0,0,0,0);

function getSubjects() { return load('subjects', DEFAULT_SUBJECTS); }
function getAcadLog(d) { return load('acad_' + dateKey(d), {}); }

function changeAcadDay(delta) { acadDay.setDate(acadDay.getDate() + delta); renderAcademics(); }

function renderAcademics() {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('acad-date').textContent = `${days[acadDay.getDay()]}, ${months[acadDay.getMonth()]} ${acadDay.getDate()}`;

  const subjects = getSubjects();
  const log = getAcadLog(acadDay);

  document.getElementById('acad-form').innerHTML = subjects.map(subj => {
    const entry = log[subj] || {homework:'',score:'',notes:''};
    return `<div style="margin-top:12px;padding:12px;border:1px solid var(--border);border-radius:8px;">
      <label style="font-weight:600;color:var(--accent);font-size:0.9rem;">${subj}</label>
      <div style="display:flex;gap:6px;margin-top:6px;">
        <button class="btn btn-sm ${entry.homework==='done'?'btn-primary':''}" style="border:1px solid var(--border);${entry.homework==='done'?'':'background:var(--bg);color:var(--text);'}" onclick="updateAcad('${subj}','homework','done')">✅ HW Done</button>
        <button class="btn btn-sm ${entry.homework==='na'?'btn-primary':''}" style="border:1px solid var(--border);${entry.homework==='na'?'':'background:var(--bg);color:var(--text);'}" onclick="updateAcad('${subj}','homework','na')">— No HW</button>
        <button class="btn btn-sm ${entry.homework==='missed'?'btn-danger':''}" style="border:1px solid var(--border);${entry.homework==='missed'?'':'background:var(--bg);color:var(--text);'}" onclick="updateAcad('${subj}','homework','missed')">❌ Missed</button>
      </div>
      <div style="display:flex;gap:6px;margin-top:6px;">
        <input style="flex:1;padding:6px 8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:0.85rem;" type="text" placeholder="Test/quiz score" value="${esc(entry.score)}" onchange="updateAcad('${subj}','score',this.value)">
        <input style="flex:2;padding:6px 8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:0.85rem;" type="text" placeholder="Notes / teacher comment" value="${esc(entry.notes)}" onchange="updateAcad('${subj}','notes',this.value)">
      </div>
    </div>`;
  }).join('');

  // Subject management
  document.getElementById('subject-list').innerHTML = subjects.map((s,i) =>
    `<span style="display:inline-block;padding:4px 10px;margin:2px;border-radius:12px;background:var(--bg);border:1px solid var(--border);font-size:0.8rem;">${s} <span style="cursor:pointer;color:var(--danger);" onclick="removeSubject(${i})">✕</span></span>`
  ).join('');
}

function updateAcad(subj, field, value) {
  const log = getAcadLog(acadDay);
  if (!log[subj]) log[subj] = {homework:'',score:'',notes:''};
  log[subj][field] = value;
  save('acad_' + dateKey(acadDay), log);
  renderAcademics();
}

function addSubject() {
  const name = document.getElementById('new-subject').value.trim();
  if (!name) return;
  const subjects = getSubjects();
  if (!subjects.includes(name)) { subjects.push(name); save('subjects', subjects); }
  document.getElementById('new-subject').value = '';
  renderAcademics();
}

function removeSubject(i) {
  const subjects = getSubjects();
  subjects.splice(i, 1);
  save('subjects', subjects);
  renderAcademics();
}

// === WEEKLY REVIEW ===
let weekOffset = 0;

function changeWeek(delta) { weekOffset += delta; renderWeekly(); }

function getWeekDates() {
  const now = new Date(today());
  now.setDate(now.getDate() + (weekOffset * 7));
  const day = now.getDay();
  const start = new Date(now); start.setDate(now.getDate() - day); // Sunday
  const end = new Date(start); end.setDate(start.getDate() + 6); // Saturday
  return {start, end};
}

function renderWeekly() {
  const {start, end} = getWeekDates();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('weekly-date').textContent = `${months[start.getMonth()]} ${start.getDate()} – ${months[end.getMonth()]} ${end.getDate()}`;

  let totalTasks = 0, doneTasks = 0, hifdhDays = 0;
  let completes = 0, repeats = 0, missed = 0;
  let sabaqs = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const dk = dateKey(d);

    const tasks = load('tasks_' + dk, null);
    if (tasks) { totalTasks += tasks.length; doneTasks += tasks.filter(t => t.done).length; }

    const h = load('hifdh_' + dk, null);
    if (h) {
      const has = h.sabaq?.surah || h.sabqi?.surah || h.manzil?.surah || h.online?.surah;
      if (has) hifdhDays++;
      ['sabaq','sabqi','manzil','online'].forEach(field => {
        if (h[field]?.status === 'complete') completes++;
        if (h[field]?.status === 'repeat') repeats++;
        if (h[field]?.status === 'missed') missed++;
      });
      if (h.sabaq?.surah) {
        const s = ALL_SURAHS.find(x => x.n == h.sabaq.surah);
        sabaqs.push(s ? `${s.name} ${h.sabaq.from||''}-${h.sabaq.to||''}` : '');
      }
    }
  }

  const taskPct = totalTasks ? Math.round(doneTasks/totalTasks*100) : 0;

  document.getElementById('weekly-summary').innerHTML = `
    <h3>📋 Week Summary</h3>
    <div class="stats">
      <div class="stat"><div class="num">${taskPct}%</div><div class="label">Tasks</div></div>
      <div class="stat"><div class="num">${hifdhDays}/7</div><div class="label">Hifdh Days</div></div>
      <div class="stat"><div class="num">${completes}</div><div class="label">✅ Complete</div></div>
    </div>
    <div style="font-size:0.85rem;margin-top:8px;">
      ✅ ${completes} complete · 🔁 ${repeats} repeat · ❌ ${missed} missed
    </div>`;

  document.getElementById('weekly-hifdh').innerHTML = `
    <h3>📖 Sabaq Progress This Week</h3>
    ${sabaqs.length === 0 ? '<p style="color:var(--muted);">No sabaq logged</p>' :
    sabaqs.map(s => `<div style="font-size:0.85rem;padding:4px 0;">📗 ${s}</div>`).join('')}`;

  // Highlights / areas to improve
  let highlights = [];
  if (taskPct >= 80) highlights.push('🌟 Great task completion rate!');
  if (hifdhDays >= 5) highlights.push('🌟 Consistent Quran practice!');
  if (missed > 2) highlights.push('⚠️ Multiple missed sessions — check what\'s blocking');
  if (repeats > completes) highlights.push('💪 More repeats than completes — keep pushing, almost there!');
  if (completes > 0 && missed === 0) highlights.push('🏆 No missed sessions — MashaAllah!');
  if (highlights.length === 0) highlights.push('📝 Keep logging daily for better insights');

  document.getElementById('weekly-highlights').innerHTML = `
    <h3>💡 Insights</h3>
    ${highlights.map(h => `<div style="font-size:0.9rem;padding:4px 0;">${h}</div>`).join('')}`;
}

// === MONTHLY REPORT ===
let reportMonth = new Date(); reportMonth.setDate(1); reportMonth.setHours(0,0,0,0);

function changeMonth(delta) { reportMonth.setMonth(reportMonth.getMonth() + delta); renderReport(); }

function renderReport() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('report-month').textContent = `${months[reportMonth.getMonth()]} ${reportMonth.getFullYear()}`;

  const year = reportMonth.getFullYear(), month = reportMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Gather data for the month
  let totalTasks = 0, completedTasks = 0, perfectDays = 0, hifdhDays = 0;
  let allSabaqs = [], allSabqis = [], allManzils = [], allOnline = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dk = dateKey(d);

    // Planner tasks
    const tasks = load('tasks_' + dk, null);
    if (tasks && tasks.length > 0) {
      totalTasks += tasks.length;
      const done = tasks.filter(t => t.done).length;
      completedTasks += done;
      if (done === tasks.length) perfectDays++;
    }

    // Hifdh logs
    const h = load('hifdh_' + dk, null);
    if (h) {
      const hasSomething = (h.sabaq?.surah || h.sabqi?.surah || h.manzil?.surah || h.online?.surah || h.online_sabqi?.surah || h.online_manzil?.surah);
      if (hasSomething) hifdhDays++;
      if (h.sabaq?.surah) allSabaqs.push(h.sabaq);
      if (h.sabqi?.surah) allSabqis.push(h.sabqi);
      if (h.manzil?.surah) allManzils.push(h.manzil);
      if (h.online?.surah) allOnline.push(h.online);
      if (h.online_sabqi?.surah) allOnline.push(h.online_sabqi);
      if (h.online_manzil?.surah) allOnline.push(h.online_manzil);
    }
  }

  // Count statuses
  const countStatus = (arr, s) => arr.filter(x => x.status === s).length;
  const allEntries = [...allSabaqs, ...allSabqis, ...allManzils, ...allOnline];
  const completes = countStatus(allEntries, 'complete');
  const repeats = countStatus(allEntries, 'repeat');
  const missed = countStatus(allEntries, 'missed');

  const taskPct = totalTasks ? Math.round(completedTasks/totalTasks*100) : 0;

  // Summary card
  document.getElementById('report-summary').innerHTML = `
    <h3>📊 Monthly Summary</h3>
    <div class="stats">
      <div class="stat"><div class="num">${perfectDays}</div><div class="label">Perfect Days</div></div>
      <div class="stat"><div class="num">${hifdhDays}</div><div class="label">Hifdh Days</div></div>
      <div class="stat"><div class="num">${taskPct}%</div><div class="label">Tasks Done</div></div>
    </div>
    <div style="font-size:0.85rem;margin-top:8px;">
      <div>✅ ${completes} complete · 🔁 ${repeats} repeat · ❌ ${missed} missed</div>
      <div>📖 ${hifdhDays} days with Quran logged</div>
      <div>🌟 ${perfectDays} days with ALL tasks done</div>
    </div>`;

  // Hifdh summary
  function fmtEntry(f) {
    const s = ALL_SURAHS.find(x => x.n == f.surah);
    const name = s ? s.name : `Surah ${f.surah}`;
    return f.from ? `${name} ${f.from}${f.to ? '-'+f.to : ''}` : name;
  }
  function summarizeEntries(entries, label, emoji) {
    if (entries.length === 0) return '';
    // Group by surah
    const grouped = {};
    entries.forEach(e => {
      const s = ALL_SURAHS.find(x => x.n == e.surah);
      const name = s ? s.name : `Surah ${e.surah}`;
      if (!grouped[name]) grouped[name] = [];
      if (e.from) grouped[name].push(e.from + (e.to ? '-'+e.to : ''));
    });
    const lines = Object.entries(grouped).map(([name, ranges]) =>
      `<div style="margin-left:12px;">${name}: ${ranges.length > 0 ? ranges.join(', ') : '✓'}</div>`
    ).join('');
    return `<div style="margin-bottom:8px;"><b>${emoji} ${label} (${entries.length} sessions)</b>${lines}</div>`;
  }

  document.getElementById('report-hifdh').innerHTML = `<h3>🕌 Hifdh Progress</h3>` +
    (hifdhDays === 0 ? '<p style="color:var(--muted)">No hifdh logged this month</p>' :
    summarizeEntries(allSabaqs, 'Sabaq (New)', '📗') +
    summarizeEntries(allSabqis, 'Sabqi (Revision)', '📘') +
    summarizeEntries(allManzils, 'Manzil (Old)', '📙') +
    summarizeEntries(allOnline, 'Online Ustad', '💻'));

  // Planner heatmap
  let heatmap = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-top:8px;">';
  const dayLabels = ['S','M','T','W','T','F','S'];
  heatmap += dayLabels.map(d => `<div style="text-align:center;font-size:0.7rem;color:var(--muted);">${d}</div>`).join('');
  // Pad start
  const firstDow = new Date(year, month, 1).getDay();
  for (let i = 0; i < firstDow; i++) heatmap += '<div></div>';
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dk = dateKey(d);
    const tasks = load('tasks_' + dk, null);
    const hifdh = load('hifdh_' + dk, null);
    let color = 'var(--border)';
    const hasHifdh = hifdh && (hifdh.sabaq?.surah || hifdh.sabqi?.surah || hifdh.manzil?.surah || hifdh.online?.surah || hifdh.online_sabqi?.surah || hifdh.online_manzil?.surah);
    if (tasks && tasks.length > 0) {
      const pct = tasks.filter(t=>t.done).length / tasks.length;
      if (pct === 1) color = 'var(--ok)';
      else if (pct > 0.5) color = 'var(--warn)';
      else if (pct > 0) color = 'var(--gold)';
    } else if (hasHifdh) {
      color = 'var(--accent2)';
    }
    heatmap += `<div style="aspect-ratio:1;border-radius:4px;background:${color};display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:${color==='var(--ok)'||color==='var(--accent2)'?'white':'var(--text)'}">${day}</div>`;
  }
  heatmap += '</div>';
  document.getElementById('report-planner').innerHTML = `<h3>📅 Daily Activity</h3><p style="font-size:0.75rem;color:var(--muted);margin-bottom:4px;">🟩 All tasks done · 🟨 Most · 🟧 Some · 🟦 Hifdh logged · ⬜ Nothing</p>${heatmap}`;
}

// === INIT ===
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
