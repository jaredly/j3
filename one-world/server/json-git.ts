import { join } from 'path';
import { Doc, DocStage } from '../shared/state2';
import {
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    writeFileSync,
} from 'fs';
import { genId } from '../client/cli/edit/newDocument';
import { Toplevel } from '../shared/toplevels';
import { Action } from '../shared/action2';
import { Change } from './persistence';
import { update } from '../shared/update2';

export type ServerBackend = {
    docsList(): Promise<{ id: string; title: string }[]>;
    doc(id: string): Promise<DocStage | null>;
    newDoc(title: string): Promise<string>;
    update(action: Action, doc: string): Promise<Change[]>;
};

const loadStage = (dir: string, topPath: (top: string) => string): DocStage => {
    const stage: DocStage = JSON.parse(
        readFileSync(join(dir, 'info.json'), 'utf-8'),
    );
    readdirSync(join(dir, 'toplevels')).forEach((id) => {
        stage.toplevels[id] = JSON.parse(
            readFileSync(join(dir, 'toplevels', id), 'utf-8'),
        );
    });
    Object.values(stage.nodes).forEach((node) => {
        if (node.toplevel && !stage.toplevels[node.toplevel]) {
            console.log('backfill topelvel', node.toplevel);
            stage.toplevels[node.toplevel] = JSON.parse(
                readFileSync(topPath(node.toplevel), 'utf-8'),
            );
        }
    });
    return stage;
};
const saveStage = (stage: DocStage, dir: string) => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(
        join(dir, 'info.json'),
        JSON.stringify({ ...stage, toplevels: {} }),
    );
    mkdirSync(join(dir, 'toplevels'), { recursive: true });
    Object.values(stage.toplevels).forEach((top) => {
        writeFileSync(join(dir, 'toplevels', top.id), JSON.stringify(top));
    });
};

export const jsonGitBackend = (base: string): ServerBackend => {
    const doc = join(base, 'documents');
    const docPath = (id: string) => join(base, 'documents', id);
    const stagePath = (id: string) => join(base, 'stages', id);
    const topPath = (id: string) => join(base, 'toplevels', id);
    const modPath = join(base, 'modules.json');
    return {
        async docsList() {
            mkdirSync(doc, { recursive: true });
            return readdirSync(doc).map((id) => {
                const data: Doc = JSON.parse(readFileSync(docPath(id), 'utf8'));
                return { id, title: data.title };
            });
        },
        async doc(id) {
            if (!existsSync(docPath(id))) return null;
            if (!existsSync(stagePath(id))) {
                const stage: DocStage = {
                    ...JSON.parse(readFileSync(docPath(id), 'utf8')),
                    history: [],
                    toplevels: {},
                };
                Object.values(stage.nodes).forEach((node) => {
                    if (!node.toplevel) {
                        return;
                    }
                    const pt = topPath(node.toplevel);
                    if (!existsSync(node.toplevel)) {
                        throw new Error(
                            `doc references toplevel that doesnt exist`,
                        );
                    }
                    stage.toplevels[node.toplevel] = JSON.parse(
                        readFileSync(pt, 'utf-8'),
                    );
                });
                saveStage(stage, stagePath(id));
                return stage;
            }

            return loadStage(stagePath(id), topPath);
        },
        async newDoc(title) {
            const id = genId();
            const ts = {
                created: Date.now(),
                updated: Date.now(),
            } as const;
            const tid = id + ':top';
            const mid = id + ':mod';

            const doc: Doc = {
                evaluator: [],
                published: false,
                id,
                nextLoc: 2,
                module: mid,
                nodes: { 0: { id: 0, children: [], toplevel: '', ts } },
                nsAliases: {},
                title: title,
                ts,
            };
            const top: Toplevel = {
                id: tid,
                module: mid,
                auxiliaries: [],
                nextLoc: 1,
                nodes: { 0: { type: 'id', loc: 0, text: '' } },
                root: 0,
                ts,
            };
            writeFileSync(docPath(id), JSON.stringify(doc));
            writeFileSync(topPath(tid), JSON.stringify(top));
            const modules = JSON.parse(readFileSync(modPath, 'utf8'));
            modules[mid] = {};
            modules.root = { ...modules.root, [mid]: title };
            writeFileSync(modPath, JSON.stringify(modules));
            return id;
        },

        async update(action, doc) {
            if (!existsSync(stagePath(doc))) {
                throw new Error(`no current stage for doc ${doc}`);
            }
            const stage = loadStage(stagePath(doc), topPath);
            const next = update(stage, action, {
                selections: {},
                toplevels: {},
            });
            saveStage(next, stagePath(doc));
            return [{ type: 'stage', id: doc, stage: next }];
        },
    };
};
