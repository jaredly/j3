import { Doc, DocStage } from '../shared/state2';
import { Toplevel } from '../shared/toplevels';

export type Change =
    | { type: 'toplevel'; id: string; tl: null | Toplevel }
    | { type: 'document'; id: string; doc: null | Doc }
    | { type: 'stage'; id: string; stage: null | DocStage };
