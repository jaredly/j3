import { BunSQLiteDatabase, drizzle } from 'drizzle-orm/bun-sqlite';
import { eq } from 'drizzle-orm';
import * as tb from './schema';
import { createBLAKE3 } from 'hash-wasm';
import sqlite from 'bun:sqlite';
import {
    Module,
    hashit,
    hashModule,
    Commit,
    hashCommit,
    Branch,
} from './hashings';

import { test, expect } from 'bun:test';
import { seed } from './seed';

test('doing a little seed I guess', async () => {
    const db = sqlite.open(':memory:');
    await seed(drizzle(db));
    // yay done
});
