export const add = <K extends string | number, T>(
    obj: Record<K, T[]>,
    k: K,
    item: T,
) => {
    if (!obj) return;
    if (!obj[k]) obj[k] = [item];
    else obj[k].push(item);
};
