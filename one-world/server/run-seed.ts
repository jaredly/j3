import sqlite from 'bun:sqlite';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { seed } from './seed';

seed(drizzle(sqlite.open(process.env.DB_FILE_NAME!)));
