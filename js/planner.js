// Tab HTML setup
function initTabHTML() {
  document.getElementById('dashboard').innerHTML = '<div class="countdown" id="countdown"></div><div class="streak" id="streak"></div><div class="stats" id="stats"></div><div class="card" id="needs-attention"></div><div class="card"><h3>📋 Next Up</h3><div id="today-summary"></div></div>';
  document.getElementById('quran').innerHTML = '<div class="card"><h3>📖 Memorization Progress</h3><p style="font-size:0.8rem;color:var(--muted);margin-bottom:10px;">15-line Madani mushaf · 20 pages per juz · tap a page to mark it memorized</p><div id="juz-pages"></div></div><div class="card"><h3>📝 Today\'s Revision</h3><div id="exam-log"></div></div>';
  document.getElementById('planner').innerHTML = '<div class="day-nav"><button onclick="changeDay(-1)">◀</button><span class="date" id="planner-date"></span><button onclick="changeDay(1)">▶</button></div><div class="card" id="planner-tasks"></div>';
  document.getElementById('rewards').innerHTML = '<div class="card"><div class="rewards-header"><h3>⭐ Stars Earned</h3><div class="stars-display">⭐ <span id="star-count">0</span></div></div><p style="font-size:0.8rem;color:var(--muted);">Earn stars by completing tasks & surahs.</p><div style="margin-top:12px;font-size:0.85rem;"><div>✅ Task = <b>1⭐</b></div><div>📖 Surah = <b>3⭐</b></div><div>🔥 All tasks = <b>5⭐</b></div><div>📅 7-day streak = <b>20⭐</b></div></div></div><div class="card"><h3>🎁 Rewards Shop</h3><div id="rewards-shop"></div></div><div class="card"><h3>📜 History</h3><div class="reward-log" id="reward-log"></div></div><div class="card"><h3>➕ Add Custom Reward</h3><div class="routine-editor"><input id="new-reward-name" placeholder="Reward name"><input id="new-reward-cost" type="number" placeholder="Star cost"><button class="btn btn-gold" onclick="addReward()">Add Reward</button></div></div>';
  document.getElementById('routine').innerHTML = '<div class="card"><h3>⚙️ Daily Routine</h3><p style="font-size:0.8rem;color:var(--muted);margin-bottom:12px;">Default schedule generated each day.</p><div id="routine-list"></div><div class="routine-editor"><input id="new-time" type="time"><input id="new-task" type="text" placeholder="Task name"><button class="btn btn-primary" onclick="addRoutineItem()">+ Add</button></div></div><div class="card"><h3>🔐 Change PIN</h3><button class="btn btn-primary" onclick="changePin()">Change PIN</button></div><div class="card"><h3>🗑️ Reset All Data</h3><button class="btn btn-danger" onclick="if(confirm(\'Reset ALL data?\')){localStorage.clear();location.reload();}">Reset</button></div>';
}

// === STARS ===
function getStars() { return load('stars', 0); }
function addStars(n, reason) {
  const s = getStars() + n;
  save('stars', s);
  const log = load('star_log', []);
  log.unshift({n, reason, date: new Date().toISOString()});
  if (log.length > 50) log.length = 50;
  save('star_log', log);
  if (n > 0) celebrate();
}
function celebrate() {
  const el = document.createElement('div');
  el.className = 'celebration';
  el.textContent = '⭐';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

// === QURAN ===
function renderQuran() {
  // === Page-based memorization tracker (15-line Madani: 20 pages/juz) ===
  const pages = getJuzPages();
  let totalPages = 0, donePages = 0;
  const cards = ACTIVE_JUZ.map(j => {
    const done = new Set(pages[j] || []);
    donePages += done.size; totalPages += PAGES_PER_JUZ;
    const cells = Array.from({length: PAGES_PER_JUZ}, (_, i) => {
      const p = i + 1;
      return `<div class="page-cell ${done.has(p) ? 'done' : ''}" onclick="togglePage(${j},${p})">${p}</div>`;
    }).join('');
    const pct = Math.round(done.size / PAGES_PER_JUZ * 100);
    const complete = done.size >= PAGES_PER_JUZ;
    return `<div class="juz-block ${complete ? 'complete' : ''}">
      <div class="juz-head"><span>Juz ${j}${complete ? ' ✅' : ''}</span><span>${done.size}/${PAGES_PER_JUZ} pages</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="page-grid">${cells}</div>
    </div>`;
  }).join('');
  const totalPct = totalPages ? Math.round(donePages / totalPages * 100) : 0;
  document.getElementById('juz-pages').innerHTML =
    `<div style="display:flex;justify-content:space-between;font-size:0.85rem;"><span>${donePages}/${totalPages} pages</span><span>${totalPct}%</span></div>
     <div class="progress-bar" style="margin:4px 0 16px;"><div class="progress-fill" style="width:${totalPct}%"></div></div>${cards}`;

  // === Today's revision log (multiple entries per day) ===
  const status = (typeof getJuzStatus === 'function') ? getJuzStatus() : {};
  let juzList = Object.keys(status).filter(j => status[j] === 'complete' || status[j] === 'in_progress').map(Number);
  if (juzList.length === 0) juzList = ACTIVE_JUZ.slice();
  juzList.sort((a, b) => a - b);
  const juzOpts = juzList.map(j => `<option value="${j}">Juz ${j}</option>`).join('');
  const confMap = {Struggling:'😟', OK:'😐', Good:'😊', Confident:'🤩'};
  const dayRevs = getRevisions(today());
  const counts = {Struggling:0, OK:0, Good:0, Confident:0};
  dayRevs.forEach(r => { if (counts[r.confidence] !== undefined) counts[r.confidence]++; });
  const chip = (label, val, n) => `<button class="btn btn-sm" style="border:1px solid var(--border);${revFilter === val ? 'background:var(--accent);color:#fff;' : 'background:var(--bg);color:var(--text);'}" onclick="setRevFilter('${val}')">${label} ${n}</button>`;
  const summaryHtml = dayRevs.length === 0 ? '' : `
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
      ${chip('All', '', dayRevs.length)}
      ${chip('😟', 'Struggling', counts.Struggling)}
      ${chip('😐', 'OK', counts.OK)}
      ${chip('😊', 'Good', counts.Good)}
      ${chip('🤩', 'Confident', counts.Confident)}
    </div>`;
  const visible = dayRevs.map((r, i) => ({r, i})).filter(({r}) => !revFilter || r.confidence === revFilter);
  const entriesHtml = dayRevs.length === 0
    ? '<p style="color:var(--muted);font-size:0.8rem;">No revision logged yet today. Add one below.</p>'
    : (visible.length === 0
      ? '<p style="color:var(--muted);font-size:0.8rem;">No entries match this filter.</p>'
      : visible.map(({r, i}) => {
          const juzLbl = r.juz === 'all' ? 'All' : (r.juz ? 'Juz ' + r.juz : '—');
          const conf = confMap[r.confidence] || '';
          return `<div style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:0.85rem;">
          <div style="flex:1;">
            <b>${juzLbl}</b>${r.pages ? ` · ${esc(r.pages)} pp` : ''} ${conf}
            ${r.notes ? `<div style="color:var(--muted);font-size:0.8rem;">${esc(r.notes)}</div>` : ''}
            ${r.time ? `<div style="color:var(--muted);font-size:0.7rem;">⏰ ${r.time}</div>` : ''}
          </div>
          <button class="btn btn-sm btn-danger" onclick="removeRevision(${i})">✕</button>
        </div>`;
        }).join(''));
  document.getElementById('exam-log').innerHTML = `
    ${summaryHtml}
    <div id="revision-entries">${entriesHtml}</div>
    <div style="display:flex;gap:6px;margin-top:10px;">
      <select id="rev-juz" style="flex:1;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:0.85rem;">
        <option value="">Which Juz?</option>${juzOpts}<option value="all">All</option>
      </select>
      <input id="rev-pages" style="flex:1;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:0.85rem;" placeholder="Pages covered">
      <select id="rev-conf" style="flex:1;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:0.85rem;">
        <option value="">Confidence</option>
        <option value="Struggling">😟 Struggling</option>
        <option value="OK">😐 OK</option>
        <option value="Good">😊 Good</option>
        <option value="Confident">🤩 Confident</option>
      </select>
    </div>
    <input id="rev-notes" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:0.85rem;margin-top:6px;" placeholder="Notes — weak spots, mistakes, focus...">
    <button class="btn btn-primary btn-sm" style="margin-top:8px;width:100%;" onclick="addRevision()">+ Add revision</button>`;
}

let revFilter = '';
function setRevFilter(v) { revFilter = (revFilter === v) ? '' : v; renderQuran(); }
function getRevisions(d) {
  const key = 'exam_' + dateKey(d);
  const v = load(key, []);
  if (Array.isArray(v)) return v;
  // Migrate legacy single-object revision into a one-item array
  if (v && typeof v === 'object' && (v.juz || v.pages || v.confidence || v.notes)) {
    const arr = [{juz: v.juz || '', pages: v.pages || '', confidence: v.confidence || '', notes: v.notes || '', time: ''}];
    save(key, arr);
    return arr;
  }
  return [];
}
function addRevision() {
  const juz = document.getElementById('rev-juz').value;
  const pages = document.getElementById('rev-pages').value.trim();
  const confidence = document.getElementById('rev-conf').value;
  const notes = document.getElementById('rev-notes').value.trim();
  if (!juz && !pages && !confidence && !notes) return;
  const key = 'exam_' + dateKey(today());
  const arr = getRevisions(today());
  arr.push({juz, pages, confidence, notes, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})});
  save(key, arr);
  renderQuran();
}
function removeRevision(i) {
  const key = 'exam_' + dateKey(today());
  const arr = getRevisions(today());
  arr.splice(i, 1);
  save(key, arr);
  renderQuran();
}
function toggleSurah(juz, n, checked) {
  const progress = load('surah_' + juz, {});
  const wasChecked = progress[n] || false;
  progress[n] = checked;
  save('surah_' + juz, progress);
  if (checked && !wasChecked) addStars(3, `Surah ${n} marked confident`);
  renderQuran();
}

// === PLANNER ===
function getRoutine() { return load('routine', DEFAULT_ROUTINE); }
function getDayTasks(d) {
  const key = 'tasks_' + dateKey(d);
  let tasks = load(key, null);
  if (!tasks) { tasks = getRoutine().map(r => ({...r, done: false})); save(key, tasks); }
  return tasks;
}
function renderPlanner() {
  const d = currentDay;
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('planner-date').textContent = `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
  const tasks = getDayTasks(d);
  document.getElementById('planner-tasks').innerHTML = `<h3>📋 Schedule</h3>` + tasks.map((t,i) => `
    <div class="check-item ${t.done?'done':''}">
      <input type="checkbox" ${t.done?'checked':''} onchange="toggleTask(${i},this.checked)">
      <span class="time">${t.time}</span>
      <label>${t.task}</label>
    </div>`).join('');
}
function toggleTask(i, checked) {
  const key = 'tasks_' + dateKey(currentDay);
  const tasks = load(key, []);
  const wasDone = tasks[i].done;
  tasks[i].done = checked;
  save(key, tasks);
  if (checked && !wasDone) {
    addStars(1, tasks[i].task);
    // Check if all done
    if (tasks.every(t => t.done)) addStars(5, 'All daily tasks complete! 🎉');
  }
  updateStreak();
  renderPlanner();
}
function changeDay(delta) { currentDay.setDate(currentDay.getDate() + delta); renderPlanner(); }

// === ROUTINE ===
function renderRoutine() {
  const routine = getRoutine();
  document.getElementById('routine-list').innerHTML = routine.map((r,i) => `
    <div class="time-block">
      <span class="time-label">${r.time}</span>
      <span style="flex:1;font-size:0.9rem;">${r.task}</span>
      <button class="btn btn-sm btn-danger" onclick="removeRoutineItem(${i})">✕</button>
    </div>`).join('');
}
function addRoutineItem() {
  const time = document.getElementById('new-time').value;
  const task = document.getElementById('new-task').value.trim();
  if (!time || !task) return;
  const routine = getRoutine();
  routine.push({time, task});
  routine.sort((a,b) => a.time.localeCompare(b.time));
  save('routine', routine);
  document.getElementById('new-time').value = '';
  document.getElementById('new-task').value = '';
  renderRoutine();
}
function removeRoutineItem(i) { const r = getRoutine(); r.splice(i,1); save('routine',r); renderRoutine(); }

// === REWARDS ===
function getRewardsShop() { return load('rewards_shop', DEFAULT_REWARDS); }
function renderRewards() {
  document.getElementById('star-count').textContent = getStars();
  const shop = getRewardsShop();
  const stars = getStars();
  document.getElementById('rewards-shop').innerHTML = shop.map((r,i) => `
    <div class="reward-item">
      <span class="name">${r.name}</span>
      <span class="cost">${r.cost} ⭐</span>
      <button ${stars < r.cost ? 'disabled' : ''} onclick="redeemReward(${i})">Redeem</button>
    </div>`).join('');
  const log = load('star_log', []);
  document.getElementById('reward-log').innerHTML = log.slice(0,20).map(l => {
    const d = new Date(l.date);
    return `<div>${l.n > 0 ? '+' : ''}${l.n} ⭐ ${l.reason} <span style="float:right;color:var(--muted)">${d.toLocaleDateString()}</span></div>`;
  }).join('') || '<div>No activity yet</div>';
}
function redeemReward(i) {
  const shop = getRewardsShop();
  const r = shop[i];
  if (getStars() < r.cost) return;
  if (!confirm(`Redeem "${r.name}" for ${r.cost} ⭐?`)) return;
  addStars(-r.cost, `Redeemed: ${r.name}`);
  renderRewards();
}
function addReward() {
  const name = document.getElementById('new-reward-name').value.trim();
  const cost = parseInt(document.getElementById('new-reward-cost').value);
  if (!name || !cost) return;
  const shop = getRewardsShop();
  shop.push({name, cost});
  shop.sort((a,b) => a.cost - b.cost);
  save('rewards_shop', shop);
  document.getElementById('new-reward-name').value = '';
  document.getElementById('new-reward-cost').value = '';
  renderRewards();
}

// === STREAK ===
function updateStreak() {
  let streak = 0;
  let d = new Date(today());
  const todayTasks = load('tasks_' + dateKey(d), null);
  if (todayTasks && todayTasks.length > 0 && todayTasks.every(t => t.done)) {
    streak = 1; d.setDate(d.getDate()-1);
  } else { d.setDate(d.getDate()-1); }
  for (let i = 0; i < 365; i++) {
    const tasks = load('tasks_' + dateKey(d), null);
    if (tasks && tasks.length > 0 && tasks.every(t => t.done)) { streak++; d.setDate(d.getDate()-1); }
    else break;
  }
  // 7-day streak bonus (award once per streak milestone)
  const lastStreakBonus = load('last_streak_bonus', 0);
  if (streak >= 7 && streak - lastStreakBonus >= 7) {
    addStars(20, `🔥 ${streak}-day streak bonus!`);
    save('last_streak_bonus', streak);
  }
  save('streak', streak);
}

// === DASHBOARD ===
function renderDashboard() {
  const daysLeft = Math.max(0, Math.ceil((GOAL_DATE - today()) / 86400000));
  document.getElementById('countdown').innerHTML = daysLeft > 0
    ? `<div class="days">${daysLeft}</div><div class="label">${GOAL_LABEL}</div>`
    : `<div class="days">🎯</div><div class="label">Goal time! بالتوفيق</div>`;
  updateStreak();
  const streak = load('streak', 0);
  document.getElementById('streak').innerHTML = `<span class="fire">🔥</span><span class="count">${streak}</span><span>day streak</span><span style="margin-left:auto;">⭐ ${getStars()}</span>`;
  const pages = getJuzPages();
  let donePages = 0; const totalPages = ACTIVE_JUZ.length * PAGES_PER_JUZ;
  ACTIVE_JUZ.forEach(j => donePages += (pages[j] || []).length);
  const juzDone = (typeof getJuzStatus === 'function') ? Object.values(getJuzStatus()).filter(v => v === 'complete').length : 0;
  const todayTasks = getDayTasks(today());
  const todayDone = todayTasks.filter(t => t.done).length;
  document.getElementById('stats').innerHTML = `
    <div class="stat"><div class="num">${donePages}/${totalPages}</div><div class="label">Pages</div></div>
    <div class="stat"><div class="num">${todayDone}/${todayTasks.length}</div><div class="label">Today</div></div>
    <div class="stat"><div class="num">${juzDone}</div><div class="label">Juz ✓</div></div>`;
  const pending = todayTasks.filter(t => !t.done);
  document.getElementById('today-summary').innerHTML = pending.length === 0
    ? `<p style="color:var(--ok);font-weight:600;">✅ All done! MashaAllah!</p>`
    : pending.slice(0,4).map(t => `<div class="check-item"><span class="time">${t.time}</span><label>${t.task}</label></div>`).join('');

  // Needs Attention
  const issues = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today()); d.setDate(d.getDate() - i);
    const h = load('hifdh_' + dateKey(d), null);
    if (!h) continue;
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${days[d.getDay()]} ${d.getDate()}`;
    ['sabaq','sabqi','manzil','online','online_sabqi','online_manzil'].forEach(field => {
      if (h[field]?.surah && (h[field].status === 'repeat' || h[field].status === 'missed')) {
        const s = ALL_SURAHS.find(x => x.n == h[field].surah);
        const name = s ? s.name : 'Surah ' + h[field].surah;
        const range = h[field].from ? ` ${h[field].from}-${h[field].to||''}` : '';
        const icon = h[field].status === 'repeat' ? '🔁' : '❌';
        const type = field.includes('online') ? '💻' : field === 'sabaq' ? '📗' : field === 'sabqi' ? '📘' : '📙';
        issues.push(`<div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:0.85rem;">${type} ${name}${range} — ${icon} ${h[field].status === 'repeat' ? 'Repeat' : 'Missed'} <span style="color:var(--muted);font-size:0.75rem;">(${label})</span></div>`);
      }
    });
  }
  document.getElementById('needs-attention').innerHTML = issues.length === 0
    ? '<h3 style="color:var(--ok);">✅ All Good!</h3><p style="font-size:0.85rem;color:var(--muted);">No repeats or missed sessions this week.</p>'
    : `<h3 style="color:var(--danger);">⚠️ Needs Attention</h3>${issues.slice(0,5).join('')}${issues.length > 5 ? `<p style="font-size:0.75rem;color:var(--muted);margin-top:6px;">+${issues.length-5} more...</p>` : ''}`;
}

