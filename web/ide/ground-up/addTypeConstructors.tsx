import { arr, type_, unwrapArray } from './round-1/parse';

export function addTypeConstructors(
    stmt: {
        type: 'sdeftype';
        0: string;
        1: arr<{
            type: ',';
            0: string;
            1: { type: ','; 0: arr<type_>; 1: number };
        }>;
    },
    env: { [key: string]: any },
) {
    unwrapArray(stmt[1]).forEach((constr) => {
        const cname = constr[0];
        const next = (args: arr<type_>) => {
            if (args.type === 'nil') {
                return (values: any[]) => ({
                    type: cname,
                    ...values,
                });
            }
            return (values: any[]) => (arg: any) =>
                next(args[1])([...values, arg]);
        };
        env[cname] = next(constr[1][0])([]);
    });
}
