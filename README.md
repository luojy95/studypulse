# 💓 StudyPulse 学脉

**AI驱动的个性化高中物理学习平台**

> 每一道题，都有脉搏

🔗 **Live Demo**: [https://luojy95.github.io/studypulse/](https://luojy95.github.io/studypulse/)

---

## 🎯 What is StudyPulse?

StudyPulse (学脉) is an AI-powered adaptive learning platform for Chinese high school physics students. It combines **deep knowledge tracing**, **intelligent problem recommendation**, and a **Xiaohongshu-style learning community** to create a complete learning loop: practice → analyze → recommend → share.

### The Problem
- **2,400万** Chinese high school students struggle with physics
- Students blindly grind problems without knowing their weak spots
- Parents have zero visibility into learning progress
- Existing products (作业帮, 猿辅导) focus on search-and-answer, not personalized tracking

### Our Solution
An AI engine that tracks every student's knowledge mastery in real-time, identifies weak areas before exams, and recommends precisely the right problems — combined with social features that make studying feel less lonely.

---

## 🚀 Features (10 Pages)

| Page | Description |
|------|-------------|
| **首页** | Landing page — hero, features bento grid, product demo strip, testimonials, pricing |
| **学习追踪** | Dashboard — 知识热力图 + 薄弱TOP5 + 今日目标并排, 学习日历, 成就勋章, 本周趋势 |
| **AI 1对1** | 双模式切换：AI任务列表 + 实时聊天 / 自主学习（AI推荐/专题/模考/错题） |
| **错题本** | 自动收集错题, 分类筛选, 掌握状态追踪, 一键重做 |
| **每日挑战** | 3题/天（薄弱+错题+拔高）, 倒计时, 班级完成环, 分享卡片 |
| **PK对战** | 1v1实时对战, 3种模式（全国/好友/班级赛）, 5轮×60秒 |
| **学脉圈** | 小红书式社区, 2列瀑布流, 同城+年级筛选, 帖子详情+评论 |
| **排行榜** | 金银铜领奖台, 4维排名（学脉值/连续天数/做题数/正确率） |
| **家长看板** | 学情概况, 周报, 趋势图, 智能预警, 隐私保护声明 |
| **数据分析** | 雷达图, 各板块掌握度, 题型分布, 难度分析, AI建议, 同校对比 |

---

## 🧠 AI Technology

- **Deep Knowledge Tracing (DKT)** — LSTM + Attention model for real-time mastery tracking
- **Bayesian Knowledge Tracing (BKT)** — Probabilistic mastery estimation per knowledge point
- **Three-way Recall + Ranking** — Collaborative filtering + content + strategy recall with LTR ranking
- **Knowledge Graph** — 126 knowledge points mapped in Neo4j with prerequisite relationships
- **ZPD Theory** — Zone of Proximal Development for optimal difficulty recommendation
- **Ebbinghaus Forgetting Curve** — Spaced repetition triggers for review reminders

---

## 📊 Mock Data Scale

| Data | Count |
|------|-------|
| Students | 200 (50 with full mastery data) |
| Physics Problems | 1,000 in browser / 11,500+ total |
| Community Posts | 2,000 |
| Comments | 15,800+ |
| Knowledge Points | 126 across 6 categories |
| Categories | 力学, 电磁学, 热学, 光学, 近代物理, 振动与波 |

---

## 💡 Key Interactions

- **Real answer validation** — Multiple choice graded correctly (option A = correct in data)
- **XP system** — Earn 10-30 XP per correct answer scaled by difficulty
- **Wrong book persistence** — Wrong answers accumulate in session for targeted review
- **Confetti celebration** — Particle animation on correct answers
- **Button ripple effect** — Material-design style click ripples
- **Mouse-tracking card glow** — Cards follow cursor with radial light
- **Staggered scroll animations** — Elements fade in with blur-to-sharp transition
- **Body scroll lock** — Modals properly lock background scroll

---

## 💰 Business Model

| Revenue Stream | Pricing |
|----------------|---------|
| Free tier | 20 problems/day, basic analytics |
| Pro (个人版) | ¥39/month or ¥299/year |
| School (校园版) | ¥80,000-150,000/year/school |
| AI错题打印本 | ¥49-99 per printed book |
| Parent premium | ¥19/month for deep reports |

**Target**: Break even at Year 2 with 300 schools + 18万 paid users.

---

## 🛠 Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS (zero dependencies, single-page app)
- **Design**: Custom design system inspired by Linear, Vercel, Stripe
- **Canvas**: Particle background with multi-color gradient connections
- **Charts**: All SVG — radar, donut, sparklines, bar charts, area fills
- **Hosting**: GitHub Pages (free, CDN-backed)

---

## 📁 Project Structure

```
studypulse/
├── website/
│   ├── index.html          # 10个页面 + 弹窗
│   ├── style.css           # 完整设计系统
│   ├── app.js              # 所有交互逻辑
│   ├── api.js              # API 客户端 SDK（mock/live 双模式）
│   ├── data.js             # Mock 数据（200学生, 1k题目, 2k帖子）
│   ├── README.md           # 本文档
│   ├── 商业计划书.md        # 全中文商业计划书 v3.0
│   └── API接口文档.md       # 完整 API 接口文档（40+ 接口）
├── data/
│   ├── generate_data.js    # 学生 & 题目生成器
│   ├── generate_posts.js   # 社区帖子生成器
│   ├── slim_students.js    # 数据优化脚本
│   ├── students.json       # 完整学生数据（500人）
│   ├── problems_sample.json
│   ├── posts.json
│   └── stats.json
└── 商业计划书.md            # 商业计划书（项目根目录副本）
```

---

## 🔌 API 接入指南

### 概述

学脉前端内置了完整的 API 客户端 `api.js`，支持 **mock 模式**（使用本地数据）和 **live 模式**（调用真实后端）一键切换。

📄 **完整接口文档**：[API接口文档.md](API接口文档.md)

### 快速开始

#### 第一步：切换到真实 API 模式

打开 `api.js`，修改配置：

```javascript
const API_CONFIG = {
  BASE_URL: 'https://your-backend.com/v1',  // ← 改为你的后端地址
  USE_MOCK: false,                            // ← 改为 false
  TOKEN: null,
  REFRESH_TOKEN: null
};
```

#### 第二步：用户登录

```javascript
// 手机验证码登录
const user = await StudyPulseAPI.auth.login('13800138000', '123456');
// → 自动保存 token，后续请求自动携带 Authorization header

// 家长微信登录
await StudyPulseAPI.auth.parentLogin(wxCode, childInviteCode);

// 教师登录
await StudyPulseAPI.auth.teacherLogin(schoolCode, employeeId, password);
```

#### 第三步：获取学生完整画像

```javascript
const profile = await StudyPulseAPI.student.getProfile('STU00001');

// 返回：
// {
//   id, name, school, grade, class,
//   stats: { total_problems, correct_rate, streak, pulse_points, rank },
//   mastery: {
//     "力学": {
//       overall: 0.72,
//       topics: {
//         "牛顿运动定律": {
//           knowledge_points: {
//             "牛顿第二定律": { mastery: 0.85, confidence: 0.90, trend: "up" }
//           }
//         }
//       }
//     }
//   },
//   weak_areas: [{ point: "楞次定律", mastery: 0.23, trend: "down" }]
// }
```

#### 第四步：AI 推荐题目

```javascript
// 智能推荐（基于薄弱知识点）
const problems = await StudyPulseAPI.ai.recommend('STU00001', 'smart', 10);

// 带筛选条件
const problems = await StudyPulseAPI.ai.recommend('STU00001', 'smart', 10, {
  category: '力学',
  difficulty_range: [0.3, 0.7]
});

// 返回问题数组 + 推荐策略说明
```

#### 第五步：提交答案 & AI 实时追踪

```javascript
// 学生提交答案后调用
const result = await StudyPulseAPI.ai.track(
  'STU00001',    // 学生ID
  'PHY000123',   // 题目ID
  'A',           // 学生答案
  true,          // 是否正确
  95             // 答题耗时（秒）
);

// 返回：
// {
//   mastery_update: { knowledge_point: "向心力", before: 0.35, after: 0.42 },
//   alerts: [{ type: "consecutive_wrong", message: "连续3题出错", action: "recommend_video" }],
//   xp_earned: 15
// }
```

#### 第六步：AI 对话（流式响应）

```javascript
// 方式一：使用封装的 API
const response = await StudyPulseAPI.ai.chat(
  'STU00001',
  '向心力和离心力有什么区别？',
  'session_001',
  { current_page: 'practice', current_problem_id: 'PHY000456' }
);

// 方式二：SSE 流式接入（逐字输出）
const eventSource = new EventSource(
  'https://your-backend.com/v1/ai/chat/stream?token=xxx'
);
eventSource.addEventListener('token', (e) => {
  const data = JSON.parse(e.data);
  appendToChat(data.content); // 逐字追加到聊天框
});
eventSource.addEventListener('done', (e) => {
  const data = JSON.parse(e.data);
  showSuggestedActions(data.suggested_actions);
});
```

#### 第七步：家长端查看学情

```javascript
// 家长查看孩子学习概况
const overview = await StudyPulseAPI.parent.getOverview('STU00001');
// → today: { study_time, problems_done, correct_rate, streak, class_rank }
// → weekly_report: { correct_rate_change, biggest_improvement, needs_attention }
// → predicted_exam_score: { min: 72, max: 81 }

// 获取周报
const report = await StudyPulseAPI.parent.getWeeklyReport('STU00001', '2026-W11');
```

#### 第八步：学校端管理

```javascript
// 获取班级数据面板
const dashboard = await StudyPulseAPI.school.getClassDashboard('CLS003');
// → knowledge_heatmap: 全班每个知识点掌握度热力图
// → at_risk_students: 需要关注的学生列表

// 一键布置作业
await StudyPulseAPI.school.createAssignment(
  'T2024001', 'CLS003',
  '电磁感应专项练习',
  ['法拉第电磁感应定律', '楞次定律'],
  15, '2026-03-15T22:00:00Z'
);

// 上传考试成绩批量分析
await StudyPulseAPI.school.uploadExam('CLS003', '期中考试', csvFile);
```

### API 模块速查

| 模块 | 调用方式 | 说明 |
|------|---------|------|
| `StudyPulseAPI.auth` | `.login()` `.parentLogin()` `.logout()` | 认证管理 |
| `StudyPulseAPI.student` | `.getProfile()` `.getHistory()` `.getCalendar()` `.getBadges()` `.getWrongBook()` | 学生数据 |
| `StudyPulseAPI.ai` | `.track()` `.recommend()` `.getDailyTasks()` `.completeTask()` `.predict()` `.chat()` | AI 引擎 |
| `StudyPulseAPI.problems` | `.get()` `.search()` `.submit()` | 题目操作 |
| `StudyPulseAPI.community` | `.getPosts()` `.createPost()` `.like()` `.comment()` | 社区 |
| `StudyPulseAPI.parent` | `.getOverview()` `.getWeeklyReport()` | 家长端 |
| `StudyPulseAPI.school` | `.getClassDashboard()` `.createAssignment()` `.uploadExam()` | 学校端 |
| `StudyPulseAPI.pk` | `.match()` `.connectWebSocket()` | PK 对战 |

### 后端开发指引

如果你需要搭建后端服务，参考 [API接口文档.md](API接口文档.md) 中的完整请求/响应格式实现以下服务：

1. **用户服务** — 注册/登录/Token管理
2. **题目服务** — CRUD + 搜索 + 筛选
3. **AI追踪服务** — 接收做题数据 → 更新mastery → 返回推荐
4. **推荐服务** — 三路召回 + LTR排序
5. **AI对话服务** — 接入大模型API（GPT-4/Claude） + SSE流式返回
6. **社区服务** — 帖子CRUD + 搜索 + 同城/年级筛选
7. **通知服务** — 微信推送 + Webhook

推荐技术栈：Node.js/Python FastAPI + PostgreSQL + Redis + Neo4j(知识图谱)

---

## 🚢 Deployment

The site auto-deploys to GitHub Pages on every push to `master`:

```bash
cd website
git add -A
git commit -m "your message"
git push origin master
# Live in ~30 seconds at https://luojy95.github.io/studypulse/
```

---

## 🎨 Design Philosophy

1. **Dark mode first** — `#050510` background, glassmorphic cards
2. **Spring animations** — `cubic-bezier(.22,1,.36,1)` for all transitions
3. **Information density** — Compact cards, masonry layouts, data-rich views
4. **Chinese-first content** — All UI text, data, and interactions in Chinese
5. **Zero framework** — Pure HTML/CSS/JS for maximum performance and simplicity

---

## 📬 Contact

StudyPulse 学脉 © 2026

*Built for 2,400万 Chinese high school students. 每一道题，都有脉搏。*
