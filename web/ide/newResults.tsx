import { CompilationResults } from '../../src/to-ast/library';
import { Trace } from './infer/types';

export function newResults(): CompilationResults & {
    tops: {
        [key: number]: {
            summary: string;
            data: Trace[];
            failed: boolean;
            expr?: any;
        };
    };
    typs: { [loc: number]: any };
} {
    return {
        display: {},
        errors: {},
        globalNames: {},
        hashNames: {},
        localMap: {
            terms: {},
            types: {},
        },
        mods: {},
        toplevel: {},
        tops: {},
        typs: {},
    };
}
