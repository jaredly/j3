// MARK: SerDe
export interface SerDe {
    kind: string;
    toJSON(): any;
}
type SerDeClass<T extends SerDe> = {
    kind: string;
    new (...args: any[]): T;
    fromJSON(data: any): T | null;
};
const registry: Record<string, SerDeClass<any>> = {};
export const serde = <T extends SerDe>(cls: SerDeClass<T>) => {
    if (registry[cls.kind]) throw new Error(`double registration for ${cls.kind}`);
    registry[cls.kind] = cls;
};

export const serialize = (v: SerDe) => {
    if (!registry[v.kind]) throw new Error(`kind not registered: ${v.kind}`);
    return JSON.stringify({
        kind: v.kind,
        value: v.toJSON(),
    });
};
export const deserialize = (v: string) => {
    const data = JSON.parse(v);
    if (!data || typeof data.kind !== 'string' || typeof data.value !== 'object') throw new Error(`invalid data, cannot deserialize: ${v}`);
    if (!registry[data.kind]) throw new Error(`kind not registered: ${data.kind}`);
    return registry[data.kind].fromJSON(data.value);
};
