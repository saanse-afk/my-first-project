import { Pool, QueryResult, QueryResultRow } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
})

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now()
  try {
    const result = await pool.query<T>(text, params)
    const duration = Date.now() - start
    if (process.env.NODE_ENV === 'development') {
      console.log('[db] query', { text, duration, rows: result.rowCount })
    }
    return result
  } catch (err) {
    console.error('[db] query error', { text, err })
    throw err
  }
}

export default pool
