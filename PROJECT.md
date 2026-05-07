# 博物馆志愿者服务时长管理系统 — 项目文档

> 最后更新：2026-05-02

---

## 一、项目概述

**定位**：面向博物馆志愿者管理的全栈 Web 应用，核心功能包括志愿者注册、活动招募、签到签退、服务时长统计、管理后台。

**用户群体**：
- **志愿者**：社会志愿者、高校志愿者、青少年志愿者（年龄偏大 + 低龄儿童，界面极度简化）
- **组长/负责人**：管理对应队伍的志愿者
- **管理员**：发布管理、审核管理

**核心原则**：零成本、零安装、老人友好

---

## 二、技术架构

### 2.1 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Next.js 16 + React 19 | 16.2.2 |
| 样式 | TailwindCSS 4 | - |
| UI 组件 | HeroUI | 3.0.1 |
| 运行时 | Node.js | 22 LTS |
| 数据库 | MongoDB | 8.0 |
| Web 服务器 | Nginx | 1.26.3 |
| 进程管理 | PM2 | 6.0 |
| OS | Debian | 13 (trixie) |

### 2.2 部署架构

```
用户浏览器
    │ HTTPS
    ▼
Nginx (80端口) → 反向代理
    │
    ▼
Next.js (端口 3001)
    │
    ▼
MongoDB (本地 27017)
```

**服务器**：腾讯云轻量应用服务器 `82.157.205.115`（4核4G 40GB SSD）
**部署目录**：`/opt/museum`

### 2.3 关键文件

| 文件 | 作用 |
|------|------|
| `/opt/museum/ecosystem.config.js` | PM2 配置 + 环境变量 |
| `/opt/museum/.env.production` | 生产环境变量 |
| `/etc/nginx/sites-available/museum` | Nginx 反向代理配置 |
| `next.config.ts` | Next.js 配置 |
| `src/lib/mongo-ops.ts` | MongoDB 原生驱动封装 |
| `src/lib/auth/roles.ts` | 角色系统 |
| `src/components/nav/volunteer-nav.tsx` | 底部导航组件 |

---

## 三、角色体系

### 3.1 角色定义

| 角色 | 代码 | 说明 | 界面颜色 |
|------|------|------|----------|
| 社会志愿者 | `social_volunteer` | 普通志愿者 |  绿色 |
| 高校志愿者 | `university_volunteer` | 高校学生志愿者 | 🟢 绿色 |
| 青少年志愿者 | `youth_volunteer` | 青少年志愿者 | 🟢 绿色 |
| 高校负责人 | `university_leader` | 管理高校志愿者 | 🟠 橙色 |
| 社会组长 | `social_leader` | 管理社会志愿者 | 🟠 橙色 |
| 青少年管理员 | `youth_admin` | 管理青少年志愿者 | 🟠 橙色 |
| 发布管理员 | `publish_admin` | 发布招募活动 | 🔵 蓝色 |
| 审核管理员 | `review_admin` | 审核补录申请 | 🔵 蓝色 |

### 3.2 权限规则

- **志愿者**：查看招募、报名、签到签退、查看时长、个人中心
- **组长**：查看本组志愿者、查看签到记录（只读）
- **发布管理员**：创建/编辑/删除招募活动
- **审核管理员**：审批签到补录申请

---

## 四、数据库结构

### 4.1 集合概览

| 集合 | 说明 |
|------|------|
| `users` | 用户账号（手机号、密码、角色） |
| `volunteers` | 志愿者详情（姓名、身份证、学校等） |
| `recruitments` | 招募活动 |
| `signups` | 报名记录 |
| `checkins` | 签到签退记录 |
| `approvals` | 审批记录 |

### 4.2 招募活动 (recruitments)

```javascript
{
  _id: ObjectId,
  title: string,           // 活动标题
  type: "daily" | "event", // 日常服务 / 特殊活动
  description: string,     // 活动描述
  startDate: string,       // 开始日期 YYYY-MM-DD
  endDate: string,         // 结束日期
  startTime: string,       // 开始时间 HH:MM
  endTime: string,         // 结束时间
  maxPeople: number,       // 总招募人数
  maxPerSlot: number,      // 每个时段最大人数（默认4）
  positions: string[],     // 岗位列表 ["讲解", "引导"]
  location: string,        // 地点
  targetRole: string,      // 目标角色（可选）
  status: "active" | "inactive",
  createdBy: string,       // 创建者手机号
  createdAt: ISOString,
  updatedAt: ISOString
}
```

### 4.3 报名记录 (signups)

```javascript
{
  _id: ObjectId,
  recruitmentId: string,   // 活动ID
  phone: string,           // 志愿者手机号
  username: string,
  role: string,
  selectedSlots: string[], // 选择的时段 ["9","10","11"]
  status: "confirmed" | "cancelled",
  createdAt: ISOString
}
```

### 4.4 签到记录 (checkins)

```javascript
{
  _id: ObjectId,
  phone: string,
  date: string,            // YYYY-MM-DD
  checkInTime: string,     // HH:MM
  checkOutTime: string,
  hours: number,           // 服务时长（小时）
  recruitmentId: string,   // 关联活动（可选）
  positions: string[],     // 岗位
  location: string,
  status: "normal" | "manual",
  createdAt: ISOString
}
```

### 4.5 用户账号 (users)

```javascript
{
  _id: ObjectId,
  phone: string,           // 手机号（唯一）
  passwordHash: string,
  role: string,
  mustChangePassword: boolean,
  createdAt: ISOString
}
```

### 4.6 志愿者详情 (volunteers)

```javascript
{
  _id: ObjectId,
  phone: string,           // 关联用户手机号
  name: string,            // 姓名
  uid: string,             // 志愿者编号
  idCard: string,          // 身份证号
  gender: string,          // 性别（身份证解析）
  birthday: string,        // 生日（身份证解析）
  volunteerType: string,
  school: string,
  specialty: string,
  address: string,
  createdAt: ISOString,
  updatedAt: ISOString
}
```

---

## 五、业务流程

### 5.1 志愿者注册流程

```
管理员创建账号
    ↓
志愿者首次登录（手机号+初始密码）
    ↓
强制修改密码
    ↓
完善志愿者信息（姓名、身份证等）
    ↓
系统自动从身份证解析：性别、生日
    ↓
进入志愿者主页
```

### 5.2 活动报名流程

```
志愿者登录 → 首页查看招募活动
    ↓
点击"立刻报名" → 进入报名页
    ↓
查看活动信息（岗位类型、日期 — 系统默认，不可改）
    ↓
选择服务时段（2-6个连续时段，余额>0才可选）
    ↓
点击"立刻报名"提交
    ↓
系统验证：连续性 + 余额充足 + 未重复报名
    ↓
报名成功 → 返回首页
```

### 5.3 签到签退流程

```
志愿者到达 → 点击"签到"按钮
    ↓
系统记录签到时间
    ↓
服务结束 → 点击"签退"按钮
    ↓
系统自动计算服务时长（签退 - 签到）
    ↓
时长记录存入数据库
    ↓
如有需要，可走审批流程补录
```

### 5.4 管理员发布活动流程

```
发布管理员登录 → 进入管理后台
    ↓
招募管理 → 发布新活动
    ↓
填写：标题、类型、描述、日期、时间、岗位、地点、招募人数
    ↓
设置每个时段最大人数（maxPerSlot）
    ↓
发布成功 → 志愿者端立即可见
```

### 5.5 登录鉴权流程

```
用户输入手机号 + 密码 → POST /api/auth/login
    ↓
验证成功 → 生成 JWT token（base64编码，存Cookie）
    ↓
设置 auth-token Cookie（24小时有效期）
    ↓
判断角色 → 志愿者跳 /dashboard，管理员跳 /admin/volunteers
    ↓
各页面从 Cookie 解析 token 获取用户信息
    ↓
Token 过期 → 重定向到 /signin
```

---

## 六、页面路由

### 6.1 志愿者端

| 路由 | 说明 | 底部导航 |
|------|------|----------|
| `/signin` | 登录页 | - |
| `/change-password` | 修改密码 | - |
| `/dashboard` | 志愿者主页（欢迎语 + 博物馆图 + 招募 + 导航） | ✅ 首页 |
| `/signup/[id]` | 活动报名页（选时段） | - |
| `/checkin` | 签到签退页 | ✅ 签到 |
| `/myhours` | 我的时长（当日 + 年度累计 + 记录列表） | - |
| `/profile` | 个人中心（个人信息、参与活动、荣誉时长） | ✅ 个人中心 |
| `/profile/info` | 个人信息页 | - |
| `/profile/activities` | 参与活动页 | - |
| `/recruit` | 招募活动列表页 | - |

### 6.2 管理后台

| 路由 | 说明 |
|------|------|
| `/admin/volunteers` | 志愿者管理（搜索/筛选/手动录入/Excel导入导出） |
| `/admin/recruitments` | 招募管理（发布/状态切换） |
| `/admin/checkins` | 签到管理（按日期查询 + 补录审批） |
| `/admin/reports` | 数据报表（按年/类别筛选 + 导出） |
| `/admin/approvals` | 审批中心（待审批列表 + 通过/驳回） |

### 6.3 API 路由

| API | 方法 | 说明 |
|-----|------|------|
| `/api/auth/login` | POST | 登录 |
| `/api/auth/logout` | POST | 登出 |
| `/api/auth/change-password` | POST | 修改密码 |
| `/api/recruitments` | GET/POST | 获取招募列表 / 创建招募 |
| `/api/recruitments/[id]` | GET | 获取单个招募详情 |
| `/api/signups` | GET/POST | 获取报名列表 / 提交报名 |
| `/api/signups/[id]` | GET | 获取活动可用时段列表 |
| `/api/checkins` | GET/POST | 签到记录查询 / 签到签退 |
| `/api/my-hours` | GET | 获取我的服务时长 |
| `/api/my-activities` | GET | 获取我的参与活动 |
| `/api/volunteers` | GET/POST | 志愿者列表 / 创建志愿者 |
| `/api/volunteers/me` | GET | 获取当前志愿者信息 |
| `/api/users` | GET/POST | 用户列表 / 创建用户 |
| `/api/approvals` | GET/POST/PATCH | 审批列表 / 创建 / 审批操作 |
| `/api/reports` | GET | 数据报表 |

---

## 七、认证机制

### 7.1 Token 机制

- **方式**：Cookie-based JWT
- **有效期**：24小时
- **编码**：base64（非加密，仅编码）
- **存储**：Cookie `auth-token`

### 7.2 Token 结构

```javascript
{
  phone: string,      // 手机号
  username: string,   // 用户名
  role: string,       // 角色
  exp: number         // 过期时间戳（毫秒）
}
```

### 7.3 鉴权方式

- **页面级**：服务端组件从 Cookie 读取 token，验证后渲染或 redirect
- **API 级**：`verifyToken(request)` 从请求头或 Cookie 提取验证

---

## 八、部署操作

### 8.1 部署命令

```bash
cd /opt/museum
npm install
npm run build
pm2 restart museum
```

### 8.2 本地开发

```bash
# SSH 隧道连接远程数据库
ssh -f -N -L 27018:127.0.0.1:27017 root@82.157.205.115

# 本地开发服务器
cd /home/denglei1974/museum
npm run dev
```

### 8.3 环境变量

**生产环境**（`/opt/museum/.env.production`）：
```
MONGODB_URI=mongodb://museum_admin:Museum%402026Secure@127.0.0.1:27017/museum
NEXTAUTH_SECRET=xxx
```

**本地开发**（`.env.local`）：
```
MONGODB_URI=mongodb://museum_admin:Museum%402026Secure@127.0.0.1:27018/museum
NEXTAUTH_SECRET=xxx
```

---

## 九、账号信息

| 账号 | 密码 | 角色 | 说明 |
|------|------|------|------|
| 13940363916 | 123456 | social_volunteer | 测试志愿者 |
| 13940363917 | - | admin | 管理员账号（邓磊） |

**SSH**：root@82.157.205.115（密码：0404ab@#）
**MongoDB**：museum_admin / Museum@2026Secure

---

## 十、设计原则

1. **老人友好**：大字体、大按钮、一页一功能
2. **颜色区分**：志愿者=绿色，组长=橙色，管理员=蓝色
3. **零成本**：MongoDB Atlas 免费层（已迁移到本地）
4. **无需第三方**：纯前端身份证解析、纯 Cookie 认证
5. **架构稳定**：Nginx → Next.js → MongoDB，不轻易修改

---

## 十一、待完善事项

- [ ] 招募管理 PATCH 路由（编辑活动）
- [ ] 测试数据补充
- [ ] Excel 导入导出功能完善
- [ ] 登录页 UI 进一步优化
- [ ] 生产环境 HTTPS 证书配置

---

## 十二、已废弃

- ❌ EdgeOne Pages 部署
- ❌ 腾讯云 SCF 云函数代理
- ❌ MongoDB Atlas 远程数据库
- ❌ `src/lib/api-proxy.ts` / `scf-proxy.ts`
- ❌ 旧阿里云服务器 39.106.15.105
