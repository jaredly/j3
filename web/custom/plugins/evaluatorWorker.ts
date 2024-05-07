import { WorkerPlugin } from '../UIState';
import { add } from '../worker/add';

export const evaluatorWorker: WorkerPlugin<
    any,
    { expr: any; id: number },
    any
> = {
    test(node) {
        return true;
    },
    parse(node, errors_, evaluator) {
        debugger;
        const { expr, errors } = evaluator.parseExpr(node);
        if (!expr) {
            console.error('Evaluator plugin unable to parse', node);
            console.error(errors);
            return null; // 'Evaluator plugin unable to parse: ' + JSON.stringify(errors);
        }
        errors.forEach(([k, v]) => add(errors_, k, v));
        return {
            parsed: { expr, id: node.loc },
            deps: evaluator.analysis?.externalsExpr(expr) ?? [],
        };
    },
    infer(parsed, evaluator, tenv) {
        const { result, typesAndLocs, usages } = evaluator.inference!.inferExpr(
            parsed.expr,
            tenv,
        );
        // hoverrrrr pleeeeease
        return {
            result: result.type === 'ok' ? { type: 'ok', value: null } : result,
            typesAndLocs,
            usages,
        };
    },
    hasErrors(results) {
        return false;
    },

    // So is this where ... we would kick things off?
    // ORRR what if the `store` is responsible for
    // keeping a map of evaluators,
    // and we just do a thing where it's like
    // "send your evaluator..."
    // OK SO
    process(parsed, meta, evaluator) {
        // if (!parsed) {

        // const { expr, errors } = evaluator.parseExpr(node);
        return 'hello';
        // }
        // if (!options || !options.endsWith('.js')) {
        //     // throw new Error(`Bad name`);
        //     return {
        //         type: 'error',
        //         message: options ? `Name must end in .js` : `Please set a name`,
        //     };
        // }
        // if (
        //     node.type === 'blank' ||
        //     node.type === 'comment' ||
        //     node.type === 'comment-node'
        // ) {
        //     return {
        //         type: 'error',
        //         message: `Expression must not be blank or comment`,
        //     };
        // }
        // if (!evaluator.toFile) {
        //     return { type: 'error', message: `No toFile for evaluator` };
        // }
        // let text;
        // try {
        //     text = evaluator.toFile!(state, id).js;
        // } catch (err) {
        //     console.error(err);
        //     return {
        //         type: 'error',
        //         message: `Failed ` + (err as Error).message,
        //     };
        // }
        // return { type: 'success', text }; // Date.now();
    },
};
