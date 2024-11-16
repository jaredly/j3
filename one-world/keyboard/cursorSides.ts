import { IdCursor } from './utils';

export function cursorSides(cursor: IdCursor) {
    const left = cursor.start ? Math.min(cursor.start, cursor.end) : cursor.end;
    const right = cursor.start ? Math.max(cursor.start, cursor.end) : cursor.end;
    return { left, right };
}
