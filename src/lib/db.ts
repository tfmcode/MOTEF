// src/lib/db.ts
import {
  Pool,
  QueryConfig,
  QueryArrayConfig,
  QueryResult,
  QueryResultRow,
  Submittable,
} from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

if (
  process.env.NODE_ENV === "development" &&
  process.env.DEBUG_SQL === "true"
) {
  // Guardás el original preservando tipo y this
  const originalQuery = pool.query.bind(pool) as Pool["query"];

  // Helpers de tipo (sin 'any')
  type Values = ReadonlyArray<unknown>;

  const hasText = (x: unknown): x is { text: string } =>
    typeof x === "object" &&
    x !== null &&
    "text" in x &&
    typeof (x as { text: unknown }).text === "string";

  const hasValues = (x: unknown): x is { values: Values } =>
    typeof x === "object" &&
    x !== null &&
    "values" in x &&
    Array.isArray((x as { values: unknown }).values);

  // -------- Overloads compatibles con pg (sin 'any') --------
  function loggedQuery<
    R extends QueryResultRow = QueryResultRow,
    I extends Values = Values
  >(queryConfig: QueryArrayConfig<I>, values?: I): Promise<QueryResult<R>>;
  function loggedQuery<
    R extends QueryResultRow = QueryResultRow,
    I extends Values = Values
  >(queryConfig: QueryConfig<I>): Promise<QueryResult<R>>;
  function loggedQuery<
    R extends QueryResultRow = QueryResultRow,
    I extends Values = Values
  >(queryText: string, values?: I): Promise<QueryResult<R>>;
  function loggedQuery<T extends Submittable>(queryStream: T): T;

  // Implementación única (sin 'any')
  function loggedQuery(...args: unknown[]) {
    const first = args[0];

    if (typeof first === "string") {
      // queryText, values?
      // eslint-disable-next-line no-console
      console.log("🔍 SQL Query:", first);
      const maybeValues = args[1];
      if (Array.isArray(maybeValues)) {
        // eslint-disable-next-line no-console
        console.log("🔍 Values:", maybeValues);
      }
    } else if (hasText(first)) {
      // QueryConfig | QueryArrayConfig
      // eslint-disable-next-line no-console
      console.log("🔍 SQL Query:", first.text);
      if (hasValues(first)) {
        // eslint-disable-next-line no-console
        console.log("🔍 Values:", first.values);
      }
    } else {
      // Stream u otras variantes
      // eslint-disable-next-line no-console
      console.log("🔍 SQL Query (stream/config):", first);
    }

    // Reenviamos al original, manteniendo types sin usar 'any'
    return (originalQuery as unknown as (...a: unknown[]) => unknown)(
      ...args
    ) as unknown;
  }

  // Asignamos con el tipo exacto
  (pool as { query: Pool["query"] }).query = loggedQuery as Pool["query"];
}

export default pool;
