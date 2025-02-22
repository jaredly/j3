import { Registry, serde, SerDe } from './serde';

export interface CRDT {
    kind: string;
    merge(other?: ThisType<this>): ThisType<this>;
}

@serde
export class GMap<T extends CRDT & SerDe<any>> implements CRDT, SerDe<'GMAP'> {
    static kind = 'GMAP';
    readonly kind = 'GMAP' as const;
    readonly map: Record<string, T>;

    constructor(map: Record<string, T>) {
        this.map = map;
    }

    merge(other: GMap<T>): GMap<T> {
        const combined = { ...this.map };
        Object.entries(other.map).forEach(([k, v]) => {
            if (!combined[k]) {
                combined[k] = v;
            } else {
                combined[k] = combined[k].merge(v) as T;
            }
        });
        return new GMap(combined);
    }

    toJSON() {
        const map: Record<string, any> = {};
        Object.entries(this.map).forEach(([k, v]) => {
            map[k] = v.toJSON();
        });
        return { kind: this.kind, value: map };
    }

    static fromJSON(value: any, registry: Registry) {
        if (!value || typeof value !== 'object') return null;
        const map: Record<string, any> = {};
        Object.entries(value).forEach(([k, v]) => {
            if (!v || typeof v !== 'object' || !('kind' in v) || !('value' in v) || typeof v.kind !== 'string') throw new Error(`not kinded`);
            const res = registry[v.kind].fromJSON(v.value, registry);
            if (res === null) throw new Error(`unable to deserialize sub item`);
            map[k] = res;
        });
        return new GMap(map);
    }
}

@serde
export class LRW<T> implements CRDT, SerDe<'LRW'> {
    static kind = 'LRW';
    readonly kind = 'LRW' as const;
    readonly value: T;
    readonly ts: string;

    constructor(value: T, ts: string) {
        this.value = value;
        this.ts = ts;
    }

    merge(other?: LRW<T>): LRW<T> {
        return !other ? this : other.ts < this.ts ? this : other;
    }

    set(value: T, ts: string) {
        return new LRW<T>(value, ts);
    }

    toJSON() {
        return { kind: this.kind, value: { value: this.value, ts: this.ts } };
    }

    static fromJSON(data: any) {
        if (!data || data.value === undefined) return null;
        if (typeof data.ts !== 'string') return null;
        return new LRW(data.value, data.ts);
    }
}
