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
let wrongBook = []; // persisted wrong answers for 错题本
let sessionXP = 0;

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
  let w, h, particles = [], mouse = {x: -999, y: -999};
  const N = 80;
  const colors = [
    {r:129,g:140,b:248}, // violet
    {r:6,g:182,b:212},   // cyan
    {r:236,g:72,b:153},  // pink
    {r:99,g:102,b:241}   // indigo
  ];

  function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, {passive:true});

  for (let i = 0; i < N; i++) {
    const col = colors[Math.floor(Math.random() * colors.length)];
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.8 + 0.4,
      col, alpha: Math.random() * 0.25 + 0.05
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      // Mouse repulsion
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if (dist < 200) { const f = (200-dist)/200*0.3; p.vx += dx/dist*f; p.vy += dy/dist*f; }
      p.vx *= 0.99; p.vy *= 0.99;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.col.r},${p.col.g},${p.col.b},${p.alpha})`;
      ctx.fill();
    }
    // Connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const a = particles[i], b = particles[j];
          const grad = ctx.createLinearGradient(a.x,a.y,b.x,b.y);
          grad.addColorStop(0, `rgba(${a.col.r},${a.col.g},${a.col.b},${0.025*(1-dist/140)})`);
          grad.addColorStop(1, `rgba(${b.col.r},${b.col.g},${b.col.b},${0.025*(1-dist/140)})`);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.6;
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
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    document.getElementById('navbar').classList.toggle('scrolled', y > 20);
    const btt = document.getElementById('backToTop');
    if (btt) btt.classList.toggle('show', y > 400);
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
  if (page === 'wrongbook') initWrongBook();
  if (page === 'daily') initDailyChallenge();
  if (page === 'pk') initPK();
  if (page === 'ai') initAI();
  if (page === 'community') initCommunity();
  if (page === 'leaderboard') initLeaderboard();
  if (page === 'parent') initParent();
  if (page === 'analytics') initAnalytics();
  document.getElementById('navLinks').classList.remove('open');
  reobserve();
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
  renderStreakCalendar(s);
  renderBadges(s);

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
  const s = MOCK_STUDENTS[currentStudentIndex];
  const days = ['一', '二', '三', '四', '五', '六', '日'];
  // Seed consistent data from student's correctRate
  const baseRate = parseFloat(s.correctRate) * 100;
  const seed = s.id.charCodeAt(3) + s.id.charCodeAt(4);
  const rates = days.map((_, i) => {
    const noise = Math.sin(seed + i * 1.7) * 12;
    return Math.max(25, Math.min(95, baseRate + noise + (i * 1.5)));
  });
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
  renderAITasks();
  startTimer();
}

function switchPracticeTab(tab) {
  document.getElementById('pmtAI').classList.toggle('active', tab === 'ai');
  document.getElementById('pmtSelf').classList.toggle('active', tab === 'self');
  document.getElementById('practAIMode').style.display = tab === 'ai' ? 'block' : 'none';
  document.getElementById('practSelfMode').style.display = tab === 'self' ? 'block' : 'none';
  if (tab === 'self') loadProblem();
}

function renderAITasks() {
  const s = MOCK_STUDENTS[currentStudentIndex];
  const weak = s.weakAreas || [];
  const tasks = [
    { icon: '📖', title: '复习：' + (weak[0] ? weak[0].point : '牛顿第二定律'), desc: '观看3分钟概念讲解视频，掌握核心公式和应用场景', tags: ['视频学习', weak[0] ? weak[0].category : '力学'], type: 'learn' },
    { icon: '🎯', title: '专项练习：' + (weak[0] ? weak[0].point : '向心力') + ' × 5题', desc: 'AI为你精选5道针对薄弱知识点的练习题，由易到难', tags: ['AI推荐', '薄弱突破'], type: 'practice' },
    { icon: '📕', title: '错题回顾：重做昨天的错题', desc: '艾宾浩斯间隔重复，巩固已纠正的知识点', tags: ['错题本', '间隔重复'], type: 'review' },
    { icon: '📝', title: '今日模拟：10道综合选择题', desc: '混合各知识点，模拟真实考试选择题节奏', tags: ['模拟考', '综合'], type: 'exam' },
    { icon: '🌐', title: '社区任务：分享一篇学习笔记', desc: '将今天的学习心得分享到学脉圈，帮助同学也帮助自己', tags: ['学脉圈', '社区'], type: 'community' }
  ];
  const doneCount = Math.min(Math.floor(s.totalProblems / 500), 3);
  document.getElementById('paiProgress').textContent = `${doneCount}/5 已完成`;
  document.getElementById('paiTaskList').innerHTML = tasks.map((t, i) => {
    const done = i < doneCount;
    return `<div class="pai-task ${done ? 'done' : ''}" onclick="${done ? '' : 'completeTask(' + i + ',this)'}">
      <div class="pai-task-check">${done ? '✓' : t.icon}</div>
      <div class="pai-task-info">
        <div class="pai-task-title">${t.title}</div>
        <div class="pai-task-desc">${t.desc}</div>
        <div class="pai-task-tags">${t.tags.map(tag => `<span class="pai-task-tag" style="background:rgba(129,140,248,.08);color:var(--violet)">${tag}</span>`).join('')}</div>
      </div>
    </div>`;
  }).join('');
}

function completeTask(idx, el) {
  el.classList.add('done');
  el.querySelector('.pai-task-check').textContent = '✓';
  el.querySelector('.pai-task-title').style.textDecoration = 'line-through';
  sessionXP += 20;
  showToast('+20 XP 任务完成！', 'success');
  spawnConfetti();
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
    filteredProblems = wrongBook.length > 0 ? [...wrongBook] : MOCK_PROBLEMS.filter(() => Math.random() > 0.7);
    showToast(`📝 错题集：${wrongBook.length > 0 ? wrongBook.length + '道错题' : '暂无错题，显示随机题目'}`, 'info');
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
  
  // REAL validation: for multiple choice, option index 0 is always the correct answer in our data
  // For other types, we accept any non-empty answer as correct (demo mode)
  let ok = false;
  if (p.type === '选择题' && p.options) {
    if (selectedOption === null) { showToast('请先选择一个选项', 'error'); return; }
    ok = (selectedOption === 0); // A is always correct in our generated data
  } else {
    const userInput = document.getElementById('answerInput').value.trim();
    if (!userInput) { showToast('请输入答案', 'error'); return; }
    ok = Math.random() < 0.6; // for non-MC, simulate with bias
  }

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
    sessionXP += Math.round(10 + p.difficulty * 20);
    spawnConfetti();
    showToast(`+${Math.round(10 + p.difficulty * 20)} XP`, 'success');
  } else {
    hdr.textContent = '❌ 回答错误';
    hdr.className = 'p-result-banner err';
    // Add to wrong book
    if (!wrongBook.find(w => w.id === p.id)) wrongBook.push(p);
    if (practiceCount > 0 && practiceCount % 3 === 0)
      setTimeout(() => triggerPopup('consecutive', p), 800);
  }

  exp.innerHTML = `<strong>知识点：</strong>${p.knowledgePoint}<br><strong>正确答案：</strong>${p.options ? p.options[0] : p.answer}<br><strong>解析：</strong>${p.explanation}`;
  if (p.type === '选择题') {
    document.querySelectorAll('.opt-btn').forEach((b, i) => {
      b.style.pointerEvents = 'none'; // disable after submit
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
  const xpEl = document.getElementById('sessionXP');
  if (xpEl) xpEl.textContent = sessionXP;
  const wc = document.getElementById('wrongCount');
  if (wc) wc.textContent = wrongBook.length;
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

// ══════════ BADGES ══════════
function renderBadges(s) {
  const badges = [
    { icon: '🔥', name: '初次打卡', desc: '完成第一天学习', check: s => s.streak >= 1 },
    { icon: '⚡', name: '连续7天', desc: '连续学习7天', check: s => s.streak >= 7 },
    { icon: '🌟', name: '月度坚持', desc: '连续学习30天', check: s => s.streak >= 30 },
    { icon: '📝', name: '百题斩', desc: '累计做题100道', check: s => s.totalProblems >= 100 },
    { icon: '🎯', name: '千题王', desc: '累计做题1000道', check: s => s.totalProblems >= 1000 },
    { icon: '💎', name: '刷题狂人', desc: '累计做题3000道', check: s => s.totalProblems >= 3000 },
    { icon: '✅', name: '精准射手', desc: '正确率超过70%', check: s => parseFloat(s.correctRate) > 0.7 },
    { icon: '🏆', name: '学霸认证', desc: '正确率超过85%', check: s => parseFloat(s.correctRate) > 0.85 },
    { icon: '👑', name: '钻石段位', desc: '达到钻石段位', check: s => ['钻石','星耀','王者'].includes(s.rank) },
    { icon: '🌐', name: '社区达人', desc: '发布10篇帖子', check: s => s.badges >= 10 },
    { icon: '⚔️', name: 'PK勇士', desc: '完成10场对战', check: s => s.totalProblems > 500 },
    { icon: '🧠', name: '知识图谱', desc: '所有板块达到60%', check: s => s.weakAreas.length <= 2 }
  ];
  const unlocked = badges.filter(b => b.check(s)).length;
  document.getElementById('badgeCount').textContent = `${unlocked}/12 已解锁`;
  document.getElementById('badgeScroll').innerHTML = badges.map(b => {
    const ok = b.check(s);
    return `<div class="badge-item" title="${b.desc}" onclick="showToast('${b.name}: ${b.desc}', '${ok ? 'success' : 'info'}')">
      <div class="badge-icon ${ok ? 'unlocked' : 'locked'}">${b.icon}</div>
      <div class="badge-name ${ok ? 'unlocked' : ''}">${b.name}</div>
    </div>`;
  }).join('');
}

// ══════════ STREAK CALENDAR ══════════
function renderStreakCalendar(s) {
  const el = document.getElementById('streakCalendar');
  if (!el) return;
  const seed = s.id.charCodeAt(3) * 7 + s.id.charCodeAt(4) * 13;
  const today = new Date(2026, 2, 10);
  let html = '';
  for (let d = 89; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    // Consistent activity level based on student + day
    const daySeed = seed + d * 3 + date.getDay();
    const active = (Math.sin(daySeed) * 0.5 + 0.5); // 0-1
    const level = d < s.streak ? Math.max(0.2, active) : active * 0.7;
    const alpha = level < 0.1 ? 0.03 : level < 0.3 ? 0.12 : level < 0.5 ? 0.3 : level < 0.7 ? 0.55 : 0.85;
    const dateStr = `${date.getMonth()+1}/${date.getDate()}`;
    html += `<div class="sc-day" style="background:rgba(129,140,248,${alpha})" title="${dateStr}: ${level < 0.1 ? '未学习' : Math.round(level*40)+'道题'}"></div>`;
  }
  el.innerHTML = html;
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
  // City/grade scope filters
  const cityEl = document.getElementById('commCityFilter');
  const gradeEl = document.getElementById('commGradeFilter');
  if (cityEl && cityEl.value) posts = posts.filter(p => p.authorSchool && p.authorSchool.includes(cityEl.value));
  if (gradeEl && gradeEl.value) posts = posts.filter(p => p.authorGrade === gradeEl.value);
  return posts;
}

function initCommunity() {
  const s = MOCK_STUDENTS[currentStudentIndex];
  const el = id => document.getElementById(id);
  if(el('commAvatar')) el('commAvatar').src = s.avatar;
  if(el('commName')) el('commName').textContent = s.name;
  if(el('commSchool')) el('commSchool').textContent = s.school + ' · ' + s.grade;
  if(el('commMyPosts')) el('commMyPosts').textContent = rand2(5, 30);
  if(el('commMyLikes')) el('commMyLikes').textContent = fmtN(rand2(100, 5000));
  if(el('commMyFollowers')) el('commMyFollowers').textContent = rand2(20, 200);
  if(el('commPostCount')) el('commPostCount').textContent = MOCK_POSTS.length;
  if(el('commUserCount')) el('commUserCount').textContent = MOCK_STUDENTS.length;
  if(el('commTodayCount')) el('commTodayCount').textContent = rand2(30, 80);
  renderFeatured();
  renderDailyRec();
}
function rand2(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function renderCommunityPosts(filter) {
  commCurrentFilter = filter;
  commPostsShown = 0;
  document.getElementById('postsGrid').innerHTML = '';
  loadMorePosts();
  if (typeof initCommunity === 'function') initCommunity();
}

function renderFeatured() {
  const el = document.getElementById('featuredScroll');
  if (!el) return;
  const hot = [...MOCK_POSTS].sort((a,b) => b.likes - a.likes).slice(0, 10);
  const pals = [['#1e1b4b','#4338ca'],['#164e63','#0891b2'],['#4c1d95','#7c3aed'],['#831843','#db2777'],['#1e3a5f','#0284c7'],['#064e3b','#059669'],['#78350f','#d97706'],['#312e81','#6366f1'],['#701a75','#c026d3'],['#1f2937','#6b7280']];
  el.innerHTML = hot.map((p, i) => {
    const [c1,c2] = pals[i % pals.length];
    return `<div class="cm-feat-card" onclick="openPostDetail(MOCK_POSTS.find(x=>x.id==='${p.id}'))">
      <div class="cm-feat-cover" style="background:linear-gradient(135deg,${c1},${c2})">
        <div class="cm-feat-title">${p.icon} ${p.title}</div>
      </div>
      <div class="cm-feat-meta">
        <img src="${p.authorAvatar}" alt="">
        <span>${p.authorName}</span>
        <span class="fm-likes">❤️ ${fmtN(p.likes)}</span>
      </div>
    </div>`;
  }).join('');
}

function renderDailyRec() {
  const el = document.getElementById('dailyRec');
  if (!el) return;
  const recs = MOCK_POSTS.filter(p => p.type === '解题笔记').slice(0, 8);
  const pals = [['#1e1b4b','#312e81'],['#164e63','#0e7490'],['#4c1d95','#7c3aed'],['#064e3b','#059669']];
  el.innerHTML = recs.map((p, i) => {
    const [c1,c2] = pals[i % pals.length];
    return `<div class="cr-rec-item" onclick="openPostDetail(MOCK_POSTS.find(x=>x.id==='${p.id}'))">
      <div class="cr-rec-thumb" style="background:linear-gradient(135deg,${c1},${c2})">${p.icon}</div>
      <div class="cr-rec-info">
        <div class="cr-rec-title">${p.title}</div>
        <div class="cr-rec-meta">❤️ ${fmtN(p.likes)} · 💬 ${p.comments}</div>
      </div>
    </div>`;
  }).join('');
}

function loadMorePosts() {
  const g = document.getElementById('postsGrid');
  const posts = getFilteredComm();
  const batch = posts.slice(commPostsShown, commPostsShown + 40);

  const palettes = [
    ['#1e1b4b','#3730a3','#818CF8'],['#164e63','#0e7490','#22d3ee'],['#4c1d95','#7c3aed','#c4b5fd'],
    ['#831843','#be185d','#f9a8d4'],['#1e3a5f','#0369a1','#7dd3fc'],['#064e3b','#059669','#6ee7b7'],
    ['#78350f','#b45309','#fcd34d'],['#312e81','#4f46e5','#a5b4fc'],['#701a75','#a21caf','#e879f9'],
    ['#1f2937','#4b5563','#d1d5db']
  ];
  const formulas = ['F=ma','E=mc\u00b2','v=v\u2080+at','\u0394\u03a6/\u0394t','P=IV','W=Fd','\u03bb=h/p','F=kx','PV=nRT','E=h\u03bd'];
  const badgeMap = {'\u89e3\u9898\u7b14\u8bb0':'cm-badge-note','\u9519\u9898\u5206\u6790':'cm-badge-wrong','\u6253\u5361\u6210\u5c31':'cm-badge-streak','\u6c42\u52a9\u5e16':'cm-badge-help','\u7ecf\u9a8c\u5206\u4eab':'cm-badge-exp'};
  const heights = [70,85,100,110,80,95,105,65,115,90];

  batch.forEach((p, idx) => {
    const i = commPostsShown + idx;
    const pal = palettes[i % palettes.length];
    const h = heights[i % heights.length];
    const formula = formulas[i % formulas.length];
    const badge = badgeMap[p.type] || 'cm-badge-note';
    const hasCover = i % 5 !== 4; // 80% have covers
    const coverStyle = i % 4; // 0=formula 1=wave 2=emoji 3=clean

    const card = document.createElement('div');
    card.className = 'cm-card' + (p.isHot ? ' hot' : '');
    card.style.animationDelay = (idx * 30) + 'ms';
    card.onclick = () => openPostDetail(p);

    let coverHTML = '';
    if (hasCover) {
      let inner = `<span class="cm-cover-badge ${badge}">${p.icon} ${p.type}</span>`;
      inner += `<span class="cm-cover-likes">\u2764\ufe0f ${fmtN(p.likes)}</span>`;
      if (coverStyle === 0) inner += `<span class="cm-cover-formula">${formula}</span>`;
      else if (coverStyle === 1) {
        const pts = Array.from({length:11}, (_,x) => `${x*10},${25+Math.sin(x*.8+i)*18}`).join(' ');
        inner += `<svg class="cm-cover-chart" viewBox="0 0 100 50"><polyline points="${pts}" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1.5" stroke-linecap="round"/></svg>`;
      } else if (coverStyle === 2) inner += `<span class="cm-cover-emoji">${p.icon}</span>`;
      coverHTML = `<div class="cm-cover" style="height:${h}px;background:linear-gradient(135deg,${pal[0]},${pal[1]},${pal[2]})">${inner}</div>`;
    }

    const bodyLen = [40,60,80,50,70][i % 5];
    const excerpt = p.content.replace(/\n/g,' ').substring(0, bodyLen) + (p.content.length > bodyLen ? '...' : '');

    let html = coverHTML;
    html += `<div class="cm-body">`;
    html += `<div class="cm-title">${p.title}</div>`;
    html += `<div class="cm-excerpt">${excerpt}</div>`;
    html += `<div class="cm-tags">${p.tags.slice(0,3).map(t => `<span class="cm-tag" onclick="event.stopPropagation();searchByTag('${t}')">#${t}</span>`).join('')}</div>`;
    html += `<div class="cm-author-row"><img src="${p.authorAvatar}" alt=""><span class="cm-author-name">${p.authorName}</span>`;
    html += `<div class="cm-footer-stats"><span onclick="event.stopPropagation();likePost(this,${p.likes})">\u2764\ufe0f ${fmtN(p.likes)}</span><span>\ud83d\udcac ${p.comments}</span></div>`;
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

function filterByScope() {
  const city = document.getElementById('commCityFilter').value;
  const grade = document.getElementById('commGradeFilter').value;
  commSearchQuery = '';
  const input = document.getElementById('commSearch');
  if (input) input.value = '';
  // Filter posts by city (from school name) and grade
  commPostsShown = 0;
  document.getElementById('postsGrid').innerHTML = '';
  const posts = getFilteredComm().filter(p => {
    if (city && !p.authorSchool.includes(city)) return false;
    if (grade && p.authorGrade !== grade) return false;
    return true;
  });
  // Render filtered
  const g = document.getElementById('postsGrid');
  renderFilteredBatch(posts, 0);
  showToast(`${city || '全国'} · ${grade || '全部年级'} · ${posts.length} 篇帖子`, 'info');
}

function renderFilteredBatch(posts, start) {
  // reuse loadMorePosts logic but with custom post array
  commPostsShown = 0;
  commCurrentFilter = 'all';
  document.getElementById('postsGrid').innerHTML = '';
  // Temporarily replace getFilteredComm results
  const origFilter = getFilteredComm;
  const cityVal = document.getElementById('commCityFilter').value;
  const gradeVal = document.getElementById('commGradeFilter').value;
  loadMorePosts();
}

function filterPosts(type, btn) {
  document.querySelectorAll('.cn-link,.ctab').forEach(t => t.classList.remove('active'));
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
  document.body.style.overflow = 'hidden';
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
  document.body.style.overflow = '';
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
  const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  newComment.innerHTML = `
    <img src="${s.avatar}" alt="">
    <div class="pd-comment-body">
      <div class="pd-comment-name">${s.name}</div>
      <div class="pd-comment-text">${safeText}</div>
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
  const title = document.getElementById('postTitle').value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const content = document.getElementById('postContent').value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
  document.getElementById('anaTime').textContent = s.studyTime + 'min';
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
  t.innerHTML = `<span>${msg}</span>`;
  c.appendChild(t);
  // Trigger reflow for animation
  t.offsetHeight;
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(120%) scale(0.9)';
    t.style.transition = 'all .4s cubic-bezier(.22,1,.36,1)';
    setTimeout(() => t.remove(), 400);
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

// ══════════ DAILY CHALLENGE 每日挑战 ══════════
let dailyProblems = [];
let dailyDone = 0;
let dailySelections = [null, null, null];

function initDailyChallenge() {
  const s = MOCK_STUDENTS[currentStudentIndex];
  // Pick 3 problems: 1 weak, 1 from wrong book, 1 stretch
  const weak = s.weakAreas[0];
  const weakP = MOCK_PROBLEMS.find(p => weak && p.knowledgePoint === weak.point && p.type === '选择题');
  const wrongP = wrongBook.length > 0 ? wrongBook[0] : MOCK_PROBLEMS.find(p => p.type === '选择题' && p.difficulty > 0.5);
  const stretchP = MOCK_PROBLEMS.find(p => p.type === '选择题' && p.difficulty > 0.7 && p !== weakP && p !== wrongP);
  dailyProblems = [weakP || MOCK_PROBLEMS[0], wrongP || MOCK_PROBLEMS[1], stretchP || MOCK_PROBLEMS[2]];
  dailyDone = 0;
  dailySelections = [null, null, null];

  document.getElementById('dpDone').textContent = '0';
  document.getElementById('dpCircle').style.strokeDashoffset = '326.7';
  document.getElementById('dpClassDone').textContent = rand2(25, 40);
  document.getElementById('dailyShare').style.display = 'none';

  const labels = ['薄弱知识点', '错题回顾', '拔高挑战'];
  const typeColors = ['rgba(239,68,68,.1);color:var(--red)', 'rgba(245,158,11,.1);color:var(--amber)', 'rgba(129,140,248,.1);color:var(--violet)'];
  document.getElementById('dailyCards').innerHTML = dailyProblems.map((p, i) => {
    const opts = p.options || ['A. 选项A', 'B. 选项B', 'C. 选项C', 'D. 选项D'];
    return `<div class="dc-card" id="dcCard${i}">
      <div class="dc-card-head">
        <div class="dc-card-num" id="dcNum${i}">${i + 1}</div>
        <span class="dc-card-label">${labels[i]} · ${p.knowledgePoint}</span>
        <span class="dc-card-type" style="background:${typeColors[i]}">${p.difficultyLabel}</span>
      </div>
      <div class="dc-card-q">${p.question}</div>
      <div class="dc-card-opts">${opts.map((o, j) =>
        `<button class="dc-opt" onclick="dailySelect(${i},${j},this)">${o}</button>`
      ).join('')}</div>
    </div>`;
  }).join('');
  startDailyTimer();
}

function dailySelect(cardIdx, optIdx, btn) {
  if (dailySelections[cardIdx] !== null) return; // already answered
  dailySelections[cardIdx] = optIdx;
  const correct = optIdx === 0;
  const card = document.getElementById('dcCard' + cardIdx);
  const opts = card.querySelectorAll('.dc-opt');
  opts.forEach((o, i) => {
    o.style.pointerEvents = 'none';
    if (i === 0) o.classList.add('correct');
    if (i === optIdx && !correct) o.classList.add('wrong');
  });
  if (correct) {
    dailyDone++;
    document.getElementById('dcNum' + cardIdx).classList.add('done');
    document.getElementById('dcNum' + cardIdx).textContent = '✓';
    card.classList.add('done');
    sessionXP += 15;
    showToast('+15 XP', 'success');
  } else {
    if (!wrongBook.find(w => w.id === dailyProblems[cardIdx].id))
      wrongBook.push(dailyProblems[cardIdx]);
  }
  document.getElementById('dpDone').textContent = dailyDone;
  document.getElementById('dpCircle').style.strokeDashoffset = (326.7 * (1 - dailyDone / 3)).toFixed(1);
  // Check if all done
  if (dailySelections.every(s => s !== null)) {
    showDailyResult();
  }
}

function showDailyResult() {
  const msgs = ['今天的你比昨天强了 0.5 个牛顿 🍎', '物理大佬就是你 ⚡', '继续保持，高考稳了 🎯', '知识点又被你消灭了一个 💪'];
  document.getElementById('shareScore').textContent = dailyDone + '/3';
  document.getElementById('shareMsg').textContent = msgs[Math.floor(Math.random() * msgs.length)];
  document.getElementById('shareStreak').textContent = '🔥 连续 ' + MOCK_STUDENTS[currentStudentIndex].streak + ' 天';
  document.getElementById('dailyShare').style.display = 'block';
  if (dailyDone === 3) spawnConfetti();
}

function startDailyTimer() {
  const el = document.getElementById('dcTimer');
  let sec = 10710; // ~2h59m
  setInterval(() => {
    sec--;
    if (sec < 0) sec = 0;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }, 1000);
}

// ══════════ PK BATTLE 对战 ══════════
let pkRound = 0, pkMyScore = 0, pkOpScore = 0, pkProblems = [], pkTimer = null;

function initPK() {
  document.getElementById('pkArena').style.display = 'none';
  renderPKHistory();
}

function startPK(mode) {
  const s = MOCK_STUDENTS[currentStudentIndex];
  const op = MOCK_STUDENTS[(currentStudentIndex + rand2(1, 50)) % MOCK_STUDENTS.length];
  document.getElementById('pkMyAvatar').src = s.avatar;
  document.getElementById('pkMyName').textContent = s.name;
  document.getElementById('pkOpAvatar').src = op.avatar;
  document.getElementById('pkOpName').textContent = op.name;
  pkMyScore = 0; pkOpScore = 0; pkRound = 0;
  document.getElementById('pkMyScore').textContent = '0';
  document.getElementById('pkOpScore').textContent = '0';
  pkProblems = MOCK_PROBLEMS.filter(p => p.type === '选择题').sort(() => Math.random() - 0.5).slice(0, 5);
  document.getElementById('pkArena').style.display = 'block';
  document.querySelector('.pk-modes').style.display = 'none';
  showToast('匹配成功！对战开始 ⚔️', 'success');
  nextPKRound();
}

function nextPKRound() {
  if (pkRound >= 5) { endPK(); return; }
  const p = pkProblems[pkRound];
  document.getElementById('pkRound').textContent = pkRound + 1;
  document.getElementById('pkQuestion').textContent = p.question;
  const opts = p.options || ['A','B','C','D'];
  document.getElementById('pkOptions').innerHTML = opts.map((o, i) =>
    `<button class="dc-opt" onclick="pkAnswer(${i},this)">${o}</button>`
  ).join('');
  // Timer
  let t = 60;
  document.getElementById('pkTimer').textContent = t;
  if (pkTimer) clearInterval(pkTimer);
  pkTimer = setInterval(() => { t--; document.getElementById('pkTimer').textContent = t; if (t <= 0) { clearInterval(pkTimer); pkAnswer(-1); }}, 1000);
}

function pkAnswer(idx, btn) {
  if (pkTimer) clearInterval(pkTimer);
  const correct = idx === 0;
  const opts = document.querySelectorAll('#pkOptions .dc-opt');
  opts.forEach((o, i) => { o.style.pointerEvents = 'none'; if (i === 0) o.classList.add('correct'); if (i === idx && !correct) o.classList.add('wrong'); });
  if (correct) { pkMyScore++; sessionXP += 10; }
  // Opponent AI
  const opCorrect = Math.random() < 0.55;
  if (opCorrect) pkOpScore++;
  document.getElementById('pkMyScore').textContent = pkMyScore;
  document.getElementById('pkOpScore').textContent = pkOpScore;
  pkRound++;
  setTimeout(nextPKRound, 1500);
}

function endPK() {
  const won = pkMyScore > pkOpScore;
  document.getElementById('pkQuestion').textContent = '';
  document.getElementById('pkOptions').innerHTML = `<div style="text-align:center;padding:20px"><div style="font-size:2rem;margin-bottom:8px">${won ? '🎉 胜利！' : pkMyScore === pkOpScore ? '🤝 平局！' : '😤 惜败！'}</div><div style="font-size:1.2rem;font-weight:800">${pkMyScore} : ${pkOpScore}</div><div style="margin-top:12px;font-size:.85rem;color:var(--text-2)">+${pkMyScore * 10} XP</div><button class="btn btn-glow" onclick="initPK()" style="margin-top:16px">再来一局</button></div>`;
  if (won) spawnConfetti();
}

function renderPKHistory() {
  const el = document.getElementById('pkHistory');
  const history = [];
  for (let i = 0; i < 5; i++) {
    const op = MOCK_STUDENTS[rand2(0, 50)];
    const myS = rand2(1, 5), opS = rand2(1, 5);
    history.push({ op, myS, opS, won: myS > opS });
  }
  el.innerHTML = history.map(h =>
    `<div class="pk-h-item"><span class="pk-h-result ${h.won ? 'pk-h-win' : 'pk-h-lose'}">${h.won ? '胜' : '负'}</span><img src="${h.op.avatar}" style="width:24px;height:24px;border-radius:50%"><div class="pk-h-info">vs ${h.op.name}</div><span class="pk-h-score">${h.myS}:${h.opS}</span></div>`
  ).join('');
}

// ══════════ PARENT DASHBOARD 家长端 ══════════
function initParent() {
  const s = MOCK_STUDENTS[currentStudentIndex];
  document.getElementById('parentAvatar').src = s.avatar;
  document.getElementById('parentChildName').textContent = s.name;
  document.getElementById('parentChildSchool').textContent = s.school + ' · ' + s.grade + ' · ' + s.class;
  document.getElementById('ptStudyTime').textContent = s.studyTime;
  document.getElementById('ptStreak').textContent = s.streak;
  document.getElementById('ptRank').textContent = '#' + rand2(5, 30);

  const rate = parseFloat(s.correctRate);
  document.getElementById('parentWeekly').innerHTML = `
    <div class="pw-row"><span class="pw-label">本周做题</span><span class="pw-val">${rand2(60,150)} 道</span></div>
    <div class="pw-row"><span class="pw-label">正确率</span><span class="pw-val up">${(rate*100).toFixed(1)}%（↑${rand2(2,8)}%）</span></div>
    <div class="pw-row"><span class="pw-label">学习时长</span><span class="pw-val">${rand2(3,8)} 小时</span></div>
    <div class="pw-row"><span class="pw-label">完成每日挑战</span><span class="pw-val up">${rand2(4,7)}/7 天</span></div>
    <div class="pw-row"><span class="pw-label">学脉值排名</span><span class="pw-val">班级第 ${rand2(5,20)} 名</span></div>`;

  const baseRate = rate * 100;
  document.getElementById('parentTrend').innerHTML = `
    <svg viewBox="0 0 200 80" style="width:100%;height:80px">
      <defs><linearGradient id="ptg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#10B981" stop-opacity=".2"/><stop offset="100%" stop-color="#10B981" stop-opacity="0"/></linearGradient></defs>
      <polygon points="0,80 ${[0,1,2,3,4,5,6].map(i => `${i*33},${80 - (baseRate + Math.sin(i*1.3)*8 + i*2) * 0.8}`).join(' ')} 200,80" fill="url(#ptg)"/>
      <polyline points="${[0,1,2,3,4,5,6].map(i => `${i*33},${80 - (baseRate + Math.sin(i*1.3)*8 + i*2) * 0.8}`).join(' ')}" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <div style="font-size:.72rem;color:var(--text-3);text-align:center">最近7天正确率趋势 — 稳步提升 📈</div>`;

  const weak = s.weakAreas.slice(0, 3);
  document.getElementById('parentAlerts').innerHTML = weak.map(w =>
    `<div class="pa-item">⚠️ 「${w.point}」掌握度仅 ${(w.mastery*100).toFixed(0)}%，建议加强练习</div>`
  ).join('') + `<div class="pa-item good">✅ 连续 ${s.streak} 天学习打卡，学习习惯良好</div>`;

  document.getElementById('parentHighlights').innerHTML = `
    <div class="ph-item">🌟 本周最大进步：「${weak[0] ? weak[0].topic : '力学'}」正确率提升 ${rand2(10,25)}%</div>
    <div class="ph-item">🏆 PK对战胜率 ${rand2(55,80)}%</div>
    <div class="ph-item">📝 在学脉圈发布了 ${rand2(1,5)} 篇学习笔记</div>
    <div class="ph-item">🎯 完成了 ${rand2(2,4)} 个知识点的专项突破</div>`;
}

// ══════════ WRONG BOOK 错题本 ══════════
function initWrongBook() {
  const el = document.getElementById('wbContent');
  document.getElementById('wbTotal').textContent = wrongBook.length;
  const mastered = Math.floor(wrongBook.length * 0.2);
  document.getElementById('wbMastered').textContent = mastered;
  document.getElementById('wbRemaining').textContent = wrongBook.length - mastered;
  renderWBList('all');
}

function filterWB(cat, btn) {
  document.querySelectorAll('.wb-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderWBList(cat);
}

function renderWBList(cat) {
  const el = document.getElementById('wbContent');
  let items = wrongBook.length > 0 ? [...wrongBook] : MOCK_PROBLEMS.slice(0, 15); // show sample if empty
  if (cat !== 'all') items = items.filter(p => p.category === cat);

  if (items.length === 0 && wrongBook.length === 0) {
    el.innerHTML = `<div class="wb-empty"><div class="wb-empty-icon">📕</div><div class="wb-empty-text">错题本是空的</div><div class="wb-empty-sub">去做题吧，做错的题会自动收集到这里</div><button class="btn btn-glow" onclick="showPage('practice')">开始做题 →</button></div>`;
    return;
  }

  el.innerHTML = `<div class="wb-list">${items.map((p, i) => {
    const isMastered = i < items.length * 0.2;
    return `<div class="wb-item" onclick="showPage('practice');setTimeout(()=>{loadSpecific('${p.id}')},300)">
      <div class="wb-item-status ${isMastered ? 'mastered' : 'wrong'}"></div>
      <div class="wb-item-info">
        <div class="wb-item-title">${p.knowledgePoint} — ${p.type}</div>
        <div class="wb-item-meta">${p.category} · ${p.topic} · ${p.difficultyLabel}</div>
      </div>
      <div class="wb-item-tags">
        <span style="background:rgba(239,68,68,.08);color:var(--red)">${p.difficultyLabel}</span>
        <span style="background:rgba(129,140,248,.08);color:var(--violet)">${p.category}</span>
      </div>
      <div class="wb-item-action">${isMastered ? '✅ 已掌握' : '→ 重做'}</div>
    </div>`;
  }).join('')}</div>`;
}

// ══════════ AI TUTOR ══════════
const AI_RESPONSES = {
  '向心力': '向心力不是一种新的力！它是合力在径向方向上的分量。\n\n核心公式：F向 = mv²/r = mω²r\n\n关键理解：\n1. 向心力由其他力（重力、弹力、摩擦力等）提供\n2. 离心力是非惯性系中的惯性力\n3. 做圆周运动的物体，合力必须指向圆心\n\n常见题型：竖直面圆周（绳/杆模型）、水平面圆周、圆锥摆',
  '薄弱': '根据你的数据分析：\n\n⚠️ 需要重点关注的知识点：\n1. 向心力 — 掌握度 23%（建议立即练习）\n2. 电磁感应 — 掌握度 35%\n3. 动量守恒 — 掌握度 41%\n\n✅ 你的优势知识点：\n1. 牛顿第二定律 — 82%\n2. 功和能 — 78%\n\n📋 建议：先从向心力的基础题开始，每天做10道，预计1周可提升到60%以上。',
  '楞次': '楞次定律的核心：感应电流的效果总是"阻碍"引起它的原因。\n\n快速判断方法：\n1. 确定原磁通量的变化方向（增大or减小）\n2. "增反减同"：增大→感应磁场与原磁场反向；减小→同向\n3. 用右手定则由感应磁场方向→感应电流方向\n\n⚡ 记忆口诀：来拒去留、增反减同\n\n常见陷阱：注意区分"磁通量变化方向"和"磁场方向"！',
  '动量': '动量守恒定律：p₁ + p₂ = p₁\' + p₂\'（合外力为零时）\n\n解题步骤：\n1. 判断系统是否满足动量守恒条件\n2. 选正方向\n3. 列动量守恒方程\n4. ⚠️ 验证结果合理性（动能不增加）\n\n碰撞类型：\n• 完全弹性：动量+动能都守恒\n• 完全非弹性：碰后粘在一起\n• 一般碰撞：动量守恒，动能减少',
  '电磁感应': '电磁感应解题"一法二律"：\n\n一法：法拉第定律 ε = NΔΦ/Δt\n二律：楞次定律（定方向）+ 欧姆定律（定电流）\n\n完整解题流程：\n① 判断磁通量是否变化\n② 用楞次定律确定感应电流方向\n③ 用法拉第定律计算EMF\n④ 用欧姆定律计算电流 I = ε/(R+r)\n⑤ 如需要，计算安培力 F = BIL',
  '复习': '📅 本周复习计划（基于你的数据）：\n\n周一：向心力基础题 × 15（掌握度最低）\n周二：电磁感应概念 × 10 + 楞次定律 × 5\n周三：动量守恒计算题 × 12\n周四：综合复习 — 做一套模拟题\n周五：错题回顾 + 薄弱点重做\n周末：学脉圈看同学笔记 + 放松\n\n⏰ 建议每天30分钟，不贪多但要保证质量！',
  '牛顿': '牛顿三大定律是力学的基石：\n\n第一定律（惯性定律）：不受力→保持静止或匀速直线运动\n第二定律：F = ma（最核心！解题万能公式）\n第三定律：作用力与反作用力等大反向同线\n\n解题技巧：\n1. 隔离法 vs 整体法选择\n2. 正交分解选取合适坐标系\n3. 连接体问题先整体求加速度，再隔离求内力',
  '功': '功和能量的关系：\n\n• 功的定义：W = Fs cosθ\n• 动能定理：W合 = ΔEk\n• 机械能守恒：只有重力/弹力做功时\n• 能量守恒：永远成立\n\n选用哪个？\n→ 不涉及过程细节 → 动能定理\n→ 只有重力/弹力 → 机械能守恒\n→ 有摩擦力 → 能量守恒\n→ 求某个力的功 → 功的定义',
  '万有引力': '万有引力与天体运动：\n\nGMm/r² = mv²/r = mω²r = m(2π/T)²r\n\n重要结论：\n• 高轨道 = 大周期 + 小速度 + 小角速度\n• 第一宇宙速度 v₁ = √(gR) ≈ 7.9 km/s\n• 地球同步卫星：T = 24h, 赤道上空\n\n变轨问题关键：\n• 加速→进入更高轨道（速度先增后减）\n• 减速→进入更低轨道',
  '电场': '电场核心概念：\n\n• 场强 E = F/q = kQ/r²（点电荷）\n• 电势 φ 描述能量，场强 E 描述力\n• 电场线：从正到负，密→强\n• 等势面：⊥电场线\n\n重点公式：\n• W = qU（电场力做的功）\n• U = Ed（匀强电场）\n• Ep = qφ（电势能）\n\n解题关键：画出电场线分布图！',
  '出题': '好的，给你出一道练习题！🎯\n\n一个质量为2kg的物体，在F=10N的水平力作用下沿粗糙水平面做匀加速运动，动摩擦因数μ=0.2，g=10m/s²。\n\n求：\n(1) 物体的加速度\n(2) 2秒末物体的速度\n(3) 2秒内F做的功\n\n提示：先受力分析，再用牛顿第二定律→运动学公式→功的计算。\n\n做完了把答案告诉我，我帮你检查！',
  '高考': '高考物理备考策略：\n\n📊 分值分布：\n选择题 48分（6×8=48）\n实验题 15分\n计算题 32分\n选做题 15分\n\n🎯 提分优先级：\n1. 选择题保6争8（分值最大，性价比最高）\n2. 实验题背核心实验\n3. 计算题至少拿步骤分\n4. 选做题选自己擅长的模块\n\n💡 最后一个月：错题本 > 刷新题',
  '摩擦力': '摩擦力判断三步法：\n\n第一步：判断有无摩擦力\n→ 有接触面 + 有相对运动（趋势）= 有\n\n第二步：判断方向\n→ 假设法：假设光滑，看物体是否运动\n→ 与相对运动（趋势）方向相反\n\n第三步：判断大小\n→ 滑动摩擦力：f = μN（N不一定等于mg！）\n→ 静摩擦力：由平衡条件算\n\n⚠️ 常见坑：静摩擦力大小和方向都不固定！',
  'default': '这是一个很好的问题！让我来帮你分析。\n\n物理学习的关键在于理解概念，而不是死记公式。建议你：\n\n1. 先回顾相关知识点的基础概念\n2. 看看学脉AI的薄弱点分析\n3. 做几道相关的专项练习\n4. 在学脉圈搜索同学的笔记\n\n你可以继续问我更具体的问题，比如某个知识点的解题技巧、公式推导、或者让我出一道练习题给你！\n\n💡 试试问我：\n• "出一道牛顿第二定律的计算题"\n• "高考物理怎么准备？"\n• "摩擦力方向怎么判断？"'
};

function initAI() {}

function aiAsk(text) {
  document.getElementById('aiInput').value = text;
  aiSend();
}

function aiSend() {
  const input = document.getElementById('aiInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  const msgs = document.getElementById('aiMessages');
  const s = MOCK_STUDENTS[currentStudentIndex];

  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'ai-msg ai-msg-user';
  userMsg.innerHTML = `<div class="ai-msg-avatar"><img src="${s.avatar}" style="width:100%;height:100%;border-radius:50%"></div><div class="ai-msg-bubble"><div class="ai-msg-name">${s.name}</div><div class="ai-msg-text">${text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div></div>`;
  msgs.appendChild(userMsg);

  // Add typing indicator
  const typing = document.createElement('div');
  typing.className = 'ai-msg ai-msg-bot';
  typing.id = 'aiTyping';
  typing.innerHTML = `<div class="ai-msg-avatar">🤖</div><div class="ai-msg-bubble"><div class="ai-msg-typing"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;

  // Find best response
  const lowerText = text.toLowerCase();
  let response = AI_RESPONSES['default'];
  for (const [key, val] of Object.entries(AI_RESPONSES)) {
    if (key !== 'default' && lowerText.includes(key)) { response = val; break; }
  }

  // Simulate delay then show response
  setTimeout(() => {
    typing.remove();
    const botMsg = document.createElement('div');
    botMsg.className = 'ai-msg ai-msg-bot';
    botMsg.style.animation = 'fadeSlideUp .3s ease';
    botMsg.innerHTML = `<div class="ai-msg-avatar">🤖</div><div class="ai-msg-bubble"><div class="ai-msg-name">StudyPulse AI</div><div class="ai-msg-text" style="white-space:pre-wrap">${response}</div></div>`;
    msgs.appendChild(botMsg);
    msgs.scrollTop = msgs.scrollHeight;
  }, 800 + Math.random() * 1200);
}

// ══════════ LEADERBOARD 排行榜 ══════════
let currentLBType = 'pulse';

function initLeaderboard() {
  renderLeaderboardFull('pulse');
}

function switchLB(type, btn) {
  document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  currentLBType = type;
  renderLeaderboardFull(type);
}

function renderLeaderboardFull(type) {
  const sortFn = {
    pulse: (a, b) => b.pulsePoints - a.pulsePoints,
    streak: (a, b) => b.streak - a.streak,
    problems: (a, b) => b.totalProblems - a.totalProblems,
    rate: (a, b) => parseFloat(b.correctRate) - parseFloat(a.correctRate)
  }[type];
  const valFn = {
    pulse: s => fmtN(s.pulsePoints),
    streak: s => s.streak + '天',
    problems: s => fmtN(s.totalProblems),
    rate: s => (parseFloat(s.correctRate) * 100).toFixed(1) + '%'
  }[type];

  const sorted = [...MOCK_STUDENTS].sort(sortFn);
  const me = MOCK_STUDENTS[currentStudentIndex];

  // Podium
  const podium = document.getElementById('lbPodium');
  const top3 = sorted.slice(0, 3);
  const order = [1, 0, 2]; // display 2nd, 1st, 3rd
  podium.innerHTML = order.map(i => {
    const s = top3[i];
    if (!s) return '';
    const cls = i === 0 ? 'lb-p1' : i === 1 ? 'lb-p2' : 'lb-p3';
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
    return `<div class="lb-podium-item ${cls}"><div class="lb-podium-bar"><div class="lb-podium-rank">${medal}</div><img src="${s.avatar}" class="lb-podium-avatar" alt=""><div class="lb-podium-name">${s.name}</div><div class="lb-podium-school">${s.school}</div><div class="lb-podium-val">${valFn(s)}</div></div></div>`;
  }).join('');

  // Full list
  const list = document.getElementById('lbFullList');
  list.innerHTML = sorted.slice(3, 50).map((s, i) => {
    const isMe = s.id === me.id;
    return `<div class="lb-list-item${isMe ? ' me' : ''}"><span class="lb-list-rank">${i + 4}</span><img src="${s.avatar}" class="lb-list-avatar" alt=""><div class="lb-list-info"><div class="lb-list-name">${s.name}${isMe ? ' (你)' : ''}</div><div class="lb-list-school">${s.school} · ${s.rank}</div></div><div class="lb-list-val">${valFn(s)}</div></div>`;
  }).join('');
}

// ══════════ CONFETTI ══════════
function spawnConfetti() {
  const colors = ['#818CF8','#06B6D4','#EC4899','#F59E0B','#10B981','#6366F1'];
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = (40 + Math.random() * 20) + 'vw';
    el.style.top = (20 + Math.random() * 10) + 'vh';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    el.style.width = (4 + Math.random() * 8) + 'px';
    el.style.height = (4 + Math.random() * 8) + 'px';
    el.style.animationDuration = (1 + Math.random()) + 's';
    el.style.animationDelay = (Math.random() * 0.3) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

// ══════════ BUTTON RIPPLE ══════════
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn-glow');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.left = (e.clientX - rect.left) + 'px';
  ripple.style.top = (e.clientY - rect.top) + 'px';
  ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

// ══════════ SMOOTH SCROLL REVEAL (re-observe on page change) ══════════
function reobserve() {
  setTimeout(() => {
    document.querySelectorAll('[data-anim]:not(.visible)').forEach(el => {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
      }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
      obs.observe(el);
    });
  }, 50);
}
