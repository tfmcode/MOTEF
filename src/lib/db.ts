// src/lib/db.ts
import {
  Pool,
  QueryConfig,
  QueryArrayConfig,
  QueryResult,
  QueryResultRow,
  Submittable,
} from "pg";

const MAX_POOL_CONNECTIONS = parseInt(process.env.DB_MAX_POOL_SIZE || "10", 10);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: MAX_POOL_CONNECTIONS,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

if (
  process.env.NODE_ENV === "development" &&
  process.env.DEBUG_SQL === "true"
) {
  const originalQuery = pool.query.bind(pool) as Pool["query"];

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

  function loggedQuery(...args: unknown[]) {
    const first = args[0];

    if (typeof first === "string") {
      console.log("🔍 SQL Query:", first);
      const maybeValues = args[1];
      if (Array.isArray(maybeValues)) {
        console.log("🔍 Values:", maybeValues);
      }
    } else if (hasText(first)) {
      console.log("🔍 SQL Query:", first.text);
      if (hasValues(first)) {
        console.log("🔍 Values:", first.values);
      }
    } else {
      console.log("🔍 SQL Query (stream/config):", first);
    }

    return (originalQuery as unknown as (...a: unknown[]) => unknown)(
      ...args
    ) as unknown;
  }

  (pool as { query: Pool["query"] }).query = loggedQuery as Pool["query"];
}

export default pool;
