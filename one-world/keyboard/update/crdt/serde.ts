// MARK: SerDe
export interface SerDe<T extends string> {
    kind: T;
    toJSON(): { kind: T; value: any };
}

type SerDeClass<T extends SerDe<K>, K extends string> = {
    kind: K;
    new (...args: any[]): T;
    fromJSON(data: any, registery: Registry): T | null;
};

type Dable = { kind: string; value: any };
export const canDeserialize = (v: any): v is Dable => typeof v === 'object' && v && typeof v.kind === 'string' && 'value' in v;

export type Registry = Record<string, SerDeClass<any, any>>;

const registry: Registry = {};
export const serde = <T extends SerDe<K>, K extends string>(cls: SerDeClass<T, K>) => {
    if (registry[cls.kind]) throw new Error(`double registration for ${cls.kind}`);
    registry[cls.kind] = cls;
};

export const serialize = <K extends string>(v: SerDe<K>) => {
    if (!registry[v.kind]) throw new Error(`kind not registered: ${v.kind}`);
    return JSON.stringify(v.toJSON());
};

export const deserialize = <K extends string>(v: string): SerDe<K> => {
    const data = JSON.parse(v);
    if (!data || typeof data.kind !== 'string' || data.value === undefined) throw new Error(`invalid data, cannot deserialize: ${v}`);
    if (!registry[data.kind]) throw new Error(`kind not registered: ${data.kind}`);
    return registry[data.kind].fromJSON(data.value, registry);
};
