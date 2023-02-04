import { Node } from '../types/cst';
import { AutoCompleteResult, Ctx } from './Ctx';
import { compareScores, fuzzyScore } from './fuzzy';
import { allTerms } from './resolveExpr';

export function populateAutocomplete(
    ctx: Ctx,
    text: string,
    form: Node,
    prefix: string | undefined,
    suffix: string | undefined,
) {
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
                    text: (prefix || '') + result.name + (suffix || ''),
                    hash: result.hash,
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
