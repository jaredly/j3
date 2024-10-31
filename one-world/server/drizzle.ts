import 'dotenv/config';
import { ServerBackend } from './json-git';
import { drizzle } from 'drizzle-orm/bun-sqlite';

export const drizzleBackend = (): ServerBackend => {
    const db = drizzle(process.env.DB_FILE_NAME!);
};
