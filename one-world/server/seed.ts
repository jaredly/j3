import { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { createBLAKE3 } from 'hash-wasm';
import {
    Branch,
    Commit,
    hashCommit,
    hashit,
    hashModule,
    Module,
} from './hashings';
import * as tb from './schema';

export async function seed(db: BunSQLiteDatabase<Record<string, never>>) {
    const hasher = await createBLAKE3();

    const module: Module = {
        id: 'root',
        submodules: {},
        toplevels: {},
        documents: {},
        evaluators: [],
        assets: {},
        artifacts: {},
        created: Date.now(),
        updated: Date.now(),
    };
    const moduleHash = hashit(hashModule(module), hasher);

    const commit: Commit = {
        root: moduleHash,
        message: 'Initial',
        author: 'me',
        created: Date.now(),
    };
    const commitHash = hashit(hashCommit(commit), hasher);

    const branch: Branch = {
        name: 'main',
        head: commitHash,
    };

    await db.insert(tb.modules).values({
        ...module,
        hash: moduleHash,
        submodules: JSON.stringify(module.submodules),
        toplevels: JSON.stringify(module.toplevels),
        documents: JSON.stringify(module.documents),
        evaluators: JSON.stringify(module.evaluators),
    });

    await db.insert(tb.commits).values({
        ...commit,
        hash: commitHash,
    });

    await db.insert(tb.branches).values(branch);

    // await db.insert(tb.modules).values();

    //     const user: typeof usersTable.$inferInsert = {
    //         name: 'John',
    //         age: 30,
    //         email: 'john@example.com',
    //     };

    //     await db.insert(usersTable).values(user);
    //     console.log('New user created!');

    //     const users = await db.select().from(usersTable);
    //     console.log('Getting all users from the database: ', users);
    //     /*
    //   const users: {
    //     id: number;
    //     name: string;
    //     age: number;
    //     email: string;
    //   }[]
    //   */

    //     await db
    //         .update(usersTable)
    //         .set({
    //             age: 31,
    //         })
    //         .where(eq(usersTable.email, user.email));
    //     console.log('User info updated!');

    //     await db.delete(usersTable).where(eq(usersTable.email, user.email));
    //     console.log('User deleted!');
}
