import 'dotenv/config';
import { and, eq, sql } from 'drizzle-orm';
import { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { genId } from '../client/cli/edit/newDocument';
import { DocStage, HashedMod, HistoryItem, Mod } from '../shared/state2';
import { Toplevel } from '../shared/toplevels';
import * as tb from './schema';
import { Updated } from '../shared/update2';
import { hashit, norm, normDoc } from './hashings';
import { createBLAKE3 } from 'hash-wasm';
import { DrizzleDb, getEditedDoc, getHeadRoot } from './drizzle';

export const updateRoot = async (
    db: DrizzleDb,
    rootHash: string,
    doc: DocStage,
) => {
    const root = await db.query.modules.findFirst({
        where: and(eq(tb.modules.id, 'root'), eq(tb.modules.hash, rootHash)),
    });
    if (!root) throw new Error(`no root`);
    if (!doc.modules[doc.id]) throw new Error(`doc doesnt have its own module`);
    const modules: Record<string, Mod> = { ...doc.modules };

    // Expanding all relevant parents
    for (let key of Object.keys(doc.modules)) {
        let pmod = null as null | Mod;
        for (let parent of doc.modules[key].path) {
            if (!modules[parent]) {
                if (!pmod) throw new Error(`cant get tto ${parent}`);
                let self = Object.values(pmod.submodules).find(
                    (m) => m.id === parent,
                );
                if (!self)
                    throw new Error(
                        `self ${parent} not found in parent ${pmod.id}`,
                    );
                const got = await db.query.modules.findFirst({
                    where: and(
                        eq(tb.modules.id, parent),
                        eq(tb.modules.hash, self.hash),
                    ),
                });
                if (!got)
                    throw new Error(
                        `module not in db ${parent} with hash ${self.hash}`,
                    );
                modules[parent] = {
                    ...got,
                    ts: { created: got.created, updated: got.updated },
                };
            } else {
                pmod = modules[parent];
            }
        }
    }

    const hasher = await createBLAKE3();
    const hashed: Record<string, HashedMod> = {};
    const process = (id: string): string => {
        let mod = modules[id];
        if (!mod) throw new Error('no mod');
        mod = { ...mod, submodules: { ...mod.submodules } };
        Object.keys(mod.submodules).forEach((key) => {
            const { id: child } = mod.submodules[key];
            if (modules[child]) {
                mod.submodules[key] = { id: child, hash: process(child) };
            }
        });

        let docHash = mod.docHash;
        if (id === doc.id) {
            if (!doc.hash) throw new Error(`doc needs to be hashed first`);
            docHash = doc.hash;
        }
        if (docHash == null) {
            throw new Error(`mod doesnt have a doc hash`);
        }

        const hash = hashit(normMod(mod), hasher);
        hashed[id] = { ...mod, hash, docHash };
        return hash;
    };
    process('root');

    await db.insert(tb.modules).values(
        Object.values(hashed).map((mod) => ({
            ...mod,
            created: mod.ts.created,
            updated: mod.ts.updated,
        })),
    );

    return hashed.root.hash;
};

const normMod = (mod: Mod) => {
    return norm({ ...mod, hash: undefined, ts: undefined });
};

const normModule = (mod: typeof tb.modules.$inferSelect) => {
    return norm({
        ...mod,
        hash: undefined,
        created: undefined,
        updated: undefined,
    });
};

export const commitDoc = async (db: DrizzleDb, id: string, branch: string) => {
    const ds = await getEditedDoc(db, id, branch);
    const root = await getHeadRoot(db, branch);
    if (!ds) throw new Error(`doc not edited ${id}`);
    if (root !== ds.root) throw new Error(`need to merge before committing!`);

    // Commit toplevels

    // Hash and save doc

    const nroot = await updateRoot(db, root, ds);
};

// hrm
