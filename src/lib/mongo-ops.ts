/**
 * MongoDB 原生驱动连接
 * 使用 mongodb+srv:// 连接，不用 Data API
 */

import { MongoClient, Db, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("请设置环境变量 MONGODB_URI");
}

const DB_NAME = process.env.MONGO_DB_NAME || "museum";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  const client = new MongoClient(MONGODB_URI!);
  await client.connect();
  cachedClient = client;
  cachedDb = client.db(DB_NAME);
  return cachedDb;
}

// 便捷集合访问
export async function getCollection(name: string) {
  const db = await getDb();
  return db.collection(name);
}

// ========== 通用操作 ==========

export async function findOne(collectionName: string, filter: object) {
  const col = await getCollection(collectionName);
  return col.findOne(filter);
}

export async function find(
  collectionName: string,
  filter: object = {},
  options?: { sort?: Record<string, 1 | -1>; limit?: number; projection?: object },
) {
  const col = await getCollection(collectionName);
  let cursor = col.find(filter);
  if (options?.sort) cursor = cursor.sort(options.sort);
  if (options?.limit) cursor = cursor.limit(options.limit);
  if (options?.projection) cursor = cursor.project(options.projection);
  return cursor.toArray();
}

export async function insertOne(collectionName: string, document: object) {
  const col = await getCollection(collectionName);
  const result = await col.insertOne(document);
  return result.insertedId;
}

export async function insertMany(collectionName: string, documents: object[]) {
  if (documents.length === 0) return { insertedIds: [] };
  const col = await getCollection(collectionName);
  const result = await col.insertMany(documents);
  return result.insertedIds;
}

export async function updateOne(
  collectionName: string,
  filter: object,
  update: object,
) {
  const col = await getCollection(collectionName);
  const result = await col.updateOne(filter, update);
  return result.modifiedCount;
}

export async function deleteOne(collectionName: string, filter: object) {
  const col = await getCollection(collectionName);
  const result = await col.deleteOne(filter);
  return result.deletedCount;
}

export async function countDocuments(
  collectionName: string,
  filter: object = {},
) {
  const col = await getCollection(collectionName);
  return col.countDocuments(filter);
}

export async function aggregate(collectionName: string, pipeline: object[]) {
  const col = await getCollection(collectionName);
  return col.aggregate(pipeline).toArray();
}

// ========== 业务便捷方法 ==========

export const Users = {
  findByPhone: (phone: string) => findOne("users", { phone }),
  findAll: (filter?: object) =>
    find("users", filter || {}, { sort: { createdAt: -1 } }),
  create: (doc: object) =>
    insertOne("users", {
      ...doc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  update: (phone: string, doc: object) =>
    updateOne("users", { phone }, { $set: { ...doc, updatedAt: new Date().toISOString() } }),
  delete: (phone: string) => deleteOne("users", { phone }),
};

export const Volunteers = {
  findByPhone: (phone: string) => findOne("volunteers", { phone }),
  findAll: (filter?: object, options?: object) =>
    find("volunteers", filter || {}, options),
  create: (doc: object) =>
    insertOne("volunteers", {
      ...doc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  update: (phone: string, doc: object) =>
    updateOne("volunteers", { phone }, { $set: { ...doc, updatedAt: new Date().toISOString() } }),
  delete: (phone: string) => deleteOne("volunteers", { phone }),
};

export const Recruitments = {
  findById: (id: string) => findOne("recruitments", { _id: new ObjectId(id) }),
  findAll: (filter?: object, options?: object) =>
    find("recruitments", filter || {}, options),
  create: (doc: object) =>
    insertOne("recruitments", {
      ...doc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  update: (id: string, doc: object) =>
    updateOne("recruitments", { _id: new ObjectId(id) }, { $set: { ...doc, updatedAt: new Date().toISOString() } }),
  delete: (id: string) => deleteOne("recruitments", { _id: new ObjectId(id) }),
};

export const Checkins = {
  findByPhoneAndDate: (phone: string, date: string) =>
    findOne("checkins", { phone, date }),
  findByPhone: (phone: string, options?: object) =>
    find("checkins", { phone }, options),
  findByRecruitment: (recruitmentId: string) =>
    find("checkins", { recruitmentId }, { sort: { checkedInAt: 1 } }),
  create: (doc: object) =>
    insertOne("checkins", { ...doc, createdAt: new Date().toISOString() }),
  update: (id: string, doc: object) => {
    // id might be an ObjectId from MongoDB or a string
    let filter: object;
    try {
      filter = { _id: new ObjectId(id) };
    } catch {
      filter = { _id: id };
    }
    return updateOne("checkins", filter, { $set: doc });
  },
};

export const Approvals = {
  findById: (id: string) => {
    try {
      return findOne("approvals", { _id: new ObjectId(id) });
    } catch {
      return findOne("approvals", { _id: id });
    }
  },
  findAll: (filter?: object, options?: object) =>
    find("approvals", filter || {}, options),
  create: (doc: object) =>
    insertOne("approvals", {
      ...doc,
      status: "pending",
      createdAt: new Date().toISOString(),
    }),
  update: (id: string, doc: object) => {
    try {
      return updateOne("approvals", { _id: new ObjectId(id) }, { $set: doc });
    } catch {
      return updateOne("approvals", { _id: id }, { $set: doc });
    }
  },
};

// Export ObjectId for API routes that need it
export { ObjectId };
