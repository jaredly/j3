import { Db } from './tables';

export const transact = async <T>(
    run: Db['run'],
    fn: () => Promise<T>,
): Promise<T> => {
    const id = Math.random().toString(36);
    // console.log(new Error().stack?.split('\n').slice(1).join('\n');
    await run('begin;');
    // console.group('Transaction ' + id);
    let v;
    try {
        v = await fn();
        await run('commit;');
    } catch (err) {
        await run('rollback;');
        throw err;
    }
    // console.log('done', id);
    // console.groupEnd();
    return v;
};

export const transactionQueue = (run: Db['run']) => {
    type Item<T> = {
        fn: () => Promise<T>;
        res: (k: T) => void;
        rej: (err: Error) => void;
    };
    const queue: Item<unknown>[] = [];

    let working = false;
    const process = () => {
        if (working) return;
        if (!queue.length) return;
        working = true;
        const next = queue.pop()!;
        transact(run, next.fn)
            .then(
                (value) => next.res(value),
                (err) => next.rej(err),
            )
            .then(() => {
                working = false;
                process();
            });
    };

    return <T>(fn: () => Promise<T>): Promise<T> => {
        return new Promise((res, rej) => {
            queue.push({ res: res as (t: unknown) => void, rej, fn });
            process();
        });
    };
};
