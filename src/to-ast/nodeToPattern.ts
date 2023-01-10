import { Node } from '../types/cst';
import { Pattern, Type } from '../types/ast';
import { Ctx, Local, nextSym } from './to-ast';

export const nodeToPattern = (
    form: Node,
    t: Type,
    ctx: Ctx,
    bindings: Local['terms'],
): Pattern => {
    switch (form.contents.type) {
        case 'identifier': {
            const sym = nextSym(ctx);
            bindings.push({
                name: form.contents.text,
                sym,
                type: t,
            });
            return {
                type: 'local',
                form,
                sym,
            };
        }
        case 'record': {
            const entries: { name: string; value: Pattern }[] = [];
            const prm =
                t.type === 'record'
                    ? t.entries.reduce((map, item) => {
                          map[item.name] = item.value;
                          return map;
                      }, {} as { [key: string]: Type })
                    : null;
            if (
                form.contents.values.length === 1 &&
                form.contents.values[0].contents.type === 'identifier'
            ) {
                const name = form.contents.values[0].contents.text;
                entries.push({
                    name,
                    value: nodeToPattern(
                        form.contents.values[0],
                        prm
                            ? prm[name] ?? {
                                  type: 'unresolved',
                                  form: t.form,
                                  reason: `attribute not in type ${name}`,
                              }
                            : {
                                  type: 'unresolved',
                                  form: t.form,
                                  reason: `type ${t.type} not a record`,
                              },
                        ctx,
                        bindings,
                    ),
                });
            }
            return {
                type: 'record',
                entries,
                form,
            };
        }
        case 'list': {
            if (!form.contents.values.length) {
                return {
                    type: 'record',
                    form,
                    entries: [],
                };
            }
            const [{ contents: first }, ...rest] = form.contents.values;
            if (first.type === 'identifier' && first.text === ',') {
                const prm =
                    t.type === 'record'
                        ? t.entries.reduce((map, item) => {
                              map[item.name] = item.value;
                              return map;
                          }, {} as { [key: string]: Type })
                        : null;
                return {
                    type: 'record',
                    form,
                    entries: rest.map((item, i) => ({
                        name: i.toString(),
                        value: nodeToPattern(
                            item,
                            prm
                                ? prm[i.toString()]
                                : {
                                      type: 'unresolved',
                                      form: t.form,
                                      reason: `type isnt a record (${t.type} ${
                                          t.type === 'unresolved'
                                              ? t.reason
                                              : ''
                                      })`,
                                  },
                            ctx,
                            bindings,
                        ),
                    })),
                };
            }
            if (first.type === 'tag') {
                const argt = t.type === 'tag' ? t.args : null;
                return {
                    type: 'tag',
                    name: first.text,
                    form,
                    args: rest.map((p, i) =>
                        nodeToPattern(
                            p,
                            (argt && argt[i]) ?? {
                                type: 'unresolved',
                                form: t.form,
                                reason: `not a tag`,
                            },
                            ctx,
                            bindings,
                        ),
                    ),
                };
            }
        }
    }
    return { type: 'unresolved', form, reason: 'not impl pat' };
};
