import type { PoolConfig } from 'pg';

export function postgresPoolConfig(env: NodeJS.ProcessEnv): PoolConfig {
  const connectionString = env.DATABASE_URL;
  if (env.NODE_ENV !== 'production' || !env.PG_CA_CERT) {
    return { connectionString };
  }

  const url = new URL(connectionString!);
  for (const parameter of ['sslmode', 'sslrootcert', 'sslcert', 'sslkey']) {
    url.searchParams.delete(parameter);
  }

  return {
    connectionString: url.toString(),
    ssl: {
      ca: env.PG_CA_CERT.replace(/\\n/g, '\n'),
      rejectUnauthorized: true,
    },
  };
}
