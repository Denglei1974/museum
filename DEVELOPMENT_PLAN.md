# 博物馆志愿者服务时长管理系统 - 开发计划

## 技术栈
- Next.js 16 + React 19 + TailwindCSS 4 + HeroUI
- MongoDB Atlas Data API (免费层)
- Web Crypto API (密码加密)
- xlsx (SheetJS) - Excel 导入导出
- 纯 Cookie Token 认证 (24h 有效期)

## 角色定义
| 角色代码 | 名称 | 权限 |
|----------|------|------|
| social_volunteer | 社会志愿者 | 查看招募→报名→签到→查时长 |
| university_volunteer | 高校志愿者 | 同上 |
| youth_volunteer | 青少年志愿者 | 同上 |
| university_leader | 高校负责人 | 查看对应队伍名单与时长 |
| social_leader | 社会组长 | 查看对应队伍名单与时长 |
| youth_admin | 青少年管理员 | 查看对应队伍名单与时长 |
| publish_admin | 发布管理员 | 发布招募、查看全部信息、补录时长 |
| review_admin | 审核管理员 | 审批所有修改 |

## 数据库集合
1. users - 用户账号
2. volunteers - 志愿者档案
3. recruitments - 招募活动
4. checkins - 签到记录
5. approvals - 审批记录

## 开发阶段
- Phase 1: 基础设施 (auth、middleware、role、mongo)
- Phase 2: 登录美化 + 角色配色 + PWA
- Phase 3: 志愿者管理 + Excel 导入导出
- Phase 4: 招募管理 + 报名
- Phase 5: 签到签退 + 时长计算
- Phase 6: 审批流程 + 数据看板
