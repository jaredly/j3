export const filterNulls = <T,>(
    value: T,
): value is Exclude<T, null | undefined | void> => value != null;
