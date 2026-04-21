/**
 * 腾讯云 SCF 云函数 — 数据库代理
 * 接收来自 Edge Pages 的 HTTP 请求，用 Mongoose 操作 MongoDB Atlas
 * 运行时: Node.js 18+
 * 触发方式: API Gateway
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 缓存连接，避免每次调用都新建
let cachedConn = null;

async function getDb() {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }
  cachedConn = await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGO_DB_NAME || "Museum",
    serverSelectionTimeoutMS: 5000,
  });
  return cachedConn;
}

// 用户 Schema
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    id_card: { type: String, required: true, unique: true },
    user_type: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

// 兼容两种哈希格式：bcrypt ($2a$...) 和 Web Crypto PBKDF2 (hex:hex)
UserSchema.methods.comparePassword = async function (plain) {
  if (this.password.startsWith("$2")) {
    // bcrypt 格式
    return bcrypt.compare(plain, this.password);
  }
  // PBKDF2 格式: saltHex:hashHex
  const [saltHex, expectedHash] = this.password.split(":");
  if (!saltHex || !expectedHash) return false;

  const crypto = require("crypto");
  const salt = Buffer.from(saltHex, "hex");
  const derived = crypto.pbkdf2Sync(plain, salt, 100000, 32, "sha256");
  return derived.toString("hex") === expectedHash;
};

// 注册前自动哈希密码
UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && !this.password.startsWith("$2") && !this.password.includes(":")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

/**
 * SCF 入口函数
 * @param {Object} event - API Gateway 触发事件
 */
exports.main_handler = async (event) => {
  try {
    const httpMethod = event.httpMethod || event.requestContext?.http?.method;
    const path = event.path || event.requestContext?.http?.path;

    let body = {};
    if (event.body) {
      try {
        body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
      } catch {
        body = {};
      }
    }

    await getDb();
    const result = await handleRoute(httpMethod, path, body);

    return {
      statusCode: result.status || 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result.data),
    };
  } catch (error) {
    console.error("SCF Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "服务器错误" }),
    };
  }
};

async function handleRoute(method, path, body) {
  // POST /api/users — 注册用户
  if (method === "POST" && path === "/api/users") {
    const { username, id_card, user_type, phone, password } = body;

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return { status: 400, data: { message: "该电话号码已被注册" } };

    const existingIdCard = await User.findOne({ id_card });
    if (existingIdCard) return { status: 400, data: { message: "该身份证号已被注册" } };

    const user = new User({ username, id_card, user_type, phone, password });
    await user.save();
    return { status: 201, data: { message: "用户创建成功" } };
  }

  // POST /api/auth/login — 登录
  if (method === "POST" && path === "/api/auth/login") {
    const { phone, password } = body;

    if (!phone || !password) {
      return { status: 400, data: { message: "请输入电话号码和密码" } };
    }

    const user = await User.findOne({ phone });
    if (!user) return { status: 401, data: { message: "电话号码或密码错误" } };

    const ok = await user.comparePassword(password);
    if (!ok) return { status: 401, data: { message: "电话号码或密码错误" } };

    const payload = {
      id: user._id.toString(),
      phone: user.phone,
      username: user.username,
      user_type: user.user_type,
      ts: Date.now(),
    };
    const token = Buffer.from(JSON.stringify(payload)).toString("base64");

    return {
      status: 200,
      data: {
        message: "登录成功",
        token,
        user: { username: user.username, user_type: user.user_type, phone: user.phone },
      },
    };
  }

  return { status: 404, data: { message: "Not Found" } };
}
