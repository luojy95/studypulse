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

## 🚀 Features (11 Pages)

| Page | Description |
|------|-------------|
| **首页** | Landing page with hero, features bento grid, product demo strip, testimonials, pricing |
| **学习追踪** | Dashboard with knowledge heatmap, streak calendar, achievement badges, weekly trends |
| **刷题练习** | Practice with real answer validation, XP system, 4 modes (AI/topic/exam/wrong book) |
| **错题本** | Persisted wrong answer book with category filters, mastery status tracking |
| **每日挑战** | Daily 3-problem challenge with countdown timer, class progress ring, shareable result cards |
| **PK对战** | 1v1 real-time knowledge battle with 3 modes, 5 rounds, live scoring |
| **AI助手** | Chat interface with 13 physics topic responses, typing animation, suggested questions |
| **学脉圈** | Xiaohongshu-style community with 2,000 posts, masonry layout, post detail modal |
| **排行榜** | Podium + full list with 4 ranking modes (pulse points, streak, problems, accuracy) |
| **家长看板** | Parent dashboard with weekly reports, trend charts, smart alerts, privacy notice |
| **数据分析** | Analytics with radar chart, category bars, difficulty analysis, AI insights, school comparison |

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
│   ├── index.html      # All 11 pages + modals (930 lines)
│   ├── style.css       # Complete design system (1020 lines)
│   ├── app.js          # All interactions + rendering (1520 lines)
│   └── data.js         # Mock data (200 students, 1k problems, 2k posts)
├── data/
│   ├── generate_data.js    # Student & problem generator
│   ├── generate_posts.js   # Community post generator
│   ├── slim_students.js    # Data optimization script
│   ├── students.json       # Full student data (500)
│   ├── problems_sample.json
│   ├── posts.json
│   └── stats.json
└── BUSINESS_PLAN.md    # Full business plan (Chinese)
```

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
