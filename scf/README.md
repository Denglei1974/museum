# SCF 云函数部署指南

## 架构

```
Edge Pages (纯 fetch) → 腾讯云 SCF (Mongoose) → MongoDB Atlas
```

## 一、部署 SCF 云函数

### 1. 创建云函数

登录 [腾讯云 SCF 控制台](https://console.cloud.tencent.com/scf)

- 创建函数 → 自定义创建
- **运行环境**: Node.js 18.15 (或更高)
- **提交方法**: 本地上传 zip 包
- **执行方法**: `index.main_handler`

### 2. 打包上传

在项目根目录执行：

```bash
cd scf
npm install
cd ..
# 打包 scf 目录为 zip，上传到 SCF
```

或者在腾讯云控制台直接在线编辑，把 `index.js` 内容粘贴进去，然后在「依赖安装」里添加 `mongoose` 和 `bcryptjs`。

### 3. 配置环境变量

在 SCF 函数配置中设置：

```
MONGODB_URI=mongodb+srv://Admin:你的密码@dengleidb.xe4ey63.mongodb.net/?appName=DengleiDB
MONGO_DB_NAME=Museum
```

### 4. 配置 API Gateway 触发器

在 SCF 函数 → 触发管理 → 创建触发器

- 触发方式: **API Gateway 触发**
- 发布环境: **发布**
- 认证方式: **免鉴权**（Edge Pages 调用）

创建后会得到一个地址，类似：
```
https://service-xxxxxx.gz.apigw.tencentcs.com/release
```

## 二、配置 Edge Pages

在 Edge Pages 的环境变量中添加：

```
SCF_API_BASE=https://service-xxxxxx.gz.apigw.tencentcs.com/release
```

## 三、验证

部署后访问 `/api/auth/login`，Edge 会自动转发请求到 SCF，SCF 用 Mongoose 查库返回结果。

## 注意事项

- SCF 免费额度: 每月 400,000 GBs，足够小型项目使用
- 确保 MongoDB Atlas 的 IP 白名单包含 SCF 的出口 IP（或设为 0.0.0.0/0）
- SCF 冷启动时连接 MongoDB 会有 1-2 秒延迟，连接池会缓存复用
