import { Node } from '../types/cst';
import { AutoCompleteResult, Ctx } from './Ctx';
import { compareScores, fuzzyScore } from './fuzzy';
import { ensure } from './nodeToExpr';
import { allTerms, allTypes } from './resolveExpr';

export function populateAutocomplete(ctx: Ctx, text: string, form: Node) {
    if (!text.length) return;
    const results = allTerms(ctx);
    const withScores = results
        .map((result) => ({
            result,
            score: fuzzyScore(0, text, result.name),
        }))
        .filter(({ score }) => score.full)
        .sort((a, b) => compareScores(a.score, b.score));
    ensure(ctx.display, form.loc.idx, {}).autoComplete = [
        ...withScores.map(
            ({ result }) =>
                ({
                    type: 'update',
                    text: result.name.split('/').slice(-1)[0],
                    update: {
                        type: text === '[]' ? 'array-hash' : 'hash',
                        // Hmmm shouldn't have any locals, right?
                        hash: result.hash as string,
                    },
                    exact:
                        result.name === text ||
                        result.name.endsWith('/' + text),
                    ann: result.typ,
                } satisfies AutoCompleteResult),
        ),
        ...(withScores.length === 0
            ? [
                  {
                      type: 'info',
                      text: `No terms found matching the name "${text}"`,
                  } satisfies AutoCompleteResult,
              ]
            : []),
    ];
}

export function populateAutocompleteType(ctx: Ctx, text: string, form: Node) {
    const results = allTypes(ctx);
    const withScores = results
        .map((result) => ({
            result,
            score: fuzzyScore(0, text, result.name),
        }))
        .filter(({ score }) => score.full)
        .sort((a, b) => compareScores(a.score, b.score));
    ensure(ctx.display, form.loc.idx, {}).autoComplete = [
        ...withScores.map(
            ({ result }) =>
                ({
                    type: 'update',
                    text: result.name,
                    update: {
                        type: 'hash',
                        hash: result.hash,
                    },
                    exact: result.name === text,
                    ann: result.typ,
                } satisfies AutoCompleteResult),
        ),
        ...(withScores.length === 0
            ? [
                  {
                      type: 'info',
                      text: `No terms found matching the name "${text}"`,
                  } satisfies AutoCompleteResult,
              ]
            : []),
    ];
}
