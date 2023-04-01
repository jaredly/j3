import { Node } from '../types/cst';
import { AutoCompleteResult, Ctx } from './Ctx';
import { compareScores, fuzzyScore } from './fuzzy';
import { ensure } from './nodeToExpr';
import { allTerms, allTypes } from './resolveExpr';

export function populateAutocomplete(ctx: Ctx, text: string, form: Node) {
    const results = allTerms(ctx);
    const withScores = results
        .map((result) => ({
            result,
            score: fuzzyScore(0, text, result.name),
        }))
        .filter(({ score }) => score.full)
        .sort((a, b) => compareScores(a.score, b.score));
    ctx.display[form.loc.idx].autoComplete = [
        ...withScores.map(
            ({ result }) =>
                ({
                    type: 'replace',
                    text: result.name,
                    node: { type: 'hash', hash: result.hash },
                    // { type: 'identifier', text: '', hash: result.hash },
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
                    type: 'replace',
                    text: result.name,
                    node: { type: 'hash', hash: result.hash },
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
