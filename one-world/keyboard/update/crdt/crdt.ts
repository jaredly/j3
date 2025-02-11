import { serde, SerDe } from './serde';

interface CRDT {
    kind: string;
    merge(other: ThisType<this>): ThisType<this>;
}

export class GMap<T extends CRDT & SerDe> implements CRDT, SerDe {
    static kind = 'GMAP';
    kind = 'GMAP';
    map: Record<string, T>;

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
        return { map };
    }

    static fromJSON(data: any) {
        if (!data || typeof data.map !== 'object') return null;
        // AGH this won't do the instantiation. of the things.
        return new GMap(data.map);
    }
}

@serde
export class LRW<T> implements CRDT, SerDe {
    static kind = 'LRW';
    kind = 'LRW';
    value: T;
    ts: string;

    constructor(value: T, ts: string) {
        this.value = value;
        this.ts = ts;
    }

    merge(other: LRW<T>): LRW<T> {
        return other.ts < this.ts ? this : other;
    }

    toJSON() {
        return { value: this.value, ts: this.ts };
    }

    static fromJSON(data: any) {
        if (!data || data.value === undefined) return null;
        if (typeof data.ts !== 'string') return null;
        return new LRW(data.value, data.ts);
    }
}
