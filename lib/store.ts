import { env } from 'cloudflare:workers';
import { initialState } from './seed';
export function database(){ const db=(env as any).DB; if(!db) throw new Error('Workspace storage is unavailable. Please try again.'); return db; }
export async function readState(){ const db=database(); await db.prepare('INSERT OR IGNORE INTO studio (id,payload,version) VALUES (?,?,0)').bind('portfolio',JSON.stringify(initialState)).run(); const row=await db.prepare('SELECT payload,version FROM studio WHERE id=?').bind('portfolio').first(); return {state:JSON.parse(row.payload),version:row.version}; }
export async function writeState(state:any,version:number){ const result=await database().prepare('UPDATE studio SET payload=?,version=version+1 WHERE id=? AND version=?').bind(JSON.stringify(state),'portfolio',version).run(); if(!result.meta.changes) throw new Error('CONFLICT'); return version+1; }
export function sameOrigin(req:Request){const origin=req.headers.get('origin');return !origin || origin===new URL(req.url).origin;}
