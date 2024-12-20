import { IdCursor } from './utils';

export function cursorSides(cursor: IdCursor, start: number | undefined) {
    const left = start != null ? Math.min(start, cursor.end) : cursor.end;
    const right = start != null ? Math.max(start, cursor.end) : cursor.end;
    return { left, right };
}
