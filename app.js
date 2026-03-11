/* ═══════════════════════════════════════════
   StudyPulse 学脉 — Application Logic
   Premium interactions + particle canvas
   ═══════════════════════════════════════════ */

// ── State ──
let currentStudentIndex = 0;
let currentProblemIndex = 0;
let practiceCount = 0;
let practiceCorrect = 0;
let selectedOption = null;
let timerInterval = null;
let practiceStartTime = null;
let currentPage = 'landing';
let filteredProblems = [...MOCK_PROBLEMS];

// ══════════ INIT ══════════
document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initScrollObserver();
  initNavScroll();
  initApp();
  setTimeout(() => {
    if (currentPage === 'landing') triggerPopup('welcome');
  }, 4000);
});

function initApp() {
  loadCurrentStudent();
  populateFilters();
  renderCommunityPosts('all');
  renderLeaderboard();
  renderUserList();
  animateHeroNumbers();
  renderHeroMiniHeatmap();
  renderHeroSparkline();
  initCardGlow();
}

// ══════════ PARTICLE CANVAS ══════════
function initParticleCanvas() {
  const c = document.getElementById('bgCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w, h, particles = [];
  const N = 60;

  function resize() {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < N; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.3 + 0.05
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(129,140,248,${p.alpha})`;
      ctx.fill();
    }
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(129,140,248,${0.03 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// ══════════ SCROLL ANIMATIONS ══════════
function initScrollObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-anim]').forEach(el => observer.observe(el));
}

function initNavScroll() {
  let last = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    document.getElementById('navbar').classList.toggle('scrolled', y > 20);
    last = y;
  }, { passive: true });
}

// ══════════ NAVIGATION ══════════
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) { el.classList.add('active'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  const nl = document.querySelector(`.nav-link[data-page="${page}"]`);
  if (nl) nl.classList.add('active');
  currentPage = page;
  if (page === 'dashboard') initDashboard();
  if (page === 'practice') initPractice();
  if (page === 'community') initCommunity();
  if (page === 'analytics') initAnalytics();
  document.getElementById('navLinks').classList.remove('open');
  // Re-observe new elements
  setTimeout(initScrollObserver, 100);
}

function toggleMobileNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ══════════ USER ══════════
function loadCurrentStudent() {
  const s = MOCK_STUDENTS[currentStudentIndex];
  document.getElementById('userAvatar').src = s.avatar;
  document.getElementById('userName').textContent = s.name;
  document.getElementById('userRank').textContent = s.rank;
}

function toggleUserPanel() {
  document.getElementById('userPanel').classList.toggle('show');
}

function renderUserList() {
  const el = document.getElementById('userList');
  el.innerHTML = MOCK_STUDENTS.slice(0, 20).map((s, i) => `
    <div class="usr-item ${i === currentStudentIndex ? 'active' : ''}" onclick="switchUser(${i})">
      <img src="${s.avatar}" alt="">
      <div><div class="un">${s.name}</div><div class="us">${s.school} · ${s.class}</div></div>
    </div>`).join('');
}

function switchUser(i) {
  currentStudentIndex = i;
  loadCurrentStudent();
  renderUserList();
  toggleUserPanel();
  if (currentPage === 'dashboard') initDashboard();
  if (currentPage === 'analytics') initAnalytics();
  showToast(`已切换到 ${MOCK_STUDENTS[i].name}`, 'info');
}

// Close panel on outside click
document.addEventListener('click', e => {
  const p = document.getElementById('userPanel');
  const u = document.getElementById('currentUser');
  if (p && p.classList.contains('show') && !p.contains(e.target) && !u.contains(e.target)) p.classList.remove('show');
});

// ══════════ CARD GLOW TRACKING ══════════
function initCardGlow() {
  document.addEventListener('mousemove', e => {
    document.querySelectorAll('.dcard, .scard, .b-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });
}

// ══════════ HERO MINI VISUALS ══════════
function renderHeroMiniHeatmap() {
  const el = document.getElementById('miniHeatmap');
  if (!el) return;
  let html = '';
  for (let i = 0; i < 32; i++) {
    const v = Math.random();
    const h = v * 120;
    html += `<div class="mh-cell" style="background:hsl(${h},65%,${18 + v * 28}%)"></div>`;
  }
  el.innerHTML = html;
}

function renderHeroSparkline() {
  const el = document.getElementById('heroSparkline');
  if (!el) return;
  const pts = [];
  let y = 30;
  for (let x = 0; x <= 180; x += 12) {
    y += (Math.random() - 0.45) * 8;
    y = Math.max(5, Math.min(45, y));
    pts.push(`${x},${y}`);
  }
  const line = pts.join(' ');
  el.innerHTML = `
    <defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#818CF8"/><stop offset="100%" stop-color="#06B6D4"/></linearGradient></defs>
    <polyline points="${line}" fill="none" stroke="url(#sg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="0,50 ${line} 180,50" fill="url(#sg)" opacity="0.06"/>`;
}

// ══════════ DASHBOARD ══════════
function initDashboard() {
  const s = MOCK_STUDENTS[currentStudentIndex];
  document.getElementById('dashUserName').textContent = s.name;
  document.getElementById('streakCount').textContent = s.streak;
  const rate = parseFloat(s.correctRate);
  document.getElementById('dashSubtitle').textContent =
    rate > 0.75 ? '表现优秀！继续保持 🌟' :
    rate > 0.6 ? '稳步提升，加油 💪' : '多练薄弱题吧 🎯';

  animateValue('totalProblems', 0, s.totalProblems, 800);
  document.getElementById('correctRate').textContent = (rate * 100).toFixed(1) + '%';
  animateValue('pulsePoints', 0, s.pulsePoints, 800);
  document.getElementById('dashRank').textContent = s.rank;

  renderHeatmap(s);
  renderWeakPoints(s);
  renderTrendChart();
  renderGoals();
  renderActivity(s);

  setTimeout(() => {
    if (currentPage === 'dashboard' && s.weakAreas.length)
      triggerPopup('weakness', s.weakAreas[0]);
  }, 5000);
}

function renderHeatmap(s) {
  const el = document.getElementById('heatmapContainer');
  el.innerHTML = '';
  for (const [cat, topics] of Object.entries(s.mastery)) {
    for (const [topic, points] of Object.entries(topics)) {
      const row = document.createElement('div');
      row.className = 'hm-row';
      const lbl = document.createElement('span');
      lbl.className = 'hm-label';
      lbl.textContent = topic;
      lbl.title = `${cat} > ${topic}`;
      row.appendChild(lbl);
      for (const [pt, d] of Object.entries(points)) {
        const cell = document.createElement('div');
        cell.className = 'hm-cell';
        const m = d.level;
        const h = m * 120;
        cell.style.background = `hsl(${h},65%,${18 + m * 28}%)`;
        cell.title = `${pt}: ${(m * 100).toFixed(0)}%`;
        cell.onclick = () => showToast(`${pt}: ${(m * 100).toFixed(1)}%`, m < 0.4 ? 'error' : 'success');
        row.appendChild(cell);
      }
      el.appendChild(row);
    }
  }
}

function renderWeakPoints(s) {
  const el = document.getElementById('weakPoints');
  el.innerHTML = s.weakAreas.slice(0, 5).map(w => {
    const pct = (w.mastery * 100).toFixed(0);
    const clr = w.mastery < 0.2 ? '#EF4444' : w.mastery < 0.3 ? '#F59E0B' : '#EC4899';
    return `<div class="weak-item"><span class="weak-name">${w.point}</span><div class="weak-bar"><div class="weak-bar-fill" style="width:${pct}%;background:${clr}"></div></div><span class="weak-val">${pct}%</span></div>`;
  }).join('');
}

function renderTrendChart() {
  const el = document.getElementById('trendChart');
  const days = ['一', '二', '三', '四', '五', '六', '日'];
  const rates = days.map(() => 40 + Math.random() * 45);
  const max = Math.max(...rates);
  // Build SVG sparkline + bars
  const w = 100, h = 140, pad = 10;
  const pts = rates.map((r, i) => {
    const x = pad + (i / (rates.length - 1)) * (w - pad * 2);
    const y = h - pad - (r / 100) * (h - pad * 2);
    return `${x},${y}`;
  });
  const lineStr = pts.join(' ');
  const areaStr = `${pad},${h - pad} ${lineStr} ${w - pad},${h - pad}`;
  el.innerHTML = `
    <svg viewBox="0 0 ${w} ${h + 20}" style="width:100%;height:180px">
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#818CF8" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#818CF8" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="tlg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#818CF8"/>
          <stop offset="100%" stop-color="#06B6D4"/>
        </linearGradient>
      </defs>
      <polygon points="${areaStr}" fill="url(#tg)"/>
      <polyline points="${lineStr}" fill="none" stroke="url(#tlg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      ${rates.map((r, i) => {
        const x = pad + (i / (rates.length - 1)) * (w - pad * 2);
        const y = h - pad - (r / 100) * (h - pad * 2);
        return `<circle cx="${x}" cy="${y}" r="2.5" fill="#818CF8" stroke="var(--bg)" stroke-width="1.5"/>
                <text x="${x}" y="${h + 14}" text-anchor="middle" fill="#475569" font-size="5" font-family="Inter">周${days[i]}</text>`;
      }).join('')}
    </svg>
  `;
}

function renderGoals() {
  const el = document.getElementById('goalsContainer');
  const goals = [
    { text: '做题 30 道', val: '18/30', pct: 60 },
    { text: '正确率 > 70%', val: '78%', pct: 80 },
    { text: '练习 2 个薄弱点', val: '1/2', pct: 50 },
    { text: '社区互动', val: '✅', pct: 100 }
  ];
  el.innerHTML = goals.map(g => `
    <div class="goal-row"><span class="goal-text">${g.text}</span><div class="goal-bar"><div class="goal-fill" style="width:${g.pct}%"></div></div><span class="goal-val">${g.val}</span></div>
  `).join('');
}

function renderActivity(s) {
  const el = document.getElementById('activityList');
  const acts = [];
  for (let i = 0; i < 8; i++) {
    const p = MOCK_PROBLEMS[Math.floor(Math.random() * MOCK_PROBLEMS.length)];
    acts.push({ p, ok: Math.random() > 0.35, t: i === 0 ? '刚刚' : `${Math.floor(Math.random() * 120)}分钟前` });
  }
  el.innerHTML = acts.map(a => `
    <div class="act-item"><div class="act-dot ${a.ok ? 'ok' : 'err'}"></div><div class="act-info"><div>${a.p.knowledgePoint} · ${a.p.type}</div><div class="act-meta">${a.p.category} · ${a.p.difficultyLabel}</div></div><span class="act-time">${a.t}</span></div>
  `).join('');
}

// ══════════ PRACTICE ══════════
function initPractice() {
  filteredProblems = [...MOCK_PROBLEMS];
  loadProblem();
  startTimer();
}

function populateFilters() {
  const cf = document.getElementById('categoryFilter');
  [...new Set(MOCK_PROBLEMS.map(p => p.category))].forEach(c => {
    const o = document.createElement('option'); o.value = c; o.textContent = c; cf.appendChild(o);
  });
}

function filterProblems() {
  const cat = document.getElementById('categoryFilter').value;
  const topic = document.getElementById('topicFilter').value;
  const diff = document.getElementById('difficultyFilter').value;
  const type = document.getElementById('typeFilter').value;
  filteredProblems = MOCK_PROBLEMS.filter(p => {
    if (cat && p.category !== cat) return false;
    if (topic && p.topic !== topic) return false;
    if (diff && p.difficultyLabel !== diff) return false;
    if (type && p.type !== type) return false;
    return true;
  });
  if (cat) {
    const ts = [...new Set(MOCK_PROBLEMS.filter(p => p.category === cat).map(p => p.topic))];
    const tf = document.getElementById('topicFilter');
    tf.innerHTML = '<option value="">全部专题</option>';
    ts.forEach(t => { const o = document.createElement('option'); o.value = t; o.textContent = t; tf.appendChild(o); });
  }
  showToast(`筛选到 ${filteredProblems.length} 题`, 'info');
  currentProblemIndex = 0;
  loadProblem();
}

function setPracticeMode(mode, btn) {
  document.querySelectorAll('.mode-chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const s = MOCK_STUDENTS[currentStudentIndex];
  if (mode === 'smart') {
    const wk = s.weakAreas.map(w => w.point);
    filteredProblems = MOCK_PROBLEMS.filter(p => wk.includes(p.knowledgePoint));
    if (!filteredProblems.length) filteredProblems = [...MOCK_PROBLEMS];
    showToast('🤖 AI 已推荐薄弱题目', 'success');
    triggerPopup('smartPractice');
  } else if (mode === 'wrong') {
    filteredProblems = MOCK_PROBLEMS.filter(() => Math.random() > 0.7);
    showToast('📝 错题集已加载', 'info');
  } else if (mode === 'exam') {
    filteredProblems = MOCK_PROBLEMS.filter(() => Math.random() > 0.85);
    showToast('📝 模拟考：30题 60分钟', 'info');
  } else {
    filteredProblems = [...MOCK_PROBLEMS];
  }
  currentProblemIndex = 0;
  loadProblem();
}

function loadProblem() {
  if (!filteredProblems.length) {
    document.getElementById('problemQuestion').textContent = '没有符合条件的题目';
    return;
  }
  const p = filteredProblems[currentProblemIndex % filteredProblems.length];
  selectedOption = null;
  document.getElementById('problemId').textContent = p.id;
  document.getElementById('problemCategory').textContent = p.category;
  document.getElementById('problemTopic').textContent = p.topic;
  document.getElementById('problemKP').textContent = p.knowledgePoint;
  document.getElementById('problemDiff').textContent = p.difficultyLabel;
  document.getElementById('problemType').textContent = p.type;
  document.getElementById('problemQuestion').textContent = p.question;
  const optC = document.getElementById('problemOptions');
  const inpC = document.getElementById('problemInput');
  if (p.type === '选择题' && p.options) {
    optC.style.display = 'flex';
    inpC.style.display = 'none';
    optC.innerHTML = p.options.map((o, i) => `<button class="opt-btn" onclick="selectOption(this,${i})">${o}</button>`).join('');
  } else {
    optC.style.display = 'none';
    inpC.style.display = 'block';
    document.getElementById('answerInput').value = '';
  }
  document.getElementById('problemResult').style.display = 'none';
  document.getElementById('submitBtn').style.display = '';
  document.getElementById('nextBtn').style.display = 'none';
}

function selectOption(btn, i) {
  document.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  selectedOption = i;
}

function submitAnswer() {
  const p = filteredProblems[currentProblemIndex % filteredProblems.length];
  const s = MOCK_STUDENTS[currentStudentIndex];
  let kp = 0.5;
  for (const topics of Object.values(s.mastery))
    for (const pts of Object.values(topics))
      if (pts[p.knowledgePoint]) kp = pts[p.knowledgePoint].level;

  const ok = Math.random() < (kp - p.difficulty + 0.55);
  const res = document.getElementById('problemResult');
  const hdr = document.getElementById('resultHeader');
  const exp = document.getElementById('resultExplanation');
  res.style.display = 'block';
  document.getElementById('submitBtn').style.display = 'none';
  document.getElementById('nextBtn').style.display = '';
  if (ok) {
    hdr.textContent = '✅ 回答正确！';
    hdr.className = 'p-result-banner ok';
    practiceCorrect++;
  } else {
    hdr.textContent = '❌ 回答错误';
    hdr.className = 'p-result-banner err';
    if (practiceCount > 0 && practiceCount % 3 === 0)
      setTimeout(() => triggerPopup('consecutive', p), 800);
  }
  exp.innerHTML = `<strong>知识点：</strong>${p.knowledgePoint}<br><strong>答案：</strong>${p.answer}<br><strong>解析：</strong>${p.explanation}`;
  if (p.type === '选择题') {
    document.querySelectorAll('.opt-btn').forEach((b, i) => {
      if (i === 0) b.classList.add('correct');
      if (i === selectedOption && !ok) b.classList.add('wrong');
    });
  }
  renderSimilar(p);
  practiceCount++;
  updatePracticeProgress();
}

function renderSimilar(prob) {
  const sim = MOCK_PROBLEMS.filter(p => p.id !== prob.id && p.knowledgePoint === prob.knowledgePoint && Math.abs(p.difficulty - prob.difficulty) < 0.2).slice(0, 3);
  document.getElementById('similarList').innerHTML = sim.map(s => `
    <div class="sim-item" onclick="loadSpecific('${s.id}')"><span>${s.knowledgePoint} · ${s.type} · ${s.difficultyLabel}</span><span>→ 练习</span></div>
  `).join('');
}

function loadSpecific(id) {
  const i = filteredProblems.findIndex(p => p.id === id);
  if (i >= 0) { currentProblemIndex = i; loadProblem(); window.scrollTo({ top: 200, behavior: 'smooth' }); }
}

function nextProblem() { currentProblemIndex++; loadProblem(); window.scrollTo({ top: 200, behavior: 'smooth' }); }
function skipProblem() { currentProblemIndex++; loadProblem(); }

function startWeakPointPractice() {
  showPage('practice');
  setTimeout(() => {
    const s = MOCK_STUDENTS[currentStudentIndex];
    const wk = s.weakAreas.map(w => w.point);
    filteredProblems = MOCK_PROBLEMS.filter(p => wk.includes(p.knowledgePoint));
    if (!filteredProblems.length) filteredProblems = [...MOCK_PROBLEMS];
    currentProblemIndex = 0;
    loadProblem();
    showToast('🎯 薄弱专项练习', 'success');
  }, 300);
}

function updatePracticeProgress() {
  document.getElementById('practiceCount').textContent = practiceCount;
  document.getElementById('practiceCorrect').textContent = practiceCorrect;
  const r = practiceCount ? ((practiceCorrect / practiceCount) * 100).toFixed(0) : 0;
  document.getElementById('practiceRate').textContent = r + '%';
  const fill = document.getElementById('practiceFill');
  if (fill) fill.style.width = r + '%';
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  practiceStartTime = Date.now();
  timerInterval = setInterval(() => {
    const e = Math.floor((Date.now() - practiceStartTime) / 1000);
    const m = String(Math.floor(e / 60)).padStart(2, '0');
    const s = String(e % 60).padStart(2, '0');
    const el = document.getElementById('practiceTimer');
    if (el) el.textContent = `${m}:${s}`;
  }, 1000);
}

// ══════════ COMMUNITY ══════════
let commPostsShown = 0;
let commCurrentFilter = 'all';
let commSearchQuery = '';
let currentDetailPost = null;

function getFilteredComm() {
  let posts = commCurrentFilter === 'all' ? [...MOCK_POSTS] : MOCK_POSTS.filter(p => p.type === commCurrentFilter);
  if (commSearchQuery) {
    const q = commSearchQuery.toLowerCase();
    posts = posts.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
  }
  return posts;
}

function initCommunity() {
  const s = MOCK_STUDENTS[currentStudentIndex];
  const el = id => document.getElementById(id);
  el('commAvatar').src = s.avatar;
  el('commName').textContent = s.name;
  el('commSchool').textContent = s.school + ' · ' + s.grade;
  el('commMyPosts').textContent = rand2(5, 30);
  el('commMyLikes').textContent = fmtN(rand2(100, 5000));
  el('commMyFollowers').textContent = rand2(20, 200);
  el('commPostCount').textContent = MOCK_POSTS.length;
  el('commUserCount').textContent = MOCK_STUDENTS.length;
  el('commTodayCount').textContent = rand2(30, 80);
  el('commLikeCount').textContent = fmtN(MOCK_POSTS.reduce((s, p) => s + p.likes, 0));
}
function rand2(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function renderCommunityPosts(filter) {
  commCurrentFilter = filter;
  commPostsShown = 0;
  document.getElementById('postsGrid').innerHTML = '';
  loadMorePosts();
  if (typeof initCommunity === 'function') initCommunity();
}

function loadMorePosts() {
  const g = document.getElementById('postsGrid');
  const posts = getFilteredComm();
  const batch = posts.slice(commPostsShown, commPostsShown + 24);
  const coverClasses = ['cover-1','cover-2','cover-3','cover-4','cover-5','cover-6','cover-7','cover-8'];
  const coverEmojis = ['📐','⚡','🧲','🔬','💡','📊','🎯','🧪','🔭','🌊','⚛️','📝','🧠','📈','✏️','🔑'];
  const typeClassMap = {'解题笔记':'pc-type-note','错题分析':'pc-type-wrong','打卡成就':'pc-type-streak','求助帖':'pc-type-help','经验分享':'pc-type-exp'};

  batch.forEach((p, idx) => {
    const i = commPostsShown + idx;
    const hasCover = p.images > 0 || i % 3 !== 2;
    const coverCls = coverClasses[i % coverClasses.length];
    const coverEmoji = coverEmojis[i % coverEmojis.length];
    const typeCls = typeClassMap[p.type] || 'pc-type-note';

    const card = document.createElement('div');
    card.className = 'post-card' + (p.isHot ? ' hot' : '');
    card.onclick = () => openPostDetail(p);

    let html = '';
    if (hasCover) {
      html += `<div class="pc-cover-gradient ${coverCls}"><span>${coverEmoji} ${p.type}</span></div>`;
    }
    html += `<div class="pc-inner">`;
    html += `<span class="pc-type-badge ${typeCls}">${p.icon} ${p.type}</span>`;
    html += `<div class="pc-title">${p.title}</div>`;
    html += `<div class="pc-body">${p.content}</div>`;
    html += `<div class="pc-tags">${p.tags.map(t => `<span class="pc-tag" onclick="event.stopPropagation();searchByTag('${t}')">#${t}</span>`).join('')}</div>`;
    html += `<div class="pc-author"><img src="${p.authorAvatar}" class="pc-avatar" alt=""><div><div class="pc-name">${p.authorName}</div><div class="pc-school">${p.authorSchool}</div></div><span class="pc-rank">${p.authorRank}</span></div>`;
    html += `<div class="pc-footer">`;
    html += `<span class="pc-stat" onclick="event.stopPropagation();likePost(this,${p.likes})">❤️ ${fmtN(p.likes)}</span>`;
    html += `<span class="pc-stat">💬 ${p.comments}</span>`;
    html += `<span class="pc-stat">⭐ ${fmtN(p.bookmarks || 0)}</span>`;
    html += `<span class="pc-views">👁 ${fmtN(p.views || 0)}</span>`;
    html += `</div></div>`;

    card.innerHTML = html;
    g.appendChild(card);
  });

  commPostsShown += batch.length;
  const loadBtn = document.getElementById('commLoadMore');
  if (loadBtn) loadBtn.style.display = commPostsShown >= posts.length ? 'none' : 'block';
}

function likePost(el, current) {
  el.classList.add('liked');
  el.innerHTML = `❤️ ${fmtN(current + 1)}`;
  el.style.transform = 'scale(1.3)';
  setTimeout(() => { el.style.transform = ''; }, 200);
}

function searchPosts(query) {
  commSearchQuery = query;
  renderCommunityPosts(commCurrentFilter);
}

function searchByTag(tag) {
  const input = document.getElementById('commSearch');
  if (input) input.value = tag;
  commSearchQuery = tag;
  renderCommunityPosts(commCurrentFilter);
  showToast(`搜索: ${tag}`, 'info');
}

function filterPosts(type, btn) {
  document.querySelectorAll('.ctab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  commSearchQuery = '';
  const input = document.getElementById('commSearch');
  if (input) input.value = '';
  renderCommunityPosts(type);
}

// Post Detail Modal
function openPostDetail(post) {
  currentDetailPost = post;
  const modal = document.getElementById('postDetailModal');
  const coverClasses = ['cover-1','cover-2','cover-3','cover-4','cover-5','cover-6','cover-7','cover-8'];
  const coverEmojis = ['📐','⚡','🧲','🔬','💡','📊','🎯','🧪'];
  const hash = post.id.charCodeAt(1) + post.id.charCodeAt(2);
  const coverCls = coverClasses[hash % coverClasses.length];
  const coverEmoji = coverEmojis[hash % coverEmojis.length];

  document.getElementById('pdCover').className = 'pd-cover ' + coverCls;
  document.getElementById('pdCover').innerHTML = `<span style="position:relative;z-index:1">${coverEmoji}</span>`;
  document.getElementById('pdContent').innerHTML = `<h2 style="font-size:1.2rem;font-weight:800;margin-bottom:16px;color:var(--text)">${post.icon} ${post.title}</h2><div style="white-space:pre-wrap;line-height:1.85">${post.content}</div>`;

  document.getElementById('pdAuthor').innerHTML = `
    <img src="${post.authorAvatar}" alt="">
    <div class="pd-author-info">
      <div class="pd-a-name">${post.authorName}</div>
      <div class="pd-a-school">${post.authorSchool} · ${post.authorGrade || ''}</div>
      <span class="pd-a-rank">${post.authorRank}</span>
    </div>`;

  document.getElementById('pdMeta').innerHTML = `
    <span class="pd-meta-item">👁 ${fmtN(post.views || 0)} 浏览</span>
    <span class="pd-meta-item">⭐ ${fmtN(post.bookmarks || 0)} 收藏</span>
    <span class="pd-meta-item">📅 ${fmtDate(post.createdAt)}</span>
    ${post.tags.map(t => `<span class="pc-tag">#${t}</span>`).join('')}`;

  document.getElementById('pdActions').innerHTML = `
    <button class="pd-action-btn" onclick="this.classList.toggle('active');this.innerHTML=this.classList.contains('active')?'❤️ ${fmtN(post.likes+1)}':'🤍 ${fmtN(post.likes)}'">🤍 ${fmtN(post.likes)}</button>
    <button class="pd-action-btn" onclick="this.classList.toggle('active')">⭐ 收藏</button>
    <button class="pd-action-btn" onclick="showToast('已复制链接','success')">🔗 分享</button>`;

  document.getElementById('pdCommentCount').textContent = post.comments;

  const cl = post.commentsList || [];
  document.getElementById('pdComments').innerHTML = cl.map(c => `
    <div class="pd-comment">
      <img src="${c.authorAvatar}" alt="">
      <div class="pd-comment-body">
        <div class="pd-comment-name">${c.authorName}</div>
        <div class="pd-comment-text">${c.content}</div>
        <div class="pd-comment-meta"><span>${c.time}</span><span>❤️ ${fmtN(c.likes)}</span></div>
      </div>
    </div>`).join('') || '<div style="padding:20px;text-align:center;color:var(--text-3);font-size:.85rem">暂无评论，快来第一个评论吧 ✍️</div>';

  modal.classList.add('show');
}

function closePostDetail(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('postDetailModal').classList.remove('show');
}

function addComment() {
  const input = document.getElementById('pdCommentInput');
  const text = input.value.trim();
  if (!text) return;
  const s = MOCK_STUDENTS[currentStudentIndex];
  const commentsEl = document.getElementById('pdComments');
  const newComment = document.createElement('div');
  newComment.className = 'pd-comment';
  newComment.style.animation = 'fadeSlideUp .3s ease';
  newComment.innerHTML = `
    <img src="${s.avatar}" alt="">
    <div class="pd-comment-body">
      <div class="pd-comment-name">${s.name}</div>
      <div class="pd-comment-text">${text}</div>
      <div class="pd-comment-meta"><span>刚刚</span><span>❤️ 0</span></div>
    </div>`;
  commentsEl.insertBefore(newComment, commentsEl.firstChild);
  input.value = '';
  showToast('💬 评论发布成功', 'success');
}

function renderLeaderboard() {
  const el = document.getElementById('leaderboard');
  const top = [...MOCK_STUDENTS].sort((a, b) => b.pulsePoints - a.pulsePoints).slice(0, 7);
  el.innerHTML = top.map((s, i) => {
    const cls = i === 0 ? 'g' : i === 1 ? 's' : i === 2 ? 'b' : 'n';
    return `<div class="lb-row"><span class="lb-pos ${cls}">${i + 1}</span><img src="${s.avatar}" class="lb-av" alt=""><span class="lb-nm">${s.name}</span><span class="lb-sc">${fmtN(s.pulsePoints)}</span></div>`;
  }).join('');
}

function showNewPostModal() { document.getElementById('newPostModal').classList.add('show'); }
function closeNewPostModal(e) { if (e && e.target !== e.currentTarget) return; document.getElementById('newPostModal').classList.remove('show'); }
function toggleTag(b) { b.classList.toggle('active'); }

function submitPost() {
  const title = document.getElementById('postTitle').value;
  const content = document.getElementById('postContent').value;
  if (!title || !content) { showToast('请填写标题和内容', 'error'); return; }
  closeNewPostModal();
  showToast('🎉 发布成功！', 'success');
  const s = MOCK_STUDENTS[currentStudentIndex];
  MOCK_POSTS.unshift({
    id: 'NEW' + Date.now(), authorName: s.name, authorAvatar: s.avatar,
    authorSchool: s.school, authorRank: s.rank, type: document.getElementById('postType').value,
    icon: '📝', title, content, likes: 0, comments: 0, tags: ['物理'],
    createdAt: new Date().toISOString(), isHot: false
  });
  renderCommunityPosts('all');
  document.getElementById('postTitle').value = '';
  document.getElementById('postContent').value = '';
}

// ══════════ ANALYTICS ══════════
function initAnalytics() {
  const s = MOCK_STUDENTS[currentStudentIndex];
  document.getElementById('anaTotal').textContent = fmtN(s.totalProblems);
  document.getElementById('anaRate').textContent = (parseFloat(s.correctRate) * 100).toFixed(1) + '%';
  document.getElementById('anaTime').textContent = Math.floor(s.studyTime / 60) + 'h';
  document.getElementById('anaWeak').textContent = s.weakAreas.length;
  renderCategoryChart(s);
  renderRadarChart(s);
  renderTypeChart(s);
  renderDifficultyChart();
  renderAIInsights(s);
  renderComparison(s);
}

function renderCategoryChart(s) {
  const el = document.getElementById('categoryChart');
  const cats = Object.keys(s.mastery);
  const colors = ['#818CF8', '#06B6D4', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];
  el.innerHTML = cats.map((c, i) => {
    let t = 0, n = 0;
    for (const pts of Object.values(s.mastery[c])) for (const d of Object.values(pts)) { t += d.level; n++; }
    const avg = n ? (t / n * 100) : 0;
    return `<div class="cat-row"><span class="cat-lbl">${c}</span><div class="cat-track"><div class="cat-fill" style="width:${avg}%;background:${colors[i % 6]}"><span class="cat-val">${avg.toFixed(0)}%</span></div></div></div>`;
  }).join('');
}

function renderRadarChart(s) {
  const svg = document.getElementById('radarSvg');
  const cats = Object.keys(s.mastery);
  const n = cats.length, cx = 150, cy = 150, r = 110;
  const vals = cats.map(c => {
    let t = 0, cnt = 0;
    for (const pts of Object.values(s.mastery[c])) for (const d of Object.values(pts)) { t += d.level; cnt++; }
    return cnt ? t / cnt : 0;
  });
  let h = '<defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#818CF8"/><stop offset="100%" stop-color="#06B6D4"/></linearGradient></defs>';
  for (let ring = 1; ring <= 4; ring++) {
    const rr = r * ring / 4;
    const pts = cats.map((_, i) => { const a = Math.PI * 2 * i / n - Math.PI / 2; return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`; }).join(' ');
    h += `<polygon points="${pts}" fill="none" stroke="rgba(129,140,248,.08)" stroke-width="1"/>`;
  }
  cats.forEach((_, i) => {
    const a = Math.PI * 2 * i / n - Math.PI / 2;
    h += `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(a)}" y2="${cy + r * Math.sin(a)}" stroke="rgba(129,140,248,.08)"/>`;
  });
  const dp = vals.map((v, i) => { const a = Math.PI * 2 * i / n - Math.PI / 2; return `${cx + r * v * Math.cos(a)},${cy + r * v * Math.sin(a)}`; }).join(' ');
  h += `<polygon points="${dp}" fill="url(#rg)" fill-opacity="0.15" stroke="url(#rg)" stroke-width="2"/>`;
  vals.forEach((v, i) => {
    const a = Math.PI * 2 * i / n - Math.PI / 2;
    const x = cx + r * v * Math.cos(a), y = cy + r * v * Math.sin(a);
    h += `<circle cx="${x}" cy="${y}" r="3.5" fill="#818CF8" stroke="#050510" stroke-width="2"/>`;
    const lx = cx + (r + 18) * Math.cos(a), ly = cy + (r + 18) * Math.sin(a);
    const anch = lx > cx + 10 ? 'start' : lx < cx - 10 ? 'end' : 'middle';
    h += `<text x="${lx}" y="${ly}" fill="#64748B" font-size="10" text-anchor="${anch}" dominant-baseline="middle" font-family="Inter,sans-serif">${cats[i]}</text>`;
  });
  svg.innerHTML = h;
}

function renderTypeChart(s) {
  const el = document.getElementById('typeChart');
  const types = ['选择题', '填空题', '计算题', '实验题', '综合题'];
  const colors = ['#818CF8', '#06B6D4', '#EC4899', '#F59E0B', '#10B981'];
  const vals = types.map(() => 20 + Math.random() * 50);
  const total = vals.reduce((s, v) => s + v, 0);
  let svgH = '<svg viewBox="0 0 180 180" width="160" height="160">';
  let cum = 0;
  vals.forEach((v, i) => {
    const pct = v / total;
    const sa = cum * Math.PI * 2 - Math.PI / 2; cum += pct;
    const ea = cum * Math.PI * 2 - Math.PI / 2;
    const x1 = 90 + 65 * Math.cos(sa), y1 = 90 + 65 * Math.sin(sa);
    const x2 = 90 + 65 * Math.cos(ea), y2 = 90 + 65 * Math.sin(ea);
    const lg = pct > 0.5 ? 1 : 0;
    svgH += `<path d="M90 90 L${x1} ${y1} A65 65 0 ${lg} 1 ${x2} ${y2} Z" fill="${colors[i]}" opacity="0.75" stroke="var(--bg-1)" stroke-width="2"/>`;
  });
  svgH += '<circle cx="90" cy="90" r="35" fill="var(--bg-card)"/>';
  svgH += '<text x="90" y="88" fill="white" font-size="12" font-weight="800" text-anchor="middle" font-family="Inter">题型</text>';
  svgH += '<text x="90" y="102" fill="#64748B" font-size="9" text-anchor="middle" font-family="Inter">分布</text>';
  svgH += '</svg>';
  const leg = types.map((t, i) => `<span class="dl-item"><span class="dl-dot" style="background:${colors[i]}"></span>${t} ${(vals[i] / total * 100).toFixed(0)}%</span>`).join('');
  el.innerHTML = svgH + `<div class="donut-legend">${leg}</div>`;
}

function renderDifficultyChart() {
  const el = document.getElementById('difficultyChart');
  const diffs = ['基础', '中等', '较难', '难', '竞赛'];
  const rates = [85, 72, 58, 41, 25].map(v => v + (Math.random() - 0.5) * 10);
  const colors = ['#10B981', '#06B6D4', '#818CF8', '#EC4899', '#EF4444'];
  el.innerHTML = diffs.map((d, i) => {
    const h = rates[i] * 1.6;
    return `<div class="diff-col"><div class="diff-bar" style="height:${h}px;background:${colors[i]}"><span class="diff-bar-v">${rates[i].toFixed(0)}%</span></div><span class="diff-lbl">${d}</span></div>`;
  }).join('');
}

function renderAIInsights(s) {
  const el = document.getElementById('aiInsights');
  // Dynamic insights based on actual student data
  const weakTop = s.weakAreas[0];
  const insights = [
    { ico: '💡', txt: `<strong>${weakTop ? weakTop.point : '电磁感应'}</strong>需要重点加强，连续5次正确率低于40%` },
    { ico: '🎯', txt: `建议先巩固<strong>法拉第定律</strong>再进入<strong>楞次定律</strong>，知识点有前置依赖关系` },
    { ico: '🌟', txt: `<strong>力学</strong>板块进步显著！正确率从62%提升到78%，继续保持` },
    { ico: '⏰', txt: `<strong>光学</strong>已14天未练习，根据艾宾浩斯遗忘曲线，建议立即复习` },
    { ico: '📈', txt: `本周学习时长比上周增加15%，做题效率提升32%` },
    { ico: '🤖', txt: `AI 预测：按当前进度，<strong>期末考试</strong>预估提分 <strong style="color:var(--emerald)">12-18分</strong>` }
  ];
  el.innerHTML = insights.map(i => `<div class="ai-ins"><span class="ai-ins-ico">${i.ico}</span><div class="ai-ins-txt">${i.txt}</div></div>`).join('');
}

function renderComparison(s) {
  const el = document.getElementById('comparisonChart');
  const cats = Object.keys(s.mastery);
  el.innerHTML = cats.map(c => {
    let t = 0, n = 0;
    for (const pts of Object.values(s.mastery[c])) for (const d of Object.values(pts)) { t += d.level; n++; }
    const my = n ? t / n * 100 : 50;
    const avg = 35 + Math.random() * 30;
    return `<div class="comp-row"><span class="comp-lbl">${c}</span><div class="comp-tracks"><div class="comp-bar me" style="width:${my}%"></div><div class="comp-bar avg" style="width:${avg}%"></div></div></div>`;
  }).join('') + '<div class="comp-legend"><span>🟣 我</span><span>⚪ 校均</span></div>';
}

function setTimeRange(r, btn) {
  document.querySelectorAll('.tt').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  initAnalytics();
  showToast(`已切换`, 'info');
}

// ══════════ POPUP SYSTEM ══════════
function triggerPopup(type, data) {
  const ov = document.getElementById('popupOverlay');
  const ct = document.getElementById('popupContainer');
  const ic = document.getElementById('popupIcon');
  const tt = document.getElementById('popupTitle');
  const bd = document.getElementById('popupBody');
  const ac = document.getElementById('popupActions');

  switch (type) {
    case 'welcome':
      ic.textContent = '💓'; tt.textContent = '欢迎来到 StudyPulse 学脉';
      const ws = MOCK_STUDENTS[currentStudentIndex];
      bd.innerHTML = `<p>AI 已分析你的学习数据：</p><ul style="margin:10px 0;padding-left:18px;color:var(--text-2)"><li>连续学习 <strong style="color:var(--pink)">${ws.streak}</strong> 天</li><li>累计 <strong style="color:var(--violet)">${ws.totalProblems}</strong> 题</li><li>发现 <strong style="color:var(--red)">${ws.weakAreas.length}</strong> 个薄弱知识点</li></ul><p>点击「开始学习」，AI 为你推荐最优练习路径。</p>`;
      ac.innerHTML = `<button class="btn btn-glass" onclick="closePopup()">稍后</button><button class="btn btn-glow" onclick="closePopup();showPage('dashboard')">开始学习 →</button>`;
      break;
    case 'weakness':
      ic.textContent = '⚠️'; tt.textContent = '薄弱知识点提醒';
      bd.innerHTML = `<p>AI 检测到<strong style="color:var(--red)">"${data.point}"</strong>掌握度仅 <strong style="color:var(--red)">${(data.mastery * 100).toFixed(0)}%</strong></p><p style="margin-top:10px;color:var(--text-2)">${data.category} > ${data.topic}</p><div style="margin-top:14px;padding:10px;background:rgba(99,102,241,.06);border-radius:8px;font-size:.85rem">📌 AI 已准备 5 道针对性练习题</div>`;
      ac.innerHTML = `<button class="btn btn-glass" onclick="closePopup()">知道了</button><button class="btn btn-glow" onclick="closePopup();startWeakPointPractice()">🎯 专项练习</button>`;
      break;
    case 'consecutive':
      ic.textContent = '🤔'; tt.textContent = '连续答错提醒';
      bd.innerHTML = `<p>你在<strong style="color:var(--pink)">"${data.knowledgePoint}"</strong>连续答错。</p><div style="margin-top:12px;padding:10px;background:rgba(6,182,212,.06);border-radius:8px;font-size:.85rem">🎬 推荐：3分钟核心概念讲解视频</div><div style="margin-top:6px;padding:10px;background:rgba(236,72,153,.06);border-radius:8px;font-size:.85rem">📚 基础巩固练习（5道）</div>`;
      ac.innerHTML = `<button class="btn btn-glass" onclick="closePopup()">继续</button><button class="btn btn-glow" onclick="closePopup();showToast('📚 已切换基础练习','success')">基础练习</button>`;
      break;
    case 'smartPractice':
      ic.textContent = '🤖'; tt.textContent = 'AI 推荐就绪';
      const sp = MOCK_STUDENTS[currentStudentIndex];
      const wl = sp.weakAreas.slice(0, 3).map(w => `<li>"${w.point}" (${(w.mastery * 100).toFixed(0)}%)</li>`).join('');
      bd.innerHTML = `<p>根据你的数据，AI 重点推荐：</p><ol style="margin:10px 0;padding-left:18px;color:var(--text-2)">${wl}</ol><p style="font-size:.82rem;color:var(--text-3)">题目按「略高于当前水平」的原则筛选</p>`;
      ac.innerHTML = `<button class="btn btn-glow" onclick="closePopup()">开始 💪</button>`;
      break;
  }
  ov.classList.add('show');
  ct.classList.add('show');
}

function closePopup() {
  document.getElementById('popupOverlay').classList.remove('show');
  document.getElementById('popupContainer').classList.remove('show');
}

// ══════════ TOAST ══════════
function showToast(msg, type = 'info') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(100%)';
    t.style.transition = 'all .3s ease';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

// ══════════ UTILS ══════════
function animateValue(id, from, to, dur) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  function tick(t) {
    const p = Math.min((t - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmtN(Math.floor(from + (to - from) * e));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function animateHeroNumbers() {
  document.querySelectorAll('.tk-val').forEach(el => {
    const target = parseInt(el.dataset.target);
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const start = performance.now();
        function tick(t) {
          const p = Math.min((t - start) / 2000, 1);
          const e = 1 - Math.pow(1 - p, 3);
          el.textContent = fmtN(Math.floor(target * e));
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    });
    obs.observe(el);
  });
}

function fmtN(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

function fmtDate(d) {
  const diff = (Date.now() - new Date(d)) / 60000;
  if (diff < 60) return Math.floor(diff) + '分钟前';
  if (diff < 1440) return Math.floor(diff / 60) + '小时前';
  if (diff < 10080) return Math.floor(diff / 1440) + '天前';
  return new Date(d).toLocaleDateString('zh-CN');
}
