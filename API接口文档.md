# 学脉 StudyPulse — API 接口文档

> **版本**: v1.0 | **Base URL**: `https://api.studypulse.cn/v1`
> 
> 所有接口均需要 `Authorization: Bearer <token>` 头

---

## 目录

1. [认证接口](#1-认证接口)
2. [学生数据接口](#2-学生数据接口)
3. [AI 追踪引擎接口](#3-ai-追踪引擎接口)
4. [题目与练习接口](#4-题目与练习接口)
5. [AI 对话接口](#5-ai-对话接口)
6. [社区接口](#6-社区接口)
7. [家长端接口](#7-家长端接口)
8. [学校端接口](#8-学校端接口)
9. [Webhook 回调](#9-webhook-回调)

---

## 1. 认证接口

### 1.1 学生登录

```
POST /auth/login
```

**请求体：**
```json
{
  "phone": "13800138000",
  "code": "123456",
  "device_id": "xxx"
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGci...",
    "refresh_token": "xxx",
    "expires_in": 86400,
    "user": {
      "id": "STU00001",
      "name": "张浩然",
      "school": "北京四中",
      "grade": "高二",
      "class": "高二(3)班",
      "avatar": "https://...",
      "rank": "铂金",
      "pulse_points": 8540,
      "streak": 23,
      "created_at": "2025-09-01T00:00:00Z"
    }
  }
}
```

### 1.2 家长登录（微信小程序）

```
POST /auth/parent/wechat
```

**请求体：**
```json
{
  "wx_code": "xxx",
  "child_invite_code": "ABCDEF"
}
```

### 1.3 教师登录

```
POST /auth/teacher/login
```

**请求体：**
```json
{
  "school_code": "BJ0004",
  "employee_id": "T2024001",
  "password": "xxx"
}
```

---

## 2. 学生数据接口

### 2.1 获取学生完整画像

```
GET /students/{student_id}/profile
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "id": "STU00001",
    "name": "张浩然",
    "school": "北京四中",
    "grade": "高二",
    "class": "高二(3)班",
    "avatar": "https://cdn.studypulse.cn/avatar/001.jpg",
    "join_date": "2025-09-01",
    "stats": {
      "total_problems": 2847,
      "correct_rate": 0.713,
      "streak": 23,
      "pulse_points": 8540,
      "rank": "铂金",
      "study_time_today": 42,
      "study_time_week": 312,
      "badges_unlocked": 7,
      "wrong_book_count": 89,
      "pk_wins": 15,
      "pk_total": 22
    },
    "mastery": {
      "力学": {
        "overall": 0.72,
        "topics": {
          "牛顿运动定律": {
            "overall": 0.81,
            "knowledge_points": {
              "牛顿第一定律": {"mastery": 0.92, "confidence": 0.95, "trend": "stable", "last_practice": "2026-03-11"},
              "牛顿第二定律": {"mastery": 0.85, "confidence": 0.90, "trend": "up", "last_practice": "2026-03-12"},
              "连接体问题": {"mastery": 0.45, "confidence": 0.60, "trend": "down", "last_practice": "2026-03-05"}
            }
          }
        }
      },
      "电磁学": {
        "overall": 0.48,
        "topics": {}
      }
    },
    "weak_areas": [
      {"category": "电磁学", "topic": "电磁感应", "point": "楞次定律", "mastery": 0.23, "trend": "down"},
      {"category": "力学", "topic": "曲线运动", "point": "向心力", "mastery": 0.31, "trend": "stable"}
    ]
  }
}
```

### 2.2 获取学习历史

```
GET /students/{student_id}/history?page=1&limit=50&start=2026-03-01&end=2026-03-12
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "total": 847,
    "page": 1,
    "records": [
      {
        "id": "REC001",
        "problem_id": "PHY000123",
        "knowledge_point": "向心力",
        "category": "力学",
        "difficulty": 0.65,
        "is_correct": false,
        "time_spent": 128,
        "submitted_answer": "B",
        "correct_answer": "A",
        "timestamp": "2026-03-12T14:23:00Z"
      }
    ]
  }
}
```

### 2.3 获取学习日历数据

```
GET /students/{student_id}/calendar?days=90
```

**响应：**
```json
{
  "code": 200,
  "data": [
    {"date": "2026-03-12", "problems_done": 28, "correct_rate": 0.75, "study_minutes": 42},
    {"date": "2026-03-11", "problems_done": 35, "correct_rate": 0.71, "study_minutes": 55}
  ]
}
```

### 2.4 获取成就勋章

```
GET /students/{student_id}/badges
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "unlocked": [
      {"id": "BADGE_STREAK_7", "name": "连续7天", "icon": "⚡", "unlocked_at": "2026-02-15"},
      {"id": "BADGE_100", "name": "百题斩", "icon": "📝", "unlocked_at": "2026-01-20"}
    ],
    "locked": [
      {"id": "BADGE_STREAK_30", "name": "月度坚持", "icon": "🌟", "progress": "23/30", "progress_pct": 0.77}
    ]
  }
}
```

---

## 3. AI 追踪引擎接口

### 3.1 提交做题结果 & 实时更新画像

```
POST /ai/track
```

**请求体：**
```json
{
  "student_id": "STU00001",
  "problem_id": "PHY000123",
  "answer": "B",
  "is_correct": false,
  "time_spent": 128,
  "session_id": "sess_abc123"
}
```

**响应（AI 实时返回更新后的画像）：**
```json
{
  "code": 200,
  "data": {
    "mastery_update": {
      "knowledge_point": "向心力",
      "mastery_before": 0.35,
      "mastery_after": 0.31,
      "confidence": 0.70,
      "trend": "down"
    },
    "alerts": [
      {
        "type": "consecutive_wrong",
        "message": "检测到你在「向心力」连续3题出错",
        "action": "recommend_video",
        "data": {"video_id": "VID001", "title": "3分钟搞懂向心力"}
      }
    ],
    "xp_earned": 0,
    "streak_maintained": true
  }
}
```

### 3.2 获取AI推荐题目

```
POST /ai/recommend
```

**请求体：**
```json
{
  "student_id": "STU00001",
  "mode": "smart",
  "count": 10,
  "filters": {
    "category": "力学",
    "difficulty_range": [0.3, 0.7],
    "exclude_ids": ["PHY000001", "PHY000002"]
  }
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "problems": [
      {
        "id": "PHY000456",
        "category": "力学",
        "topic": "曲线运动",
        "knowledge_point": "向心力",
        "type": "选择题",
        "difficulty": 0.45,
        "question": "一个质量为m的小球...",
        "options": ["A. mv²/r", "B. mω²r", "C. mg", "D. 以上都不对"],
        "correct_answer": "A",
        "explanation": "向心力的本质是合力...",
        "recommend_reason": "你在「向心力」的掌握度为31%，推荐此基础题巩固"
      }
    ],
    "strategy": {
      "focus_areas": ["向心力", "楞次定律"],
      "difficulty_target": 0.45,
      "session_goal": "巩固薄弱知识点，预计完成后「向心力」掌握度可提升至45%"
    }
  }
}
```

### 3.3 获取AI每日任务

```
GET /ai/daily-tasks/{student_id}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "date": "2026-03-12",
    "tasks": [
      {
        "id": "TASK001",
        "type": "video",
        "title": "复习：向心力核心概念",
        "description": "观看3分钟讲解视频",
        "knowledge_point": "向心力",
        "xp_reward": 20,
        "estimated_time": 3,
        "is_completed": false,
        "resource_url": "https://..."
      },
      {
        "id": "TASK002",
        "type": "practice",
        "title": "专项练习：向心力 × 5题",
        "description": "AI精选5道针对性练习",
        "problem_ids": ["PHY000456", "PHY000789", "PHY000012", "PHY000345", "PHY000678"],
        "xp_reward": 30,
        "estimated_time": 15,
        "is_completed": false
      },
      {
        "id": "TASK003",
        "type": "review",
        "title": "错题回顾",
        "description": "重做昨天做错的3道题",
        "problem_ids": ["PHY000111", "PHY000222", "PHY000333"],
        "xp_reward": 20,
        "estimated_time": 10,
        "is_completed": true,
        "completed_at": "2026-03-12T08:30:00Z"
      }
    ],
    "daily_challenge": {
      "problems": ["PHY000901", "PHY000902", "PHY000903"],
      "deadline": "2026-03-12T22:00:00Z",
      "class_completion": {"done": 28, "total": 45}
    }
  }
}
```

### 3.4 完成任务

```
POST /ai/daily-tasks/{task_id}/complete
```

**请求体：**
```json
{
  "student_id": "STU00001",
  "results": {
    "problems_correct": 4,
    "problems_total": 5,
    "time_spent": 720
  }
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "xp_earned": 30,
    "total_xp": 8570,
    "tasks_completed_today": 3,
    "tasks_total_today": 5,
    "mastery_updates": [
      {"knowledge_point": "向心力", "before": 0.31, "after": 0.42}
    ]
  }
}
```

### 3.5 获取预测分数

```
GET /ai/predict/{student_id}?exam_type=期中考试
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "predicted_score": {"min": 72, "max": 81, "mean": 76},
    "confidence": 0.82,
    "breakdown": {
      "选择题": {"predicted": 42, "max": 48},
      "实验题": {"predicted": 12, "max": 15},
      "计算题": {"predicted": 22, "max": 37}
    },
    "improvement_plan": {
      "if_follow_plan": {"min": 78, "max": 86},
      "focus_areas": ["电磁感应", "向心力"],
      "daily_tasks_count": 5,
      "days_until_exam": 15
    }
  }
}
```

---

## 4. 题目与练习接口

### 4.1 获取题目详情

```
GET /problems/{problem_id}
```

### 4.2 搜索题目

```
GET /problems/search?category=力学&topic=曲线运动&kp=向心力&difficulty=0.3-0.7&type=选择题&page=1&limit=20
```

### 4.3 提交答案

```
POST /problems/{problem_id}/submit
```

**请求体：**
```json
{
  "student_id": "STU00001",
  "answer": "A",
  "time_spent": 95,
  "session_id": "sess_abc123",
  "mode": "ai_recommend"
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "is_correct": true,
    "correct_answer": "A",
    "explanation": "向心力的本质是...",
    "xp_earned": 15,
    "mastery_update": {"向心力": {"before": 0.42, "after": 0.48}},
    "similar_problems": ["PHY000457", "PHY000458", "PHY000459"],
    "ai_comment": "做得好！你对向心力的理解在进步。建议继续练习竖直面圆周运动。"
  }
}
```

### 4.4 获取错题本

```
GET /students/{student_id}/wrong-book?category=力学&status=unmastered&page=1&limit=20
```

### 4.5 PK 对战

```
POST /pk/match
```

**请求体：**
```json
{
  "student_id": "STU00001",
  "mode": "random",
  "category": "力学"
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "match_id": "PK20260312001",
    "opponent": {
      "id": "STU00089",
      "name": "王欣怡",
      "avatar": "https://...",
      "rank": "钻石"
    },
    "problems": ["PHY000501", "PHY000502", "PHY000503", "PHY000504", "PHY000505"],
    "time_per_round": 60,
    "websocket_url": "wss://ws.studypulse.cn/pk/PK20260312001"
  }
}
```

---

## 5. AI 对话接口

### 5.1 发送消息（流式响应）

```
POST /ai/chat
```

**请求体：**
```json
{
  "student_id": "STU00001",
  "message": "向心力和离心力有什么区别？",
  "session_id": "chat_abc123",
  "context": {
    "current_page": "practice",
    "current_problem_id": "PHY000456",
    "recent_mastery": {"向心力": 0.31}
  }
}
```

**响应（SSE 流式）：**
```
event: token
data: {"content": "向心力"}

event: token
data: {"content": "不是一种新的力"}

event: token
data: {"content": "！它是合力在径向方向上的分量。"}

event: done
data: {"total_tokens": 245, "suggested_actions": [{"type": "practice", "label": "练习向心力", "problem_ids": ["PHY000456"]}]}
```

### 5.2 获取对话历史

```
GET /ai/chat/{student_id}/history?session_id=chat_abc123
```

---

## 6. 社区接口

### 6.1 获取帖子流

```
GET /community/posts?filter=推荐&city=北京&grade=高二&page=1&limit=20
```

### 6.2 发布帖子

```
POST /community/posts
Content-Type: multipart/form-data
```

**字段：**
```
title: 向心力终于搞懂了
content: 今天花了两个小时...
type: 解题笔记
tags: ["力学", "向心力"]
images: [file1.jpg, file2.jpg]
```

### 6.3 点赞/收藏/评论

```
POST /community/posts/{post_id}/like
POST /community/posts/{post_id}/bookmark
POST /community/posts/{post_id}/comment
```

### 6.4 搜索帖子

```
GET /community/search?q=向心力&city=北京&grade=高二
```

---

## 7. 家长端接口

### 7.1 获取孩子学情概况

```
GET /parent/child/{child_id}/overview
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "child": {"name": "张浩然", "school": "北京四中", "grade": "高二"},
    "today": {
      "study_time": 42,
      "problems_done": 28,
      "correct_rate": 0.75,
      "streak": 23,
      "class_rank": 12
    },
    "weekly_report": {
      "problems_done": 156,
      "correct_rate": 0.713,
      "correct_rate_change": 0.032,
      "study_hours": 5.2,
      "daily_challenge_completed": 5,
      "daily_challenge_total": 7,
      "biggest_improvement": {"point": "圆周运动", "change": 0.18},
      "needs_attention": [
        {"point": "楞次定律", "mastery": 0.23, "days_since_practice": 5}
      ]
    },
    "predicted_exam_score": {"min": 72, "max": 81}
  }
}
```

### 7.2 获取周报（每周日推送）

```
GET /parent/child/{child_id}/weekly-report?week=2026-W11
```

### 7.3 设置提醒偏好

```
PUT /parent/preferences
```

**请求体：**
```json
{
  "alert_frequency": "moderate",
  "positive_alerts": true,
  "negative_alerts": true,
  "weekly_report_time": "20:00",
  "wechat_notify": true
}
```

---

## 8. 学校端接口

### 8.1 班级数据面板

```
GET /school/class/{class_id}/dashboard
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "class_info": {"school": "北京四中", "grade": "高二", "class": "3班", "student_count": 45},
    "overview": {
      "avg_correct_rate": 0.68,
      "avg_problems_per_student": 87,
      "active_students": 42,
      "avg_streak": 12
    },
    "knowledge_heatmap": {
      "牛顿第二定律": {"avg_mastery": 0.78, "students_below_50": 5},
      "向心力": {"avg_mastery": 0.45, "students_below_50": 22},
      "电磁感应": {"avg_mastery": 0.38, "students_below_50": 28}
    },
    "at_risk_students": [
      {"id": "STU00015", "name": "李某", "overall_rate": 0.35, "streak": 0, "alert": "连续5天未学习"}
    ]
  }
}
```

### 8.2 布置作业

```
POST /school/assignments
```

**请求体：**
```json
{
  "teacher_id": "T2024001",
  "class_id": "CLS003",
  "title": "电磁感应专项练习",
  "knowledge_points": ["法拉第电磁感应定律", "楞次定律"],
  "problem_count": 15,
  "difficulty_range": [0.3, 0.6],
  "deadline": "2026-03-15T22:00:00Z",
  "target_students": "all"
}
```

### 8.3 上传考试成绩（批量分析）

```
POST /school/exam/upload
Content-Type: multipart/form-data
```

**字段：**
```
class_id: CLS003
exam_name: 2026年高二期中考试
file: exam_scores.csv
```

**CSV 格式：**
```csv
学号,姓名,总分,选择1,选择2,...,计算1,计算2,...
STU00001,张浩然,85,6,6,...,12,10,...
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "analysis": {
      "class_avg": 68.5,
      "max": 95,
      "min": 32,
      "median": 70,
      "score_distribution": {"90+": 3, "80-89": 8, "70-79": 15, "60-69": 12, "<60": 7},
      "weakest_knowledge_points": [
        {"point": "电磁感应", "avg_score_rate": 0.35, "students_below_avg": 28},
        {"point": "向心力", "avg_score_rate": 0.42, "students_below_avg": 22}
      ],
      "recommendations": "建议下周重点复习「电磁感应」和「向心力」，已为全班生成专项练习"
    }
  }
}
```

---

## 9. Webhook 回调

### 9.1 注册 Webhook

```
POST /webhooks
```

**请求体：**
```json
{
  "url": "https://your-server.com/webhook",
  "events": [
    "student.streak_broken",
    "student.mastery_below_threshold",
    "student.badge_unlocked",
    "student.daily_challenge_completed",
    "class.assignment_completed"
  ],
  "secret": "your_webhook_secret"
}
```

### 9.2 Webhook 事件格式

```json
{
  "event": "student.mastery_below_threshold",
  "timestamp": "2026-03-12T14:30:00Z",
  "data": {
    "student_id": "STU00001",
    "knowledge_point": "楞次定律",
    "mastery": 0.23,
    "threshold": 0.30,
    "consecutive_wrong": 5,
    "recommended_action": "推送专项练习"
  },
  "signature": "sha256=xxx"
}
```

---

## 错误码

| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证（Token 无效/过期） |
| 403 | 无权限（如家长访问非自己孩子的数据） |
| 404 | 资源不存在 |
| 429 | 请求频率超限 |
| 500 | 服务器内部错误 |

**错误响应格式：**
```json
{
  "code": 400,
  "error": "invalid_parameter",
  "message": "参数 student_id 格式不正确",
  "request_id": "req_abc123"
}
```

---

## 接入指南

### 1. 获取 API Key

联系管理员获取 `API_KEY` 和 `API_SECRET`。

### 2. 认证流程

```
1. 用户登录 → POST /auth/login → 获取 token
2. 所有后续请求携带 Header: Authorization: Bearer <token>
3. Token 过期后用 refresh_token 刷新
```

### 3. AI 追踪引擎接入

```
1. 学生每次提交答案 → POST /ai/track
2. AI 返回更新后的 mastery + 弹窗建议
3. 前端根据 alerts 数组显示 Pop-up
4. 获取下一批推荐题 → POST /ai/recommend
```

### 4. 流式 AI 对话接入

```javascript
const eventSource = new EventSource('/ai/chat/stream?token=xxx');

eventSource.addEventListener('token', (e) => {
  const data = JSON.parse(e.data);
  appendToChat(data.content); // 逐字追加到聊天框
});

eventSource.addEventListener('done', (e) => {
  const data = JSON.parse(e.data);
  showSuggestedActions(data.suggested_actions);
});
```

### 5. WebSocket PK 对战

```javascript
const ws = new WebSocket('wss://ws.studypulse.cn/pk/PK20260312001');

ws.onmessage = (e) => {
  const data = JSON.parse(e.data);
  switch (data.type) {
    case 'opponent_answered':
      updateOpponentScore(data.score);
      break;
    case 'round_result':
      showRoundResult(data);
      break;
    case 'match_end':
      showFinalResult(data);
      break;
  }
};

// 提交答案
ws.send(JSON.stringify({
  type: 'answer',
  round: 1,
  answer: 'A',
  time_spent: 23
}));
```

---

## Rate Limits

| 接口类型 | 限制 |
|---------|------|
| 认证 | 10 次/分钟 |
| 题目提交 | 60 次/分钟 |
| AI 推荐 | 20 次/分钟 |
| AI 对话 | 10 次/分钟 |
| 社区 | 30 次/分钟 |
| 家长端 | 20 次/分钟 |
| 学校端 | 30 次/分钟 |

---

*学脉 StudyPulse API v1.0 | 机密文件*
