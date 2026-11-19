import type { Config, Context } from '@netlify/functions'
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { and, eq, gt, sql } from 'drizzle-orm'
import { getDatabase } from '@netlify/database'
import { z } from 'zod'
import { database } from '../../db/index'
import { settings, ballots, sessions, attempts } from '../../db/schema'
import { initialElection, type Election } from '../../src/lib/election'

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex')
}
function reply(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}
function fail(message: string, status = 400) {
  return reply({ error: message }, status)
}
const electionSchema = z.object({
  title: z.string().trim().min(5).max(140),
  background: z.enum(['emerald', 'midnight', 'burgundy']),
  open: z.boolean(),
  categories: z
    .array(
      z.object({
        id: z.string().max(20),
        name: z.string().trim().min(3).max(120),
      }),
    )
    .length(7),
  participants: z
    .array(
      z.object({
        id: z.string().min(1).max(60),
        name: z.string().trim().min(2).max(140),
      }),
    )
    .min(1)
    .max(300),
})
export default async (req: Request, context: Context) => {
  try {
    const db = database()
    const action = new URL(req.url).pathname.split('/').pop()
    if (req.method !== 'GET') {
      if (req.headers.get('origin') !== new URL(req.url).origin)
        return fail('Permintaan tidak dibenarkan.', 403)
      if (Number(req.headers.get('content-length') || 0) > 100000)
        return fail('Data terlalu besar.', 413)
    }
    if (action === 'login' && req.method === 'POST') {
      const password = Netlify.env.get('ADMIN_PASSWORD')
      if (!password) return fail('Kata laluan admin belum dikonfigurasi.', 503)
      const key = hash(context.ip || 'unknown')
      const [attempt] = await db
        .insert(attempts)
        .values({ key, count: 1, expiresAt: new Date(Date.now() + 900000) })
        .onConflictDoUpdate({
          target: attempts.key,
          set: {
            count: sql`CASE WHEN ${attempts.expiresAt} < now() THEN 1 ELSE ${attempts.count} + 1 END`,
            expiresAt: sql`CASE WHEN ${attempts.expiresAt} < now() THEN now() + interval '15 minutes' ELSE ${attempts.expiresAt} END`,
          },
        })
        .returning()
      if (attempt.count > 10)
        return fail('Terlalu banyak cubaan. Cuba lagi selepas 15 minit.', 429)
      const body = await req.json()
      if (
        typeof body.password !== 'string' ||
        !timingSafeEqual(
          Buffer.from(hash(body.password)),
          Buffer.from(hash(password)),
        )
      )
        return fail('Kata laluan tidak tepat.', 401)
      const token = randomBytes(32).toString('hex')
      await db
        .insert(sessions)
        .values({
          tokenHash: hash(token),
          expiresAt: new Date(Date.now() + 28800000),
        })
      context.cookies.set({
        name: 'kpdn_admin',
        value: token,
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 28800,
      })
      await db.delete(attempts).where(eq(attempts.key, key))
      return reply({ ok: true })
    }
    if (['admin', 'save', 'logout'].includes(action || '')) {
      const token = context.cookies.get('kpdn_admin') || ''
      const [session] = await db
        .select()
        .from(sessions)
        .where(
          and(
            eq(sessions.tokenHash, hash(token)),
            gt(sessions.expiresAt, new Date()),
          ),
        )
      if (!session) return fail('Sila log masuk sebagai admin.', 401)
      if (action === 'logout' && req.method === 'POST') {
        await db.delete(sessions).where(eq(sessions.tokenHash, hash(token)))
        context.cookies.delete({ name: 'kpdn_admin', path: '/' })
        return reply({ ok: true })
      }
    }
    await db
      .insert(settings)
      .values({ id: 1, data: initialElection, version: 1 })
      .onConflictDoNothing()
    const [current] = await db.select().from(settings).where(eq(settings.id, 1))
    if (action === 'admin' && req.method === 'GET') {
      const all = await db
        .select({ selections: ballots.selections })
        .from(ballots)
      const counts: Record<
        string,
        Record<string, { name: string; count: number }>
      > = {}
      for (const ballot of all)
        for (const pick of ballot.selections) {
          counts[pick.categoryId] ||= {}
          counts[pick.categoryId][pick.participantId] ||= {
            name: pick.name,
            count: 0,
          }
          counts[pick.categoryId][pick.participantId].count++
        }
      return reply({
        election: current.data,
        version: current.version,
        counts,
        total: all.length,
      })
    }
    if (action === 'save' && req.method === 'POST') {
      const input = z
        .object({
          election: electionSchema,
          version: z.number().int().positive(),
        })
        .parse(await req.json())
      if (
        new Set(input.election.participants.map((p) => p.id)).size !==
          input.election.participants.length ||
        new Set(input.election.participants.map((p) => p.name.toUpperCase()))
          .size !== input.election.participants.length
      )
        return fail('Nama peserta mesti unik.')
      if (
        input.election.categories.some(
          (c, i) => c.id !== initialElection.categories[i].id,
        )
      )
        return fail('Kategori tidak sah.')
      const saved = await db
        .update(settings)
        .set({ data: input.election, version: current.version + 1 })
        .where(and(eq(settings.id, 1), eq(settings.version, input.version)))
        .returning()
      if (!saved.length)
        return fail(
          'Tetapan telah berubah. Muat semula sebelum menyimpan.',
          409,
        )
      return reply({ version: saved[0].version, election: saved[0].data })
    }
    let voter = context.cookies.get('kpdn_voter')
    if (action === 'public' && req.method === 'GET') {
      if (!voter || !/^[a-f0-9]{64}$/.test(voter)) {
        voter = randomBytes(32).toString('hex')
        context.cookies.set({
          name: 'kpdn_voter',
          value: voter,
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 31536000,
        })
      }
      const previous = await db
        .select({ id: ballots.id })
        .from(ballots)
        .where(eq(ballots.voterHash, hash(voter)))
      return reply({
        election: current.data,
        version: current.version,
        voted: !!previous.length,
      })
    }
    if (action === 'vote' && req.method === 'POST') {
      if (!voter || !/^[a-f0-9]{64}$/.test(voter))
        return fail('Sila benarkan kuki dan muat semula halaman.', 403)
      const input = z
        .object({
          version: z.number().int(),
          choices: z.record(z.string(), z.string()),
        })
        .parse(await req.json())
      const client = await getDatabase().pool.connect()
      try {
        await client.query('BEGIN')
        const result = await client.query(
          'SELECT data, version FROM election_settings WHERE id = 1 FOR SHARE',
        )
        const { data, version } = result.rows[0] as {
          data: Election
          version: number
        }
        if (!data.open) {
          await client.query('ROLLBACK')
          return fail('Undian telah ditutup.', 409)
        }
        if (version !== input.version) {
          await client.query('ROLLBACK')
          return fail(
            'Senarai telah dikemas kini. Muat semula halaman dan semak pilihan anda.',
            409,
          )
        }
        const selections = data.categories.map((c) => {
          const p = data.participants.find((p) => p.id === input.choices[c.id])
          return p
            ? { categoryId: c.id, participantId: p.id, name: p.name }
            : null
        })
        if (
          selections.some((p) => !p) ||
          Object.keys(input.choices).length !== 7
        ) {
          await client.query('ROLLBACK')
          return fail('Sila pilih seorang peserta untuk setiap tujuh kategori.')
        }
        const inserted = await client.query(
          'INSERT INTO ballots (id, voter_hash, selections) VALUES ($1, $2, $3::jsonb) ON CONFLICT (voter_hash) DO NOTHING RETURNING id',
          [crypto.randomUUID(), hash(voter), JSON.stringify(selections)],
        )
        await client.query('COMMIT')
        if (!inserted.rows.length)
          return fail('Undian daripada pelayar ini telah diterima.', 409)
        return reply({ ok: true })
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    }
    return fail('Halaman tidak ditemui.', 404)
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError)
      return fail('Sila semak maklumat yang dimasukkan.')
    return fail('Sambungan tidak berjaya. Sila cuba lagi sebentar lagi.', 503)
  }
}
export const config: Config = { path: '/api/election/:action' }
