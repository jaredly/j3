export const unique = <T extends string | number>(names: T[]) => {
    const seen: Partial<Record<T, true>> = {};
    return names.filter((k) => (seen[k] ? false : (seen[k] = true)));
};
