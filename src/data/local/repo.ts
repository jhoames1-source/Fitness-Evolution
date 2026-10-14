/**
 * Repositorio genérico local-first: toda escritura actualiza la tabla Y encola la operación
 * en la outbox dentro de la MISMA transacción (nunca queda un cambio sin sincronizar).
 */
import type { Table } from 'dexie';
import type { UserDb } from './db';
import type { SyncMeta, SyncTable } from './schema';

export type NewRecord<T extends SyncMeta> = Omit<T, keyof SyncMeta> & Partial<Pick<T, 'id'>>;

export function nowIso(): string {
  return new Date().toISOString();
}

export function newId(): string {
  return crypto.randomUUID();
}

function table<T extends SyncMeta>(db: UserDb, name: SyncTable): Table<T, string> {
  return db.table(name) as Table<T, string>;
}

/** Crea un registro nuevo para el usuario dueño de la base. */
export async function create<T extends SyncMeta>(db: UserDb, name: SyncTable, data: NewRecord<T>): Promise<T> {
  const ts = nowIso();
  const rec = { ...data, id: data.id ?? newId(), userId: db.userId, createdAt: ts, updatedAt: ts, deletedAt: null, version: 1 } as unknown as T;
  await db.transaction('rw', [db.table(name), db.outbox], async () => {
    await table<T>(db, name).add(rec);
    await db.outbox.add({ table: name, recordId: rec.id, op: 'upsert', queuedAt: ts, attempts: 0 });
  });
  return rec;
}

/** Actualiza campos de un registro existente (last-write-wins por updatedAt/version). */
export async function update<T extends SyncMeta>(db: UserDb, name: SyncTable, id: string, patch: Partial<Omit<T, keyof SyncMeta>>): Promise<T> {
  const ts = nowIso();
  let out!: T;
  await db.transaction('rw', [db.table(name), db.outbox], async () => {
    const t = table<T>(db, name);
    const cur = await t.get(id);
    if (!cur || cur.deletedAt) throw new Error(`Registro no encontrado: ${name}/${id}`);
    if (cur.userId !== db.userId) throw new Error('Acceso denegado');
    out = { ...cur, ...patch, updatedAt: ts, version: cur.version + 1 };
    await t.put(out);
    await db.outbox.add({ table: name, recordId: id, op: 'upsert', queuedAt: ts, attempts: 0 });
  });
  return out;
}

/** Borrado lógico (tombstone) para que la eliminación se propague al servidor. */
export async function softDelete(db: UserDb, name: SyncTable, id: string): Promise<void> {
  const ts = nowIso();
  await db.transaction('rw', [db.table(name), db.outbox], async () => {
    const t = table<SyncMeta>(db, name);
    const cur = await t.get(id);
    if (!cur) return;
    if (cur.userId !== db.userId) throw new Error('Acceso denegado');
    await t.put({ ...cur, deletedAt: ts, updatedAt: ts, version: cur.version + 1 });
    await db.outbox.add({ table: name, recordId: id, op: 'delete', queuedAt: ts, attempts: 0 });
  });
}

/** Registros vivos (no borrados) de una tabla. */
export async function listAlive<T extends SyncMeta>(db: UserDb, name: SyncTable): Promise<T[]> {
  return (await table<T>(db, name).toArray()).filter((r) => !r.deletedAt);
}

/** Registros vivos de un día (tablas con índice `date`). */
export async function listByDate<T extends SyncMeta & { date: string }>(db: UserDb, name: SyncTable, date: string): Promise<T[]> {
  return (await table<T>(db, name).where('date').equals(date).toArray()).filter((r) => !r.deletedAt);
}

export async function listByDateRange<T extends SyncMeta & { date: string }>(db: UserDb, name: SyncTable, from: string, to: string): Promise<T[]> {
  return (await table<T>(db, name).where('date').between(from, to, true, true).toArray()).filter((r) => !r.deletedAt);
}
