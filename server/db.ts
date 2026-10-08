import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { adminAccess, appointments, InsertAppointment, InsertServiceLocation, InsertUser, serviceLocations, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database is not available");
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    const invitedAdmin = user.email ? await db.select({ id: adminAccess.id }).from(adminAccess).where(and(eq(adminAccess.email, user.email), eq(adminAccess.active, 1))).limit(1) : [];
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (invitedAdmin.length > 0) {
      values.role = "admin";
      updateSet.role = "admin";
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserProfileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function updateUserProfile(id: number, input: Partial<Pick<InsertUser, "name" | "email" | "phone" | "city" | "state" | "gender" | "appRole">>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(users).set(input).where(eq(users.id, id));
  return getUserProfileById(id);
}

export async function deleteUserProfile(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(users).where(eq(users.id, id));
  return { success: true as const };
}

export async function listServiceLocations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serviceLocations);
}

export async function createServiceLocation(input: Omit<InsertServiceLocation, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(serviceLocations).values(input);
  return { id: Number(result[0].insertId), ...input };
}

export async function updateServiceLocation(id: number, input: Partial<Pick<InsertServiceLocation, "name" | "city" | "phone" | "email" | "status">>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(serviceLocations).set(input).where(eq(serviceLocations.id, id));
  const result = await db.select().from(serviceLocations).where(eq(serviceLocations.id, id)).limit(1);
  return result[0];
}

export async function deleteServiceLocation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(serviceLocations).where(eq(serviceLocations.id, id));
  return { success: true as const };
}

export async function listAppointments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).where(eq(appointments.userId, userId));
}

export async function createAppointment(input: Omit<InsertAppointment, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(appointments).values(input);
  return { id: Number(result[0].insertId), ...input };
}

export async function deleteAppointment(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(appointments).where(and(eq(appointments.id, id), eq(appointments.userId, userId)));
  return { success: true as const };
}

export async function listAdminAccess() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminAccess);
}

export async function createAdminAccess(email: string, createdBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const current = await db.select({ id: adminAccess.id }).from(adminAccess);
  if (current.length >= 2) throw new Error("ADMIN_ACCESS_LIMIT_REACHED");
  await db.insert(adminAccess).values({ email, createdBy, active: 1 });
  return { success: true as const };
}

export async function deleteAdminAccess(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const target = await db.select({ email: adminAccess.email }).from(adminAccess).where(eq(adminAccess.id, id)).limit(1);
  await db.delete(adminAccess).where(eq(adminAccess.id, id));
  if (target[0]?.email) await db.update(users).set({ role: "user" }).where(eq(users.email, target[0].email));
  return { success: true as const };
}

// TODO: add feature queries here as your schema grows.
