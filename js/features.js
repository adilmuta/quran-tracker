function initFeaturesHTML() {
  document.getElementById('juzmap').innerHTML = '<div class="card"><h3>🗺️ Juz Progress Map</h3><p style="font-size:0.8rem;color:var(--muted);margin-bottom:12px;">Tap a juz to cycle: Not Started → In Progress → Complete</p><div id="juz-grid"></div><div style="margin-top:12px;font-size:0.75rem;color:var(--muted);">🟢 Complete & healthy · 🟡 Needs revision · 🔴 Missed recently · ⬜ Not started · 🔵 In progress</div></div>';
  document.getElementById('goals').innerHTML = '<div class="card"><h3>🎯 Active Goals</h3><div id="goals-list"></div></div><div class="card"><h3>➕ New Goal</h3><div class="routine-editor"><input id="goal-name" placeholder="Goal (e.g. Complete Juz 1)"><input id="goal-date" type="date"><button class="btn btn-primary" onclick="addGoal()">Add Goal</button></div></div>';
  document.getElementById('badges').innerHTML = '<div class="card"><h3>🏆 Achievement Badges</h3><div id="badges-grid"></div></div>';
  document.getElementById('vocab').innerHTML = '<div class="card" style="background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;"><h3 style="color:#fff;">📚 Word of the Day</h3><div id="vocab-wod"></div></div><div class="card"><h3>📊 Vocabulary Progress</h3><div id="vocab-progress"></div></div><div class="card"><h3>📖 Word List</h3><div id="vocab-list"></div></div><div class="card"><h3>➕ Add Word</h3><div class="routine-editor"><input id="vocab-word" placeholder="Word"><input id="vocab-def" placeholder="Meaning (kid-friendly)"><input id="vocab-ex" placeholder="Example sentence (optional)"><button class="btn btn-primary" onclick="addWord()">Add Word</button></div></div>';
}

// === JUZ MAP ===
function getJuzStatus() { return load('juz_status', {26:'complete',27:'complete',28:'complete',29:'complete',30:'complete'}); }

function getJuzHealth(juzNum) {
  // Check last 7 days of hifdh logs for this juz's surahs
  let completes = 0, repeats = 0, missed = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today()); d.setDate(d.getDate() - i);
    const h = load('hifdh_' + dateKey(d), null);
    if (!h) continue;
    ['sabaq','sabqi','manzil','online','online_sabqi','online_manzil'].forEach(field => {
      if (h[field]?.surah) {
        // Check if this surah belongs to this juz (approximate)
        const sn = parseInt(h[field].surah);
        const juzForSurah = getJuzForSurah(sn);
        if (juzForSurah === juzNum) {
          if (h[field].status === 'complete') completes++;
          if (h[field].status === 'repeat') repeats++;
          if (h[field].status === 'missed') missed++;
        }
      }
    });
  }
  if (missed > 0) return 'red';
  if (repeats > completes && repeats > 0) return 'yellow';
  if (completes > 0) return 'green';
  return 'none';
}

function getJuzForSurah(surahNum) {
  // Simplified juz lookup
  if (surahNum <= 2) return 1; // (front juz approx; page tracker is the source of truth)
  if (surahNum >= 78) return 30;
  if (surahNum >= 67) return 29;
  if (surahNum >= 58) return 28;
  if (surahNum >= 51) return 27;
  if (surahNum >= 46) return 26;
  return Math.ceil(surahNum / 2); // rough approximation for middle juz
}

function renderJuzMap() {
  const status = getJuzStatus();
  const pages = (typeof getJuzPages === 'function') ? getJuzPages() : {};
  const perJuz = (typeof PAGES_PER_JUZ !== 'undefined') ? PAGES_PER_JUZ : 20;
  let html = '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;">';
  for (let j = 1; j <= 30; j++) {
    let s = status[j] || 'not_started';
    const pc = (pages[j] || []).length;
    if (pc >= perJuz) s = 'complete';
    else if (pc > 0 && s !== 'complete') s = 'in_progress';
    const health = s === 'complete' ? getJuzHealth(j) : 'none';
    let bg = 'var(--border)'; let color = 'var(--text)'; let border = 'var(--border)';
    if (s === 'complete' && health === 'green') { bg = 'var(--ok)'; color = 'white'; }
    else if (s === 'complete' && health === 'yellow') { bg = 'var(--warn)'; color = 'var(--text)'; }
    else if (s === 'complete' && health === 'red') { bg = 'var(--danger)'; color = 'white'; }
    else if (s === 'complete') { bg = 'var(--ok)'; color = 'white'; }
    else if (s === 'in_progress') { bg = 'var(--accent2)'; color = 'white'; border = 'var(--accent)'; }
    html += `<div onclick="toggleJuz(${j})" style="aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:10px;background:${bg};color:${color};border:2px solid ${border};cursor:pointer;font-size:0.8rem;font-weight:600;">
      <div style="font-size:1.1rem;">${j}</div>
      <div style="font-size:0.6rem;opacity:0.8;">${s==='complete'?'✓':s==='in_progress'?'◐':''}</div>
    </div>`;
  }
  html += '</div>';
  document.getElementById('juz-grid').innerHTML = html;
}

function toggleJuz(j) {
  const status = getJuzStatus();
  const current = status[j] || 'not_started';
  const next = current === 'not_started' ? 'in_progress' : current === 'in_progress' ? 'complete' : 'not_started';
  status[j] = next;
  save('juz_status', status);
  renderJuzMap();
  checkBadges();
}

// === GOALS ===
function getGoals() { return load('goals', (typeof DEFAULT_GOALS !== 'undefined' ? DEFAULT_GOALS.slice() : [])); }

function renderGoals() {
  const goals = getGoals();
  document.getElementById('goals-list').innerHTML = goals.length === 0
    ? '<p style="color:var(--muted);">No goals set. Add one below!</p>'
    : goals.map((g,i) => {
      const deadline = new Date(g.date);
      const daysLeft = Math.ceil((deadline - today()) / 86400000);
      const status = g.done ? '✅' : daysLeft < 0 ? '⏰ Overdue' : `${daysLeft} days left`;
      return `<div style="padding:12px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;${g.done?'opacity:0.6;':''}">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:600;font-size:0.9rem;">${g.name}</span>
          <span style="font-size:0.75rem;color:${daysLeft<3&&!g.done?'var(--danger)':'var(--muted)'};">${status}</span>
        </div>
        <div style="display:flex;gap:6px;margin-top:8px;">
          ${!g.done ? `<button class="btn btn-sm btn-primary" onclick="completeGoal(${i})">✅ Done!</button>` : ''}
          <button class="btn btn-sm btn-danger" onclick="removeGoal(${i})">✕</button>
        </div>
      </div>`;
    }).join('');
}

function addGoal() {
  const name = document.getElementById('goal-name').value.trim();
  const date = document.getElementById('goal-date').value;
  if (!name || !date) return;
  const goals = getGoals();
  goals.push({name, date, done: false});
  save('goals', goals);
  document.getElementById('goal-name').value = '';
  document.getElementById('goal-date').value = '';
  renderGoals();
}

function completeGoal(i) {
  const goals = getGoals();
  goals[i].done = true;
  save('goals', goals);
  addStars(10, `Goal complete: ${goals[i].name}`);
  renderGoals();
  checkBadges();
}

function removeGoal(i) {
  const goals = getGoals();
  goals.splice(i, 1);
  save('goals', goals);
  renderGoals();
}

// === BADGES ===
const BADGE_DEFS = [
  {id:'first_week',name:'First Week',icon:'🌱',desc:'Used the app for 7 days',check:()=>load('streak',0)>=7},
  {id:'streak_30',name:'Consistent',icon:'🔥',desc:'30-day streak',check:()=>load('streak',0)>=30},
  {id:'streak_90',name:'Unstoppable',icon:'💎',desc:'90-day streak',check:()=>load('streak',0)>=90},
  {id:'juz_1',name:'First Juz',icon:'📗',desc:'Completed first juz',check:()=>{const s=getJuzStatus();return Object.values(s).filter(v=>v==='complete').length>=1;}},
  {id:'juz_5',name:'Five Down',icon:'📚',desc:'Completed 5 juz',check:()=>{const s=getJuzStatus();return Object.values(s).filter(v=>v==='complete').length>=5;}},
  {id:'juz_10',name:'Quarter Hafidha',icon:'🌟',desc:'Completed 10 juz',check:()=>{const s=getJuzStatus();return Object.values(s).filter(v=>v==='complete').length>=10;}},
  {id:'juz_20',name:'Two-Thirds',icon:'👑',desc:'Completed 20 juz',check:()=>{const s=getJuzStatus();return Object.values(s).filter(v=>v==='complete').length>=20;}},
  {id:'juz_30',name:'Hafidha!',icon:'🕋',desc:'Completed all 30 juz!',check:()=>{const s=getJuzStatus();return Object.values(s).filter(v=>v==='complete').length>=30;}},
  {id:'goal_1',name:'Goal Getter',icon:'🎯',desc:'Completed first goal',check:()=>getGoals().some(g=>g.done)},
  {id:'words_10',name:'Word Wizard',icon:'🔤',desc:'Learned 10 new words',check:()=>load('vocab',[]).filter(w=>w.learned).length>=10},
  {id:'stars_50',name:'Star Collector',icon:'⭐',desc:'Earned 50 stars',check:()=>getStars()>=50},
  {id:'stars_200',name:'Star Master',icon:'🌠',desc:'Earned 200 stars',check:()=>getStars()>=200},
  {id:'perfect_week',name:'Perfect Week',icon:'🏆',desc:'All tasks done for 7 days straight',check:()=>load('streak',0)>=7},
];

function checkBadges() {
  const earned = load('badges_earned', []);
  let newBadge = false;
  BADGE_DEFS.forEach(b => {
    if (!earned.includes(b.id) && b.check()) {
      earned.push(b.id);
      newBadge = true;
      addStars(10, `Badge earned: ${b.name} ${b.icon}`);
    }
  });
  if (newBadge) save('badges_earned', earned);
}

function renderBadges() {
  checkBadges();
  const earned = load('badges_earned', []);
  document.getElementById('badges-grid').innerHTML = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">` +
    BADGE_DEFS.map(b => {
      const has = earned.includes(b.id);
      return `<div style="text-align:center;padding:12px 8px;border-radius:10px;border:1px solid var(--border);${has?'':'opacity:0.3;filter:grayscale(1);'}">
        <div style="font-size:2rem;">${b.icon}</div>
        <div style="font-size:0.75rem;font-weight:600;margin-top:4px;">${b.name}</div>
        <div style="font-size:0.65rem;color:var(--muted);">${b.desc}</div>
      </div>`;
    }).join('') + '</div>';
}


// === VOCABULARY (4th-grade prep) ===
const DEFAULT_VOCAB = [
  {word:'accomplish', def:'to finish or succeed at something', example:'She worked hard to accomplish her goal.', learned:false},
  {word:'ancient', def:'very, very old; from long ago', example:'We read about ancient Egypt.', learned:false},
  {word:'brief', def:'short; not lasting long', example:'He gave a brief answer.', learned:false},
  {word:'cooperate', def:'to work together with others', example:'The team had to cooperate to win.', learned:false},
  {word:'curious', def:'wanting to learn or know more', example:'She was curious about how it worked.', learned:false},
  {word:'demonstrate', def:'to show how something works', example:'The teacher will demonstrate the experiment.', learned:false},
  {word:'eager', def:'really wanting to do something', example:'He was eager to start the game.', learned:false},
  {word:'enormous', def:'very, very big', example:'The whale was enormous.', learned:false},
  {word:'fortunate', def:'lucky', example:'We were fortunate to have good weather.', learned:false},
  {word:'frequent', def:'happening often', example:'There are frequent buses on this road.', learned:false},
  {word:'generous', def:'happy to share and give', example:'She is generous with her toys.', learned:false},
  {word:'identify', def:'to point out or name something', example:'Can you identify this bird?', learned:false},
  {word:'observe', def:'to watch carefully', example:'We observe the moon at night.', learned:false},
  {word:'peculiar', def:'strange or unusual', example:'The soup had a peculiar taste.', learned:false},
  {word:'persuade', def:'to convince someone to do something', example:'He tried to persuade me to come.', learned:false},
  {word:'predict', def:'to guess what will happen next', example:'Can you predict the ending?', learned:false},
  {word:'reluctant', def:'not wanting to do something', example:'She was reluctant to leave the party.', learned:false},
  {word:'summarize', def:'to tell the main points briefly', example:'Summarize the story in two sentences.', learned:false},
  {word:'vivid', def:'very bright and clear', example:'He has a vivid imagination.', learned:false},
  {word:'wander', def:'to walk around without a clear plan', example:'We let the puppy wander in the yard.', learned:false},
  // — Science —
  {word:'habitat', def:'the natural home of an animal or plant', topic:'Science', example:'A pond is the frog\u2019s habitat.', learned:false},
  {word:'evaporate', def:'to slowly turn from liquid into vapor', topic:'Science', example:'The puddle will evaporate in the sun.', learned:false},
  {word:'organism', def:'any living thing', topic:'Science', example:'A bee is a tiny organism.', learned:false},
  {word:'experiment', def:'a test to find out what happens', topic:'Science', example:'We did an experiment with magnets.', learned:false},
  {word:'energy', def:'the power to do work or move', topic:'Science', example:'The sun gives us energy.', learned:false},
  // — Math —
  {word:'estimate', def:'to make a smart guess about an amount', topic:'Math', example:'Estimate how many jellybeans are in the jar.', learned:false},
  {word:'equivalent', def:'equal in value', topic:'Math', example:'One half is equivalent to two quarters.', learned:false},
  {word:'remainder', def:'the amount left over after dividing', topic:'Math', example:'10 divided by 3 has a remainder of 1.', learned:false},
  {word:'perimeter', def:'the distance all the way around a shape', topic:'Math', example:'We measured the perimeter of the rug.', learned:false},
  {word:'symmetry', def:'when both halves match exactly', topic:'Math', example:'A butterfly\u2019s wings show symmetry.', learned:false},
  // — Social Studies —
  {word:'community', def:'a group of people living in the same area', topic:'Social Studies', example:'Our community held a clean-up day.', learned:false},
  {word:'government', def:'the group that makes rules for a place', topic:'Social Studies', example:'The government builds roads and schools.', learned:false},
  {word:'culture', def:'the customs and beliefs of a group', topic:'Social Studies', example:'We learned about the culture of Japan.', learned:false},
  {word:'region', def:'a large area of land with shared features', topic:'Social Studies', example:'The desert region is very dry.', learned:false},
  {word:'citizen', def:'a member of a country or community', topic:'Social Studies', example:'A good citizen helps others.', learned:false},
  // — Reading & Language —
  {word:'compare', def:'to look at how things are alike', topic:'Reading', example:'Compare the two stories.', learned:false},
  {word:'contrast', def:'to look at how things are different', topic:'Reading', example:'Contrast summer and winter.', learned:false},
  {word:'describe', def:'to tell what something is like', topic:'Reading', example:'Describe your favorite place.', learned:false},
  {word:'conclusion', def:'the ending or a decision you reach', topic:'Reading', example:'What is your conclusion about the ending?', learned:false},
  {word:'opinion', def:'what you think or feel about something', topic:'Reading', example:'In my opinion, dogs are the best pets.', learned:false},
  // — Character —
  {word:'responsible', def:'doing what you are supposed to do', topic:'Character', example:'She is responsible and finishes her chores.', learned:false},
  {word:'patient', def:'able to wait calmly', topic:'Character', example:'Be patient while the cake bakes.', learned:false},
  {word:'honest', def:'telling the truth', topic:'Character', example:'An honest friend tells you the truth.', learned:false},
  {word:'grateful', def:'thankful for what you have', topic:'Character', example:'I am grateful for my family.', learned:false},
  {word:'determined', def:'not giving up on a goal', topic:'Character', example:'She was determined to learn the surah.', learned:false}
];

function getVocab() { return load('vocab', DEFAULT_VOCAB.slice()); }

const VOCAB_DAILY_GOAL = 1;  // new words to learn per day
function vocabLearnedToday() {
  const tk = dateKey(today());
  return getVocab().filter(w => w.learnedDate === tk).length;
}

function getWordOfDay() {
  const vocab = getVocab();
  if (!vocab.length) return null;
  const start = new Date(today().getFullYear(), 0, 0);
  const doy = Math.floor((today() - start) / 86400000);
  const pool = vocab.filter(w => !w.learned);
  const src = pool.length ? pool : vocab;
  return src[doy % src.length];
}

function renderVocab() {
  const vocab = getVocab();
  const learnedCount = vocab.filter(w => w.learned).length;
  const pct = vocab.length ? Math.round(learnedCount / vocab.length * 100) : 0;

  // Word of the day — deterministic by date; prefers an unlearned word
  const pool = vocab.filter(w => !w.learned);
  const wod = getWordOfDay();
  document.getElementById('vocab-wod').innerHTML = wod ? `
    <div style="font-size:1.4rem;font-weight:700;">${esc(wod.word)}</div>
    <div style="font-size:0.9rem;margin-top:4px;">${esc(wod.def)}</div>
    ${wod.example ? `<div style="font-size:0.82rem;opacity:0.9;margin-top:6px;font-style:italic;">“${esc(wod.example)}”</div>` : ''}
    ${pool.length === 0 ? '<div style="font-size:0.8rem;margin-top:8px;">🎉 All words learned! Add more below.</div>' : ''}`
    : '<p style="opacity:0.9;">Add some words below to get started!</p>';

  const learnedTodayN = vocabLearnedToday();
  const todayMet = learnedTodayN >= VOCAB_DAILY_GOAL;
  document.getElementById('vocab-progress').innerHTML = `
    <div style="display:flex;justify-content:space-between;font-size:0.85rem;"><span>${learnedCount}/${vocab.length} words learned</span><span>${pct}%</span></div>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    <div style="font-size:0.8rem;color:${todayMet ? 'var(--ok)' : 'var(--muted)'};margin-top:8px;">${todayMet ? '✅ Today\u2019s goal done' : '🎯 Today\u2019s goal'}: ${learnedTodayN}/${VOCAB_DAILY_GOAL} new word${VOCAB_DAILY_GOAL > 1 ? 's' : ''}${todayMet ? ' — mashaAllah!' : ''}</div>`;

  document.getElementById('vocab-list').innerHTML = vocab.length === 0
    ? '<p style="color:var(--muted);font-size:0.85rem;">No words yet. Add one below.</p>'
    : vocab.map((w, i) => `
      <div style="padding:10px 0;border-bottom:1px solid var(--border);">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-weight:600;font-size:0.95rem;flex:1;${w.learned ? 'color:var(--ok);' : ''}">${esc(w.word)}${w.learned ? ' ✅' : ''}${w.topic ? ` <span style="font-size:0.65rem;font-weight:500;background:var(--bg);border:1px solid var(--border);color:var(--muted);padding:1px 6px;border-radius:10px;">${esc(w.topic)}</span>` : ''}</span>
          <button class="btn btn-sm ${w.learned ? 'btn-primary' : ''}" style="border:1px solid var(--border);${w.learned ? '' : 'background:var(--bg);color:var(--text);'}" onclick="toggleWord(${i})">${w.learned ? 'Learned' : 'Mark learned'}</button>
          <button class="btn btn-sm btn-danger" onclick="removeWord(${i})">✕</button>
        </div>
        <div style="font-size:0.82rem;color:var(--muted);margin-top:2px;">${esc(w.def)}</div>
        ${w.example ? `<div style="font-size:0.78rem;color:var(--muted);font-style:italic;margin-top:2px;">“${esc(w.example)}”</div>` : ''}
      </div>`).join('');
}

function toggleWord(i) {
  const vocab = getVocab();
  const was = vocab[i].learned;
  vocab[i].learned = !was;
  if (!was) vocab[i].learnedDate = dateKey(today()); else delete vocab[i].learnedDate;
  save('vocab', vocab);
  if (!was) {
    if (typeof addStars === 'function') addStars(1, `Learned word: ${vocab[i].word}`);
    const goalKey = 'vocab_goal_' + dateKey(today());
    if (vocabLearnedToday() >= VOCAB_DAILY_GOAL && !load(goalKey, 0)) {
      save(goalKey, 1);
      if (typeof addStars === 'function') addStars(3, '📚 Daily vocab goal met!');
    }
  }
  if (typeof checkBadges === 'function') checkBadges();
  renderVocab();
}

function addWord() {
  const word = document.getElementById('vocab-word').value.trim();
  const def = document.getElementById('vocab-def').value.trim();
  const example = document.getElementById('vocab-ex').value.trim();
  if (!word || !def) return;
  const vocab = getVocab();
  vocab.push({word, def, example, learned: false});
  save('vocab', vocab);
  document.getElementById('vocab-word').value = '';
  document.getElementById('vocab-def').value = '';
  document.getElementById('vocab-ex').value = '';
  renderVocab();
}

function removeWord(i) {
  const vocab = getVocab();
  vocab.splice(i, 1);
  save('vocab', vocab);
  renderVocab();
}

// Merge any new starter words into an existing saved vocab list (idempotent).
function seedVocab() {
  if (localStorage.getItem('_seed_vocab_v2')) return;
  const existing = load('vocab', null);
  if (existing && Array.isArray(existing)) {
    const have = new Set(existing.map(w => (w.word || '').toLowerCase()));
    let added = 0;
    DEFAULT_VOCAB.forEach(w => { if (!have.has(w.word.toLowerCase())) { existing.push({ ...w }); added++; } });
    if (added) save('vocab', existing);
  }
  localStorage.setItem('_seed_vocab_v2', '1');
}
