/**
 * StudyPulse API 客户端
 * 
 * 使用方法：
 *   1. 设置 API_BASE_URL 为你的后端地址
 *   2. 调用 StudyPulseAPI.auth.login() 获取 token
 *   3. 用各模块方法请求数据
 * 
 * 当前模式：MOCK（使用本地数据）
 * 切换为真实 API：将 USE_MOCK 设为 false
 */

const API_CONFIG = {
  BASE_URL: 'https://api.studypulse.cn/v1',  // 改为你的后端地址
  USE_MOCK: true,  // true=使用本地mock数据, false=调用真实API
  TOKEN: null,
  REFRESH_TOKEN: null
};

// ═══ HTTP 请求封装 ═══
async function apiRequest(method, path, body = null) {
  if (API_CONFIG.USE_MOCK) {
    console.log(`[MOCK] ${method} ${path}`, body || '');
    return null; // mock模式下返回null，由调用方使用本地数据
  }

  const headers = { 'Content-Type': 'application/json' };
  if (API_CONFIG.TOKEN) headers['Authorization'] = `Bearer ${API_CONFIG.TOKEN}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(API_CONFIG.BASE_URL + path, options);
  const data = await res.json();

  if (data.code === 401 && API_CONFIG.REFRESH_TOKEN) {
    // Token过期，尝试刷新
    await refreshToken();
    headers['Authorization'] = `Bearer ${API_CONFIG.TOKEN}`;
    const retry = await fetch(API_CONFIG.BASE_URL + path, { ...options, headers });
    return retry.json();
  }

  if (data.code !== 200) throw new Error(data.message || 'API Error');
  return data.data;
}

async function refreshToken() {
  const res = await fetch(API_CONFIG.BASE_URL + '/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: API_CONFIG.REFRESH_TOKEN })
  });
  const data = await res.json();
  API_CONFIG.TOKEN = data.data.token;
  API_CONFIG.REFRESH_TOKEN = data.data.refresh_token;
}

// ═══ API 模块 ═══
const StudyPulseAPI = {

  // ── 认证 ──
  auth: {
    async login(phone, code) {
      const data = await apiRequest('POST', '/auth/login', { phone, code });
      if (data) {
        API_CONFIG.TOKEN = data.token;
        API_CONFIG.REFRESH_TOKEN = data.refresh_token;
      }
      return data;
    },
    async parentLogin(wxCode, inviteCode) {
      return apiRequest('POST', '/auth/parent/wechat', { wx_code: wxCode, child_invite_code: inviteCode });
    },
    logout() {
      API_CONFIG.TOKEN = null;
      API_CONFIG.REFRESH_TOKEN = null;
    }
  },

  // ── 学生数据 ──
  student: {
    async getProfile(studentId) {
      if (API_CONFIG.USE_MOCK) return MOCK_STUDENTS.find(s => s.id === studentId) || MOCK_STUDENTS[0];
      return apiRequest('GET', `/students/${studentId}/profile`);
    },
    async getHistory(studentId, page = 1, limit = 50) {
      return apiRequest('GET', `/students/${studentId}/history?page=${page}&limit=${limit}`);
    },
    async getCalendar(studentId, days = 90) {
      return apiRequest('GET', `/students/${studentId}/calendar?days=${days}`);
    },
    async getBadges(studentId) {
      return apiRequest('GET', `/students/${studentId}/badges`);
    },
    async getWrongBook(studentId, category = '') {
      if (API_CONFIG.USE_MOCK) return wrongBook;
      return apiRequest('GET', `/students/${studentId}/wrong-book?category=${category}`);
    }
  },

  // ── AI 追踪引擎 ──
  ai: {
    async track(studentId, problemId, answer, isCorrect, timeSpent) {
      return apiRequest('POST', '/ai/track', {
        student_id: studentId,
        problem_id: problemId,
        answer, is_correct: isCorrect,
        time_spent: timeSpent
      });
    },
    async recommend(studentId, mode = 'smart', count = 10, filters = {}) {
      if (API_CONFIG.USE_MOCK) {
        // Mock推荐逻辑
        const s = MOCK_STUDENTS.find(st => st.id === studentId) || MOCK_STUDENTS[0];
        const weakKPs = (s.weakAreas || []).map(w => w.point);
        let pool = MOCK_PROBLEMS;
        if (mode === 'smart' && weakKPs.length) pool = pool.filter(p => weakKPs.includes(p.knowledgePoint));
        if (filters.category) pool = pool.filter(p => p.category === filters.category);
        return pool.sort(() => Math.random() - 0.5).slice(0, count);
      }
      return apiRequest('POST', '/ai/recommend', { student_id: studentId, mode, count, filters });
    },
    async getDailyTasks(studentId) {
      return apiRequest('GET', `/ai/daily-tasks/${studentId}`);
    },
    async completeTask(taskId, studentId, results) {
      return apiRequest('POST', `/ai/daily-tasks/${taskId}/complete`, { student_id: studentId, results });
    },
    async predict(studentId, examType = '期中考试') {
      return apiRequest('GET', `/ai/predict/${studentId}?exam_type=${examType}`);
    },
    async chat(studentId, message, sessionId, context = {}) {
      if (API_CONFIG.USE_MOCK) {
        // 使用本地关键词匹配
        return null; // 由 aiSend() 函数处理
      }
      return apiRequest('POST', '/ai/chat', {
        student_id: studentId, message, session_id: sessionId, context
      });
    }
  },

  // ── 题目 ──
  problems: {
    async get(problemId) {
      if (API_CONFIG.USE_MOCK) return MOCK_PROBLEMS.find(p => p.id === problemId);
      return apiRequest('GET', `/problems/${problemId}`);
    },
    async search(filters = {}) {
      if (API_CONFIG.USE_MOCK) {
        return MOCK_PROBLEMS.filter(p => {
          if (filters.category && p.category !== filters.category) return false;
          if (filters.topic && p.topic !== filters.topic) return false;
          if (filters.difficulty_min && p.difficulty < filters.difficulty_min) return false;
          if (filters.difficulty_max && p.difficulty > filters.difficulty_max) return false;
          if (filters.type && p.type !== filters.type) return false;
          return true;
        });
      }
      const params = new URLSearchParams(filters);
      return apiRequest('GET', `/problems/search?${params}`);
    },
    async submit(problemId, studentId, answer, timeSpent, mode = 'practice') {
      return apiRequest('POST', `/problems/${problemId}/submit`, {
        student_id: studentId, answer, time_spent: timeSpent, mode
      });
    }
  },

  // ── 社区 ──
  community: {
    async getPosts(filter = '推荐', city = '', grade = '', page = 1) {
      if (API_CONFIG.USE_MOCK) return MOCK_POSTS;
      return apiRequest('GET', `/community/posts?filter=${filter}&city=${city}&grade=${grade}&page=${page}`);
    },
    async createPost(title, content, type, tags, images = []) {
      return apiRequest('POST', '/community/posts', { title, content, type, tags });
    },
    async like(postId) {
      return apiRequest('POST', `/community/posts/${postId}/like`);
    },
    async comment(postId, content) {
      return apiRequest('POST', `/community/posts/${postId}/comment`, { content });
    }
  },

  // ── 家长端 ──
  parent: {
    async getOverview(childId) {
      if (API_CONFIG.USE_MOCK) {
        const s = MOCK_STUDENTS.find(st => st.id === childId) || MOCK_STUDENTS[0];
        return s; // 返回学生数据作为概况
      }
      return apiRequest('GET', `/parent/child/${childId}/overview`);
    },
    async getWeeklyReport(childId, week) {
      return apiRequest('GET', `/parent/child/${childId}/weekly-report?week=${week}`);
    }
  },

  // ── 学校端 ──
  school: {
    async getClassDashboard(classId) {
      return apiRequest('GET', `/school/class/${classId}/dashboard`);
    },
    async createAssignment(teacherId, classId, title, knowledgePoints, count, deadline) {
      return apiRequest('POST', '/school/assignments', {
        teacher_id: teacherId, class_id: classId, title,
        knowledge_points: knowledgePoints, problem_count: count,
        deadline
      });
    },
    async uploadExam(classId, examName, file) {
      // 文件上传需要 FormData
      const fd = new FormData();
      fd.append('class_id', classId);
      fd.append('exam_name', examName);
      fd.append('file', file);
      const res = await fetch(API_CONFIG.BASE_URL + '/school/exam/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${API_CONFIG.TOKEN}` },
        body: fd
      });
      return res.json();
    }
  },

  // ── PK 对战 ──
  pk: {
    async match(studentId, mode = 'random', category = '') {
      return apiRequest('POST', '/pk/match', { student_id: studentId, mode, category });
    },
    connectWebSocket(matchId) {
      if (API_CONFIG.USE_MOCK) return null;
      return new WebSocket(`wss://ws.studypulse.cn/pk/${matchId}`);
    }
  }
};

// ═══ 使用示例 ═══
/*

// 1. 登录
const user = await StudyPulseAPI.auth.login('13800138000', '123456');

// 2. 获取学生画像
const profile = await StudyPulseAPI.student.getProfile('STU00001');
console.log(profile.mastery); // 各知识点掌握度

// 3. AI推荐题目
const problems = await StudyPulseAPI.ai.recommend('STU00001', 'smart', 10);

// 4. 提交答案 & AI实时追踪
const result = await StudyPulseAPI.ai.track('STU00001', 'PHY000123', 'A', true, 95);
console.log(result.mastery_update); // AI更新后的掌握度

// 5. AI对话
const response = await StudyPulseAPI.ai.chat('STU00001', '向心力怎么理解？', 'sess001');

// 6. 获取预测分数
const prediction = await StudyPulseAPI.ai.predict('STU00001', '期中考试');
console.log(prediction.predicted_score); // {min: 72, max: 81}

// 7. 家长查看学情
const overview = await StudyPulseAPI.parent.getOverview('STU00001');

// 切换为真实API模式：
// API_CONFIG.USE_MOCK = false;
// API_CONFIG.BASE_URL = 'https://your-backend.com/v1';

*/

console.log('[StudyPulse API] 客户端已加载 | 模式:', API_CONFIG.USE_MOCK ? 'MOCK' : 'LIVE');
