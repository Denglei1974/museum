/**
 * MongoDB Data API 封装
 * Edge Runtime 兼容 — 纯 fetch，零原生依赖
 * 使用前需在 MongoDB Atlas 控制台启用 Data API 并填入环境变量
 */

const API_BASE = process.env.MONGO_DATA_API_BASE;
const API_KEY = process.env.MONGO_DATA_API_KEY;
const DB_NAME = process.env.MONGO_DB_NAME || "museum";
const CLUSTER_NAME = process.env.MONGO_CLUSTER_NAME || "DengleiDB";

function req(action: string, body: Record<string, unknown>) {
  return fetch(`${API_BASE}/action/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": API_KEY!,
    },
    body: JSON.stringify({
      dataSource: CLUSTER_NAME,
      database: DB_NAME,
      ...body,
    }),
  });
}

// ---------- 单文档操作 ----------

export async function findOne(collection: string, filter: object) {
  const res = await req("findOne", { collection, filter });
  const data = await res.json();
  return data.document || null;
}

export async function insertOne(collection: string, document: object) {
  const res = await req("insertOne", { collection, document });
  const data = await res.json();
  return data.insertedId;
}

export async function updateOne(
  collection: string,
  filter: object,
  update: object,
) {
  const res = await req("updateOne", { collection, filter, update });
  return (await res.json()).modifiedCount;
}

export async function deleteOne(collection: string, filter: object) {
  const res = await req("deleteOne", { collection, filter });
  return (await res.json()).deletedCount;
}

// ---------- 多文档操作 ----------

export async function find(
  collection: string,
  filter: object = {},
  options?: { sort?: object; limit?: number },
) {
  const body: Record<string, unknown> = { collection, filter };
  if (options?.sort) body.sort = options.sort;
  if (options?.limit) body.limit = options.limit;
  const res = await req("find", body);
  const data = await res.json();
  return data.documents as object[];
}

export async function countDocuments(
  collection: string,
  filter: object = {},
) {
  const res = await req("count", { collection, query: filter });
  const data = await res.json();
  return data.count;
}
